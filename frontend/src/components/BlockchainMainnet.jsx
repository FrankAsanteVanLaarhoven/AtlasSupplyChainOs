import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link2, Shield, Clock, ArrowUpRight, ArrowDownLeft, CheckCircle, Loader, AlertTriangle, Wallet, Globe, RefreshCw, ExternalLink, FileText, Plus, Send, Eye, X, Play, AlertCircle, List } from 'lucide-react';
import { ethers } from 'ethers';

// Sepolia testnet configuration
const SEPOLIA_CONFIG = {
  chainId: 11155111,
  name: 'Sepolia',
  rpcUrl: 'https://1rpc.io/sepolia',
  explorerUrl: 'https://sepolia.etherscan.io',
  symbol: 'ETH'
};

// Deployed contract address
const CONTRACT_ADDRESS = '0xC06C4abf2e7E11D203cA0CDa7b821Fb2aCA4ceA2';

// Contract ABI
const CONTRACT_ABI = [
  "function createSettlement(address _supplier, uint256 _performanceThreshold, uint256 _bonusAmount, uint256 _penaltyAmount, string memory _ipfsHash) external payable returns (uint256)",
  "function reportPerformance(uint256 _settlementId, uint256 _otifScore, uint256 _defectRate) external",
  "function executeSettlement(uint256 _settlementId) external",
  "function raiseDispute(uint256 _settlementId, string memory _reason) external",
  "function getSettlement(uint256 _id) external view returns (tuple(uint256 id, address supplier, address buyer, uint256 amount, uint256 performanceThreshold, uint256 bonusAmount, uint256 penaltyAmount, uint8 status, uint256 createdAt, uint256 settledAt, string ipfsHash))",
  "function settlementCount() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function oracle() external view returns (address)",
  "event SettlementCreated(uint256 indexed id, address indexed supplier, address indexed buyer, uint256 amount)",
  "event SettlementExecuted(uint256 indexed id, uint256 finalAmount, bool bonusApplied, bool penaltyApplied)"
];

const SETTLEMENT_STATUS = ['Created', 'Active', 'PendingVerification', 'Completed', 'Disputed', 'Cancelled'];

const BlockchainMainnet = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [networkStats, setNetworkStats] = useState({ blockHeight: 0, gasPrice: 0 });
  const [contractStats, setContractStats] = useState({ settlementCount: 0, oracle: '' });
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useLiveData, setUseLiveData] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'create', 'report', 'execute', 'settlements'
  const [txPending, setTxPending] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [txSuccess, setTxSuccess] = useState(false);
  const [settlements, setSettlements] = useState([]);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const canvasRef = useRef(null);
  const providerRef = useRef(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    supplier: '', amount: '0.01', threshold: '995', bonus: '0.001', penalty: '0.001', ipfsHash: 'QmATLAS123'
  });
  const [reportForm, setReportForm] = useState({ settlementId: '1', otifScore: '990', defectRate: '10' });
  const [executeForm, setExecuteForm] = useState({ settlementId: '1' });

  // Initialize provider
  useEffect(() => {
    providerRef.current = new ethers.JsonRpcProvider(SEPOLIA_CONFIG.rpcUrl);
  }, []);

  // Fetch contract stats
  const fetchContractStats = useCallback(async () => {
    if (!providerRef.current) return;
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerRef.current);
      const [count, oracle] = await Promise.all([
        contract.settlementCount(),
        contract.oracle()
      ]);
      setContractStats({ settlementCount: Number(count), oracle });
    } catch (err) {
      console.error('Failed to fetch contract stats:', err);
    }
  }, []);

  // Fetch settlements
  const fetchSettlements = useCallback(async () => {
    if (!providerRef.current || contractStats.settlementCount === 0) return;
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerRef.current);
      const settlementPromises = [];
      for (let i = 1; i <= Math.min(contractStats.settlementCount, 10); i++) {
        settlementPromises.push(contract.getSettlement(i).catch(() => null));
      }
      const results = await Promise.all(settlementPromises);
      setSettlements(results.filter(s => s !== null).map(s => ({
        id: Number(s.id),
        supplier: s.supplier,
        buyer: s.buyer,
        amount: ethers.formatEther(s.amount),
        threshold: Number(s.performanceThreshold),
        bonus: ethers.formatEther(s.bonusAmount),
        penalty: ethers.formatEther(s.penaltyAmount),
        status: SETTLEMENT_STATUS[s.status] || 'Unknown',
        statusCode: s.status,
        createdAt: new Date(Number(s.createdAt) * 1000).toLocaleString(),
        ipfsHash: s.ipfsHash
      })));
    } catch (err) {
      console.error('Failed to fetch settlements:', err);
    }
  }, [contractStats.settlementCount]);

  // Fetch network data
  const fetchNetworkData = useCallback(async () => {
    if (!providerRef.current || !useLiveData) return;
    try {
      setIsLoading(true);
      const [blockNumber, feeData] = await Promise.all([
        providerRef.current.getBlockNumber(),
        providerRef.current.getFeeData()
      ]);
      setNetworkStats({
        blockHeight: blockNumber,
        gasPrice: feeData.gasPrice ? Number(ethers.formatUnits(feeData.gasPrice, 'gwei')) : 0
      });
      await fetchContractStats();
      setError(null);
    } catch (err) {
      setError('Failed to fetch network data');
    } finally {
      setIsLoading(false);
    }
  }, [useLiveData, fetchContractStats]);

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask not installed');
      return;
    }
    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${SEPOLIA_CONFIG.chainId.toString(16)}` }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${SEPOLIA_CONFIG.chainId.toString(16)}`,
              chainName: 'Sepolia Testnet',
              nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: [SEPOLIA_CONFIG.rpcUrl],
              blockExplorerUrls: [SEPOLIA_CONFIG.explorerUrl]
            }]
          });
        }
      }
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      setWalletAddress(address);
      setWalletBalance(ethers.formatEther(balance));
      setWalletConnected(true);
      setUseLiveData(true);
      setError(null);
    } catch (err) {
      setError('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Create Settlement
  const handleCreateSettlement = async () => {
    if (!walletConnected) return setError('Connect wallet first');
    try {
      setTxPending(true);
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.createSettlement(
        createForm.supplier || await signer.getAddress(),
        parseInt(createForm.threshold),
        ethers.parseEther(createForm.bonus),
        ethers.parseEther(createForm.penalty),
        createForm.ipfsHash,
        { value: ethers.parseEther(createForm.amount) }
      );
      setTxHash(tx.hash);
      await tx.wait();
      setTxSuccess(true);
      setActiveModal(null);
      await fetchContractStats();
      addTransaction('SETTLEMENT', createForm.amount, 'out', 'confirmed');
    } catch (err) {
      setError(err.reason || err.message || 'Transaction failed');
    } finally {
      setTxPending(false);
    }
  };

  // Report Performance (Oracle function)
  const handleReportPerformance = async () => {
    if (!walletConnected) return setError('Connect wallet first');
    try {
      setTxPending(true);
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.reportPerformance(
        parseInt(reportForm.settlementId),
        parseInt(reportForm.otifScore),
        parseInt(reportForm.defectRate)
      );
      setTxHash(tx.hash);
      await tx.wait();
      setTxSuccess(true);
      setActiveModal(null);
      addTransaction('ORACLE', '0', 'out', 'confirmed');
    } catch (err) {
      setError(err.reason || err.message || 'Only oracle can report performance');
    } finally {
      setTxPending(false);
    }
  };

  // Execute Settlement
  const handleExecuteSettlement = async () => {
    if (!walletConnected) return setError('Connect wallet first');
    try {
      setTxPending(true);
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.executeSettlement(parseInt(executeForm.settlementId));
      setTxHash(tx.hash);
      await tx.wait();
      setTxSuccess(true);
      setActiveModal(null);
      addTransaction('ESCROW', '0', 'in', 'confirmed');
    } catch (err) {
      setError(err.reason || err.message || 'Execution failed');
    } finally {
      setTxPending(false);
    }
  };

  // Add transaction to list
  const addTransaction = (type, amount, direction, status) => {
    setTransactions(prev => [{
      id: `0x${Math.random().toString(16).slice(2, 10)}...`,
      type, amount, currency: 'ETH', status, confirmations: 1,
      counterparty: type === 'SETTLEMENT' ? 'New Settlement' : 'Contract',
      timestamp: new Date().toISOString(), gasUsed: 150000, direction
    }, ...prev.slice(0, 9)]);
  };

  // Demo data
  useEffect(() => {
    if (!useLiveData) {
      setTransactions(Array(6).fill(null).map(() => ({
        id: `0x${Math.random().toString(16).slice(2, 10)}...`,
        type: ['SETTLEMENT', 'ESCROW', 'TRANSFER', 'ORACLE'][Math.floor(Math.random() * 4)],
        amount: (Math.random() * 2 + 0.01).toFixed(4),
        currency: 'ETH',
        status: ['confirmed', 'pending'][Math.floor(Math.random() * 2)],
        confirmations: Math.floor(Math.random() * 15),
        counterparty: ['Supplier Alpha', 'Logistics Co', 'Warehouse Inc'][Math.floor(Math.random() * 3)],
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        direction: Math.random() > 0.5 ? 'in' : 'out'
      })));
      setNetworkStats({ blockHeight: 7500000 + Math.floor(Math.random() * 100000), gasPrice: 15 + Math.random() * 20 });
    }
  }, [useLiveData]);

  useEffect(() => {
    if (useLiveData) {
      fetchNetworkData();
      fetchSettlements();
      const interval = setInterval(fetchNetworkData, 15000);
      return () => clearInterval(interval);
    }
  }, [useLiveData, fetchNetworkData, fetchSettlements]);

  useEffect(() => {
    if (contractStats.settlementCount > 0) fetchSettlements();
  }, [contractStats.settlementCount, fetchSettlements]);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let time = 0;
    const animate = () => {
      time += 0.02;
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 10; i++) {
        const x = 30 + i * 80;
        const isNew = i === 9;
        const pulse = isNew ? Math.sin(time * 5) * 5 : 0;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 2;
        if (i < 9) { ctx.beginPath(); ctx.moveTo(x + 55, 50); ctx.lineTo(x + 80, 50); ctx.stroke(); }
        const gradient = ctx.createLinearGradient(x, 30, x, 65);
        gradient.addColorStop(0, isNew ? '#00F0FF' : '#1a1a2e');
        gradient.addColorStop(1, isNew ? '#0080FF' : '#0a0a15');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - pulse/2, 30 - pulse/2, 55 + pulse, 35 + pulse);
        ctx.strokeStyle = isNew ? '#00F0FF' : 'rgba(0, 240, 255, 0.3)';
        ctx.strokeRect(x - pulse/2, 30 - pulse/2, 55 + pulse, 35 + pulse);
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = isNew ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'center';
        ctx.fillText(`#${(networkStats.blockHeight - 9 + i).toLocaleString()}`, x + 27, 52);
      }
      ctx.beginPath();
      ctx.arc(830, 50, 15 + Math.sin(time * 3) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.3 + Math.sin(time * 5) * 0.2})`;
      ctx.stroke();
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.fillText('MINING', 830, 75);
      requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [networkStats.blockHeight]);

  const shortenAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  const formatTime = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
    return diff < 60 ? `${diff}s ago` : diff < 3600 ? `${Math.floor(diff / 60)}m ago` : `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div data-testid="blockchain-mainnet" className="nexus-widget">
      {/* Header */}
      <div className="widget-header mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
            <Link2 size={18} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="widget-title">Blockchain Network</h3>
            <p className="text-xs font-mono text-white/40">{useLiveData ? 'Sepolia Testnet • Live' : 'Demo Mode'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {walletConnected && (
            <>
              <button onClick={() => setActiveModal('settlements')} className="px-2 py-1.5 rounded text-xs font-mono bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 flex items-center gap-1">
                <List size={12} /> SETTLEMENTS
              </button>
              <button onClick={() => setActiveModal('create')} className="px-2 py-1.5 rounded text-xs font-mono bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 flex items-center gap-1">
                <Plus size={12} /> CREATE
              </button>
              <button onClick={() => setActiveModal('report')} className="px-2 py-1.5 rounded text-xs font-mono bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30 flex items-center gap-1">
                <FileText size={12} /> REPORT
              </button>
              <button onClick={() => setActiveModal('execute')} className="px-2 py-1.5 rounded text-xs font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30 flex items-center gap-1">
                <Play size={12} /> EXECUTE
              </button>
            </>
          )}
          {!walletConnected ? (
            <button onClick={connectWallet} disabled={isLoading} className="px-3 py-1.5 rounded text-xs font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30 flex items-center gap-1">
              <Wallet size={12} /> {isLoading ? 'CONNECTING...' : 'CONNECT WALLET'}
            </button>
          ) : (
            <span className="px-2 py-1 rounded text-xs font-mono bg-green-500/20 text-green-400 border border-green-500/50 flex items-center gap-1">
              <Wallet size={12} /> {shortenAddress(walletAddress)}
            </span>
          )}
          <span className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1 ${useLiveData ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'}`}>
            <Globe size={12} /> {useLiveData ? 'SEPOLIA' : 'DEMO'}
          </span>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          <span className="text-xs text-red-400 flex-1">{error}</span>
          <button onClick={() => setError(null)}><X size={14} className="text-red-400" /></button>
        </div>
      )}
      {txSuccess && txHash && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-xs text-green-400">Transaction successful!</span>
          </div>
          <a href={`${SEPOLIA_CONFIG.explorerUrl}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-cyan-400 flex items-center gap-1">
            View TX <ExternalLink size={10} />
          </a>
        </div>
      )}

      {/* Wallet Balance */}
      {walletConnected && (
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
          <p className="text-xs font-mono text-white/40">WALLET BALANCE</p>
          <p className="text-xl font-mono font-bold text-cyan-400">{Number(walletBalance).toFixed(4)} ETH</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40">BLOCK</p>
          <p className="text-lg font-mono font-bold text-cyan-400">#{networkStats.blockHeight.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40">GAS</p>
          <p className="text-lg font-mono font-bold text-white/60">{networkStats.gasPrice.toFixed(1)} Gwei</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40">SETTLEMENTS</p>
          <p className="text-lg font-mono font-bold text-green-400">{contractStats.settlementCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40">STATUS</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-lg font-mono font-bold text-green-400">ONLINE</p>
          </div>
        </div>
      </div>

      {/* Block Visualization */}
      <div className="relative rounded-lg overflow-hidden border border-white/10 mb-4">
        <canvas ref={canvasRef} width={880} height={100} className="w-full" />
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 text-xs font-mono text-white/60">Latest Blocks</div>
        {isLoading && <RefreshCw size={14} className="absolute top-2 right-2 text-cyan-400 animate-spin" />}
      </div>

      {/* Transactions */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto mb-4">
        {transactions.map((tx, idx) => (
          <div key={idx} className={`p-3 rounded-lg bg-black/30 border ${idx === 0 ? 'border-cyan-500/30' : 'border-white/5'} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded ${tx.direction === 'in' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {tx.direction === 'in' ? <ArrowDownLeft size={14} className="text-green-400" /> : <ArrowUpRight size={14} className="text-red-400" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white/80">{tx.id}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                    tx.type === 'SETTLEMENT' ? 'bg-green-500/20 text-green-400' :
                    tx.type === 'ORACLE' ? 'bg-orange-500/20 text-orange-400' :
                    tx.type === 'ESCROW' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-white/60'
                  }`}>{tx.type}</span>
                </div>
                <p className="text-xs text-white/40">{tx.counterparty}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-mono font-bold ${tx.direction === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                {tx.direction === 'in' ? '+' : '-'}{tx.amount} ETH
              </p>
              <div className="flex items-center gap-2 justify-end">
                {tx.status === 'confirmed' ? <CheckCircle size={12} className="text-green-400" /> : <Loader size={12} className="text-yellow-400 animate-spin" />}
                <span className="text-xs text-white/40">{formatTime(tx.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contract Info */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-green-400" />
            <span className="text-xs font-mono text-green-400">DEPLOYED ON SEPOLIA</span>
          </div>
          <a href={`${SEPOLIA_CONFIG.explorerUrl}/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-cyan-400 flex items-center gap-1">
            Etherscan <ExternalLink size={10} />
          </a>
        </div>
        <div className="p-2 rounded bg-black/30 border border-white/10 mb-3">
          <p className="text-[10px] font-mono text-white/40">CONTRACT</p>
          <p className="text-xs font-mono text-cyan-400 break-all">{CONTRACT_ADDRESS}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1"><CheckCircle size={10} className="text-green-400" /><span className="text-white/60">Settlement</span></div>
          <div className="flex items-center gap-1"><CheckCircle size={10} className="text-green-400" /><span className="text-white/60">Escrow</span></div>
          <div className="flex items-center gap-1"><CheckCircle size={10} className="text-green-400" /><span className="text-white/60">Oracle</span></div>
        </div>
      </div>

      {/* Testnet Warning */}
      <div className="mt-4 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
        <p className="text-xs font-mono text-yellow-400">
          ⚠️ Sepolia Testnet - Test ETH only.
          <a href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" target="_blank" rel="noopener noreferrer" className="ml-2 underline">Get free ETH →</a>
        </p>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setActiveModal(null)}>
          <div className="bg-[#0a0a12] border border-cyan-500/30 rounded-lg p-6 w-full max-w-md mx-4 shadow-[0_0_50px_rgba(0,240,255,0.2)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-white">
                {activeModal === 'create' && 'Create Settlement'}
                {activeModal === 'report' && 'Report Performance'}
                {activeModal === 'execute' && 'Execute Settlement'}
                {activeModal === 'settlements' && 'Active Settlements'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>

            {/* Create Settlement Form */}
            {activeModal === 'create' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono text-white/40 mb-1 block">Supplier Address</label>
                  <input type="text" value={createForm.supplier} onChange={e => setCreateForm({...createForm, supplier: e.target.value})} placeholder="0x... (empty = your address)" className="w-full px-3 py-2 rounded bg-black/50 border border-white/10 text-white text-sm font-mono focus:border-cyan-500/50 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-white/40 mb-1 block">Amount (ETH)</label>
                    <input type="text" value={createForm.amount} onChange={e => setCreateForm({...createForm, amount: e.target.value})} className="w-full px-3 py-2 rounded bg-black/50 border border-white/10 text-white text-sm font-mono focus:border-cyan-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-white/40 mb-1 block">OTIF Threshold</label>
                    <input type="text" value={createForm.threshold} onChange={e => setCreateForm({...createForm, threshold: e.target.value})} placeholder="995 = 99.5%" className="w-full px-3 py-2 rounded bg-black/50 border border-white/10 text-white text-sm font-mono focus:border-cyan-500/50 focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-white/40 mb-1 block">Bonus (ETH)</label>
                    <input type="text" value={createForm.bonus} onChange={e => setCreateForm({...createForm, bonus: e.target.value})} className="w-full px-3 py-2 rounded bg-black/50 border border-white/10 text-white text-sm font-mono focus:border-cyan-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-white/40 mb-1 block">Penalty (ETH)</label>
                    <input type="text" value={createForm.penalty} onChange={e => setCreateForm({...createForm, penalty: e.target.value})} className="w-full px-3 py-2 rounded bg-black/50 border border-white/10 text-white text-sm font-mono focus:border-cyan-500/50 focus:outline-none" />
                  </div>
                </div>
                <button onClick={handleCreateSettlement} disabled={txPending} className={`w-full py-3 rounded font-mono text-sm flex items-center justify-center gap-2 ${txPending ? 'bg-white/10 text-white/40' : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'}`}>
                  {txPending ? <><Loader size={14} className="animate-spin" /> PROCESSING...</> : <><Send size={14} /> CREATE SETTLEMENT</>}
                </button>
              </div>
            )}

            {/* Report Performance Form */}
            {activeModal === 'report' && (
              <div className="space-y-3">
                <div className="p-3 rounded bg-orange-500/10 border border-orange-500/30 mb-2">
                  <p className="text-xs text-orange-400 flex items-center gap-2"><AlertCircle size={12} /> Only the oracle address can report performance</p>
                </div>
                <div>
                  <label className="text-xs font-mono text-white/40 mb-1 block">Settlement ID</label>
                  <input type="text" value={reportForm.settlementId} onChange={e => setReportForm({...reportForm, settlementId: e.target.value})} className="w-full px-3 py-2 rounded bg-black/50 border border-white/10 text-white text-sm font-mono focus:border-cyan-500/50 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-white/40 mb-1 block">OTIF Score (0-1000)</label>
                    <input type="text" value={reportForm.otifScore} onChange={e => setReportForm({...reportForm, otifScore: e.target.value})} placeholder="990 = 99.0%" className="w-full px-3 py-2 rounded bg-black/50 border border-white/10 text-white text-sm font-mono focus:border-cyan-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-white/40 mb-1 block">Defect Rate (0-1000)</label>
                    <input type="text" value={reportForm.defectRate} onChange={e => setReportForm({...reportForm, defectRate: e.target.value})} placeholder="10 = 1.0%" className="w-full px-3 py-2 rounded bg-black/50 border border-white/10 text-white text-sm font-mono focus:border-cyan-500/50 focus:outline-none" />
                  </div>
                </div>
                <button onClick={handleReportPerformance} disabled={txPending} className={`w-full py-3 rounded font-mono text-sm flex items-center justify-center gap-2 ${txPending ? 'bg-white/10 text-white/40' : 'bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30'}`}>
                  {txPending ? <><Loader size={14} className="animate-spin" /> PROCESSING...</> : <><FileText size={14} /> REPORT PERFORMANCE</>}
                </button>
              </div>
            )}

            {/* Execute Settlement Form */}
            {activeModal === 'execute' && (
              <div className="space-y-3">
                <div className="p-3 rounded bg-cyan-500/10 border border-cyan-500/30 mb-2">
                  <p className="text-xs text-cyan-400">Execute a settlement after performance has been verified</p>
                </div>
                <div>
                  <label className="text-xs font-mono text-white/40 mb-1 block">Settlement ID</label>
                  <input type="text" value={executeForm.settlementId} onChange={e => setExecuteForm({...executeForm, settlementId: e.target.value})} className="w-full px-3 py-2 rounded bg-black/50 border border-white/10 text-white text-sm font-mono focus:border-cyan-500/50 focus:outline-none" />
                </div>
                <button onClick={handleExecuteSettlement} disabled={txPending} className={`w-full py-3 rounded font-mono text-sm flex items-center justify-center gap-2 ${txPending ? 'bg-white/10 text-white/40' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30'}`}>
                  {txPending ? <><Loader size={14} className="animate-spin" /> PROCESSING...</> : <><Play size={14} /> EXECUTE SETTLEMENT</>}
                </button>
              </div>
            )}

            {/* Settlements List */}
            {activeModal === 'settlements' && (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {settlements.length === 0 ? (
                  <p className="text-center text-white/40 py-8">No settlements found</p>
                ) : (
                  settlements.map((s, idx) => (
                    <div key={idx} className="p-3 rounded bg-black/30 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-cyan-400">Settlement #{s.id}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                          s.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                          s.status === 'Completed' ? 'bg-cyan-500/20 text-cyan-400' :
                          s.status === 'PendingVerification' ? 'bg-yellow-500/20 text-yellow-400' :
                          s.status === 'Disputed' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60'
                        }`}>{s.status}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-white/40">Amount:</span> <span className="text-white">{s.amount} ETH</span></div>
                        <div><span className="text-white/40">Threshold:</span> <span className="text-white">{(s.threshold/10).toFixed(1)}%</span></div>
                        <div><span className="text-white/40">Supplier:</span> <span className="text-white/60">{shortenAddress(s.supplier)}</span></div>
                        <div><span className="text-white/40">Buyer:</span> <span className="text-white/60">{shortenAddress(s.buyer)}</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainMainnet;
