# ZepoMint - Privacy-Preserving NFT Auction Platform

ZepoMint is a cutting-edge NFT auction platform built on Zama's fhEVM (fully homomorphic encryption Virtual Machine) that enables sealed-bid auctions with complete privacy. This repository contains the complete implementation with enhanced smart finalization functionality.

## Prerequisites

1. Node.js (v20.x - Required for Zama FHEVM compatibility)
2. Hardhat
3. MetaMask or other Web3 wallet
4. WalletConnect Project ID (Free) - Get it from https://cloud.walletconnect.com/

## Setup Instructions

### 1. Environment Setup

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend/app
   npm install
   ```

4. Get a WalletConnect Project ID:
   - Visit https://cloud.walletconnect.com/
   - Sign up for a free account
   - Create a new project
   - Copy the Project ID

5. Configure environment variables:
   - Copy `.env.example` to `.env` in the root directory
   - Add your WalletConnect Project ID to `VITE_RAINBOWKIT_PROJECT_ID`
   - Fill in other required values

6. Update contract address in `frontend/app/.env` and `frontend/app/src/contract-deployment.json` with your deployed contract address

### 2. Zama Relayer Configuration

For FHE functionality to work properly, you need to configure the Zama Relayer SDK correctly:

1. In `frontend/app/.env`, ensure the following variables are set:
   ```
   VITE_RELAYER_URL=https://relayer.testnet.zama.cloud
   VITE_KMS_VERIFIER_CONTRACT=0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC
   VITE_ACL_CONTRACT=0x687820221192C5B662b25367F70076A37bc79b6c
   VITE_INPUT_VERIFIER_CONTRACT=0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4
   VITE_DECRYPTION_ORACLE_CONTRACT=0xa02Cda4Ca3a71D7C46997716F4283aa851C28812
   ```

2. Test your relayer configuration by visiting `/relayer-config-test` in your browser

### 3. Smart Contract Deployment

#### Deploy with Your Private Key to Sepolia Testnet

This project includes a deployment script that uses your private key to deploy the enhanced smart finalize contract to Sepolia testnet.

1. Make sure your private key is configured in `backend/hardhat.config.js`
2. Deploy the contract:
   ```bash
   cd backend
   npx hardhat run scripts/deploy-with-your-private-key.js --network sepolia
   ```

#### Local Development (for non-FHE functionality testing)

1. Start a local Hardhat node:
   ```bash
   cd backend
   npx hardhat node
   ```

2. In a new terminal, deploy contracts to local network:
   ```bash
   cd backend
   npx hardhat run scripts/deploy.js --network localhost
   ```

#### Zama Testnet Deployment (for FHE functionality)

To deploy and test FHE contracts, you need to use Zama's testnet as the FHEVM runtime is not available on local Hardhat networks.

1. Deploy to Zama testnet:
   ```bash
   cd backend
   npm run deploy:zama
   ```

Note: FHE contracts require Zama's specialized runtime environment. Local Hardhat networks do not support FHE operations like encryption and homomorphic computations.

### 4. Frontend Development

1. Start the frontend development server:
   ```bash
   cd frontend/app
   npm run dev
   ```

2. Visit http://localhost:3000 in your browser

### 5. Wallet Connection

To connect your wallet:
1. Make sure you have MetaMask or another Web3 wallet installed
2. Ensure your wallet is connected to Sepolia testnet
3. Click the "Connect Wallet" button in the header
4. Select your wallet from the options
5. Confirm the connection in your wallet

## Testing

### Local Testing (non-FHE functionality)

```bash
cd backend
npx hardhat test
```

### Zama Testnet Testing (FHE functionality)

```bash
cd backend
npm run test:zama
```

Note: FHE tests will be skipped on local Hardhat networks as they require Zama's testnet environment.

## Features

- **Privacy-Preserving Auctions**: Using Zama's fhEVM for fully homomorphic encryption
- **Sealed-Bid Auctions**: Bids remain encrypted until auction ends
- **Smart Finalization**: Enhanced smart finalize functionality that automatically determines winners based on bid count:
  - 0 bids: Finalizes without winner
  - 1 bid: Automatically finalizes with that bid as winner
  - 2+ bids: Uses FHE operations to determine highest bid winner
- **Threshold Key Management**: Secure key distribution for decryption
- **Responsive UI**: Built with React, TailwindCSS, and Framer Motion
- **Multi-Wallet Support**: Connect with MetaMask, WalletConnect, and other wallets

## Project Structure

- `/backend`: Smart contracts and deployment scripts
- `/frontend/app`: React frontend application
- `/docs`: Documentation and guides

## Technologies Used

- Zama fhEVM v0.8
- Solidity ^0.8.24
- Hardhat
- React + Vite
- RainbowKit + Wagmi
- TailwindCSS
- Framer Motion
- TypeScript

## Important Notes

- **FHE Requirements**: Fully Homomorphic Encryption contracts require Zama's testnet or Docker local node. They will not work on standard Hardhat local networks.
- **Node.js Version**: Node.js v20.x is required for compatibility with Hardhat and Zama FHEVM development tools.
- **Relayer Configuration**: Proper relayer configuration is essential for FHE operations. Make sure all environment variables are correctly set.