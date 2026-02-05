// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SupplyChainSettlement
 * @dev Smart contract for automated supply chain settlements on ATLAS platform
 * @notice Handles performance-based payments between suppliers and buyers
 */
contract SupplyChainSettlement {
    
    // ============ STRUCTS ============
    
    struct Settlement {
        uint256 id;
        address supplier;
        address buyer;
        uint256 amount;
        uint256 performanceThreshold; // e.g., 995 = 99.5% OTIF
        uint256 bonusAmount;
        uint256 penaltyAmount;
        SettlementStatus status;
        uint256 createdAt;
        uint256 settledAt;
        string ipfsHash; // Reference to off-chain data
    }
    
    struct PerformanceRecord {
        uint256 settlementId;
        uint256 otifScore; // On-Time In-Full score (0-1000 = 0-100%)
        uint256 defectRate; // Defect rate (0-1000 = 0-100%)
        uint256 timestamp;
        address reportedBy;
        bool verified;
    }
    
    enum SettlementStatus {
        Created,
        Active,
        PendingVerification,
        Completed,
        Disputed,
        Cancelled
    }
    
    // ============ STATE VARIABLES ============
    
    address public owner;
    address public oracle; // Trusted oracle for performance data
    uint256 public settlementCount;
    uint256 public totalSettledVolume;
    
    mapping(uint256 => Settlement) public settlements;
    mapping(uint256 => PerformanceRecord) public performanceRecords;
    mapping(address => uint256[]) public supplierSettlements;
    mapping(address => uint256[]) public buyerSettlements;
    
    // ============ EVENTS ============
    
    event SettlementCreated(
        uint256 indexed id,
        address indexed supplier,
        address indexed buyer,
        uint256 amount
    );
    
    event PerformanceReported(
        uint256 indexed settlementId,
        uint256 otifScore,
        uint256 defectRate
    );
    
    event SettlementExecuted(
        uint256 indexed id,
        uint256 finalAmount,
        bool bonusApplied,
        bool penaltyApplied
    );
    
    event DisputeRaised(
        uint256 indexed settlementId,
        address indexed raisedBy,
        string reason
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyOracle() {
        require(msg.sender == oracle, "Not oracle");
        _;
    }
    
    modifier settlementExists(uint256 _id) {
        require(_id > 0 && _id <= settlementCount, "Settlement does not exist");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _oracle) {
        owner = msg.sender;
        oracle = _oracle;
        settlementCount = 0;
        totalSettledVolume = 0;
    }
    
    // ============ MAIN FUNCTIONS ============
    
    /**
     * @dev Create a new settlement agreement
     * @param _supplier Address of the supplier
     * @param _performanceThreshold OTIF threshold (e.g., 995 = 99.5%)
     * @param _bonusAmount Bonus if performance exceeds threshold
     * @param _penaltyAmount Penalty if performance below threshold
     * @param _ipfsHash IPFS hash of detailed contract terms
     */
    function createSettlement(
        address _supplier,
        uint256 _performanceThreshold,
        uint256 _bonusAmount,
        uint256 _penaltyAmount,
        string memory _ipfsHash
    ) external payable returns (uint256) {
        require(_supplier != address(0), "Invalid supplier");
        require(msg.value > 0, "Must deposit funds");
        require(_performanceThreshold <= 1000, "Threshold max 100%");
        
        settlementCount++;
        
        settlements[settlementCount] = Settlement({
            id: settlementCount,
            supplier: _supplier,
            buyer: msg.sender,
            amount: msg.value,
            performanceThreshold: _performanceThreshold,
            bonusAmount: _bonusAmount,
            penaltyAmount: _penaltyAmount,
            status: SettlementStatus.Active,
            createdAt: block.timestamp,
            settledAt: 0,
            ipfsHash: _ipfsHash
        });
        
        supplierSettlements[_supplier].push(settlementCount);
        buyerSettlements[msg.sender].push(settlementCount);
        
        emit SettlementCreated(settlementCount, _supplier, msg.sender, msg.value);
        
        return settlementCount;
    }
    
    /**
     * @dev Report performance metrics (oracle only)
     * @param _settlementId ID of the settlement
     * @param _otifScore On-Time In-Full score (0-1000)
     * @param _defectRate Defect rate (0-1000)
     */
    function reportPerformance(
        uint256 _settlementId,
        uint256 _otifScore,
        uint256 _defectRate
    ) external onlyOracle settlementExists(_settlementId) {
        Settlement storage s = settlements[_settlementId];
        require(s.status == SettlementStatus.Active, "Not active");
        require(_otifScore <= 1000 && _defectRate <= 1000, "Invalid scores");
        
        performanceRecords[_settlementId] = PerformanceRecord({
            settlementId: _settlementId,
            otifScore: _otifScore,
            defectRate: _defectRate,
            timestamp: block.timestamp,
            reportedBy: msg.sender,
            verified: true
        });
        
        s.status = SettlementStatus.PendingVerification;
        
        emit PerformanceReported(_settlementId, _otifScore, _defectRate);
    }
    
    /**
     * @dev Execute settlement based on reported performance
     * @param _settlementId ID of the settlement to execute
     */
    function executeSettlement(uint256 _settlementId) external settlementExists(_settlementId) {
        Settlement storage s = settlements[_settlementId];
        require(s.status == SettlementStatus.PendingVerification, "Not pending");
        require(msg.sender == s.buyer || msg.sender == owner, "Not authorized");
        
        PerformanceRecord memory perf = performanceRecords[_settlementId];
        require(perf.verified, "Performance not verified");
        
        uint256 finalAmount = s.amount;
        bool bonusApplied = false;
        bool penaltyApplied = false;
        
        // Apply bonus if OTIF exceeds threshold
        if (perf.otifScore >= s.performanceThreshold && perf.defectRate <= 50) { // <5% defect
            finalAmount += s.bonusAmount;
            bonusApplied = true;
        }
        // Apply penalty if OTIF below threshold
        else if (perf.otifScore < s.performanceThreshold - 50) { // >5% below target
            if (s.penaltyAmount < finalAmount) {
                finalAmount -= s.penaltyAmount;
                penaltyApplied = true;
            }
        }
        
        s.status = SettlementStatus.Completed;
        s.settledAt = block.timestamp;
        totalSettledVolume += finalAmount;
        
        // Transfer to supplier
        (bool success, ) = s.supplier.call{value: finalAmount}("");
        require(success, "Transfer failed");
        
        // Return excess to buyer if penalty applied
        if (penaltyApplied && s.penaltyAmount > 0) {
            (bool refundSuccess, ) = s.buyer.call{value: s.penaltyAmount}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit SettlementExecuted(_settlementId, finalAmount, bonusApplied, penaltyApplied);
    }
    
    /**
     * @dev Raise a dispute on a settlement
     * @param _settlementId ID of the settlement
     * @param _reason Reason for dispute
     */
    function raiseDispute(uint256 _settlementId, string memory _reason) external settlementExists(_settlementId) {
        Settlement storage s = settlements[_settlementId];
        require(msg.sender == s.supplier || msg.sender == s.buyer, "Not party to settlement");
        require(s.status == SettlementStatus.Active || s.status == SettlementStatus.PendingVerification, "Cannot dispute");
        
        s.status = SettlementStatus.Disputed;
        
        emit DisputeRaised(_settlementId, msg.sender, _reason);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getSettlement(uint256 _id) external view returns (Settlement memory) {
        return settlements[_id];
    }
    
    function getPerformanceRecord(uint256 _settlementId) external view returns (PerformanceRecord memory) {
        return performanceRecords[_settlementId];
    }
    
    function getSupplierSettlements(address _supplier) external view returns (uint256[] memory) {
        return supplierSettlements[_supplier];
    }
    
    function getBuyerSettlements(address _buyer) external view returns (uint256[] memory) {
        return buyerSettlements[_buyer];
    }
    
    function getContractStats() external view returns (
        uint256 _settlementCount,
        uint256 _totalVolume,
        address _oracle
    ) {
        return (settlementCount, totalSettledVolume, oracle);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function setOracle(address _newOracle) external onlyOwner {
        require(_newOracle != address(0), "Invalid oracle");
        oracle = _newOracle;
    }
    
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid owner");
        owner = _newOwner;
    }
    
    // Emergency withdrawal (owner only, for stuck funds)
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
    
    receive() external payable {}
}
