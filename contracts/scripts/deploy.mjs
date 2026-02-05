import solc from 'solc';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

async function compile() {
  console.log('📦 Compiling SupplyChainSettlement.sol...\n');
  
  const contractPath = path.join(__dirname, '..', 'SupplyChainSettlement.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'SupplyChainSettlement.sol': {
        content: source
      }
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error('❌ Compilation errors:');
      errors.forEach(e => console.error(e.formattedMessage));
      process.exit(1);
    }
    // Show warnings
    output.errors.filter(e => e.severity === 'warning').forEach(e => 
      console.warn('⚠️', e.formattedMessage)
    );
  }

  const contract = output.contracts['SupplyChainSettlement.sol']['SupplyChainSettlement'];
  
  console.log('✅ Compilation successful!\n');
  
  // Save ABI for frontend
  const abiPath = path.join(__dirname, '..', 'artifacts', 'SupplyChainSettlement.json');
  fs.mkdirSync(path.dirname(abiPath), { recursive: true });
  fs.writeFileSync(abiPath, JSON.stringify({
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object
  }, null, 2));
  console.log('📄 ABI saved to:', abiPath);
  
  return {
    abi: contract.abi,
    bytecode: '0x' + contract.evm.bytecode.object
  };
}

async function deploy(abi, bytecode) {
  if (!PRIVATE_KEY) {
    console.log('\n⚠️  No DEPLOYER_PRIVATE_KEY set.');
    console.log('To deploy to Sepolia, set the environment variable:');
    console.log('  export DEPLOYER_PRIVATE_KEY="0xyour_private_key"');
    console.log('\nGet testnet ETH from:');
    console.log('  - https://sepoliafaucet.com/');
    console.log('  - https://www.alchemy.com/faucets/ethereum-sepolia');
    console.log('  - https://cloud.google.com/application/web3/faucet/ethereum/sepolia');
    return null;
  }

  console.log('\n🚀 Deploying to Sepolia...\n');
  
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log('📍 Deployer:', wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');
  
  if (balance < ethers.parseEther('0.01')) {
    console.log('\n⚠️  Insufficient balance. Need at least 0.01 ETH for deployment.');
    return null;
  }

  // Deploy
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  
  console.log('\n📤 Sending deployment transaction...');
  const contract = await factory.deploy(wallet.address); // Use deployer as oracle
  
  console.log('⏳ Waiting for confirmation...');
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  
  console.log('\n✅ Contract deployed!');
  console.log('📋 Address:', address);
  console.log('🔗 Etherscan: https://sepolia.etherscan.io/address/' + address);
  
  // Save deployment info
  const deploymentInfo = {
    address,
    deployer: wallet.address,
    oracle: wallet.address,
    network: 'sepolia',
    chainId: 11155111,
    deployedAt: new Date().toISOString()
  };
  
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'sepolia.json');
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log('\n📄 Deployment info saved to:', deploymentPath);
  
  return deploymentInfo;
}

async function main() {
  console.log('═'.repeat(60));
  console.log('  ATLAS Supply Chain Settlement Contract Deployment');
  console.log('═'.repeat(60) + '\n');
  
  const { abi, bytecode } = await compile();
  
  console.log('\n' + '─'.repeat(60));
  
  const deployment = await deploy(abi, bytecode);
  
  if (deployment) {
    console.log('\n' + '═'.repeat(60));
    console.log('  🎉 Deployment Complete!');
    console.log('═'.repeat(60));
  }
}

main().catch(console.error);
