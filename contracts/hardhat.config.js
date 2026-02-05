import "@nomicfoundation/hardhat-toolbox";

// Use environment variables for sensitive data
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
      accounts: [PRIVATE_KEY],
      gasPrice: 20000000000 // 20 gwei
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || ""
  },
  paths: {
    sources: "./",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
