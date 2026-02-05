import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying SupplyChainSettlement to Sepolia...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deployer address:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance < hre.ethers.parseEther("0.01")) {
    console.log("⚠️  Warning: Low balance. Get testnet ETH from:");
    console.log("   - https://sepoliafaucet.com/");
    console.log("   - https://www.alchemy.com/faucets/ethereum-sepolia");
    console.log("   - https://cloud.google.com/application/web3/faucet/ethereum/sepolia\n");
  }

  // Deploy with deployer as initial oracle
  const oracleAddress = deployer.address;
  console.log("🔮 Oracle address:", oracleAddress);

  // Deploy the contract
  console.log("\n📦 Deploying contract...");
  const SupplyChainSettlement = await hre.ethers.getContractFactory("SupplyChainSettlement");
  const settlement = await SupplyChainSettlement.deploy(oracleAddress);

  await settlement.waitForDeployment();
  const contractAddress = await settlement.getAddress();

  console.log("\n✅ SupplyChainSettlement deployed to:", contractAddress);
  console.log("\n📋 Contract Details:");
  console.log("   Network: Sepolia (chainId: 11155111)");
  console.log("   Contract:", contractAddress);
  console.log("   Owner:", deployer.address);
  console.log("   Oracle:", oracleAddress);
  
  console.log("\n🔗 Etherscan URL:");
  console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);

  console.log("\n📝 Next steps:");
  console.log("   1. Verify contract on Etherscan");
  console.log("   2. Update frontend with contract address");
  console.log("   3. Test createSettlement function");

  // Return deployment info for verification
  return {
    contract: contractAddress,
    deployer: deployer.address,
    oracle: oracleAddress,
    network: "sepolia"
  };
}

main()
  .then((result) => {
    console.log("\n🎉 Deployment successful!");
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
