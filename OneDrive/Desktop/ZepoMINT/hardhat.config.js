require("@nomicfoundation/hardhat-toolbox");
require("@fhevm/hardhat-plugin");
require("hardhat-deploy"); // Add this line
require("dotenv/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // FHEVM requires at least the "cancun" EVM version
      evmVersion: "cancun",
    },
  },
  paths: {
    sources: "./backend/contracts",
    tests: "./backend/test",
    cache: "./backend/cache",
    artifacts: "./backend/artifacts"
  },
  networks: {
    hardhat: {
      // Hardhat network configuration for testing
      // Note: FHE contracts won't work properly on local Hardhat network
      // Use Sepolia network for FHE testing
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/JkwlX2jl-1k1wTZQPFHuC-YYuLcoldZk",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8546", // Changed to 8546 to match our running node
      chainId: 31337,
    },
    // Zama FHEVM on Sepolia testnet
    zama: {
      url: process.env.ZAMA_RPC_URL || "https://devnet.zama.ai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8009, // Zama network chain ID
    }
  },
  fhevm: {
    // FHEVM plugin configuration
    networks: ["sepolia", "zama"]
  },
  etherscan: {
    // Updated for Etherscan API v2 format
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "YOUR_ETHERSCAN_API_KEY"
    },
    customChains: [
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io"
        }
      }
    ]
  },
  namedAccounts: { // Add this section
    deployer: {
      default: 0,
    },
  },
};