# ZepoMINT FHE Auction Contract

This document explains how to deploy, use, and interact with the ZepoMINT FHE Auction contract, which implements a sealed-bid NFT auction using Zama's fully homomorphic encryption (FHE).

## Overview

The ZepoMINTFHEAuction contract allows users to participate in sealed-bid auctions where:
1. Bids are submitted in encrypted form using Zama's FHE
2. Bid amounts remain confidential until auction completion
3. Winner determination happens on-chain using FHE operations without decryption
4. Only the winner's identity and winning bid are revealed

## Contract Features

- **Sealed-bid auctions**: Bids are encrypted and remain confidential
- **FHE operations**: Winner determination using homomorphic computations
- **NFT integration**: Designed for NFT auctions with IPFS metadata storage
- **Access control**: Owner-controlled auction creation and management
- **Zama integration**: Built for Zama's fhEVM on Sepolia testnet

## Prerequisites

1. Node.js and npm installed
2. Hardhat installed globally: `npm install -g hardhat`
3. Ethereum wallet with Sepolia ETH
4. Alchemy or Infura API key for Sepolia RPC
5. Etherscan API key for contract verification

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables in `.env`:
```env
# Sepolia Testnet Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Zama Testnet Configuration
ZAMA_RPC_URL=https://devnet.zama.ai
```

## Deployment

### Deploy to Sepolia Testnet
```bash
npx hardhat run scripts/deploy-with-main-wallet.js --network sepolia
```

### Deploy to Zama Sepolia Testnet
```bash
npx hardhat run scripts/deploy-to-zama.js --network zama
```

## Contract Functions

### Owner Functions

- `createAuction(uint256 biddingDurationSeconds, string memory metadataCID)`: Create a new auction
- `computeWinnerOnChain()`: Determine auction winner using FHE operations
- `mintNFTToWinner(uint256 tokenId)`: Mint NFT to auction winner
- `updatePublicKeyURI(string memory _newPublicKeyURI)`: Update Zama relayer public key URI
- `initialize(string memory _publicKeyURI)`: Initialize contract with public key URI

### Public Functions

- `submitBid(externalEuint128 encryptedAmount, externalEaddress bidder, bytes memory amountProof, bytes memory bidderProof)`: Submit an encrypted bid
- `getAuctionDetails()`: Get current auction details
- `getBidCount()`: Get number of bids submitted
- `getPublicKeyURI()`: Get Zama relayer public key URI

## FHE Integration

The contract uses Zama's fhEVM for encrypted computations:

1. **Encryption**: Bids are encrypted client-side using `@fhevm/sdk`
2. **Homomorphic Operations**: Comparisons and selections performed on encrypted data
3. **Winner Determination**: Uses `FHE.gt()` and `FHE.select()` for finding highest bid
4. **Re-encryption**: Winner's data can be decrypted by the owner using Zama's relayer

## Testing

### Run Local Tests
```bash
npx hardhat test
```

### Test FHE Operations (requires Zama network)
```bash
npx hardhat run scripts/test-fhe-auction.js --network zama
```

## Verification

Verify deployed contract on Etherscan:
```bash
npx hardhat run scripts/verify-contract.js --network sepolia
```

## Frontend Integration

The contract is designed to work with the frontend application in `frontend/app/`. Key integration points:

1. **Contract Address**: Updated automatically during deployment
2. **FHE Encryption**: Use `@fhevm/sdk` for client-side bid encryption
3. **Wallet Integration**: Connect using Wagmi and RainbowKit
4. **IPFS Integration**: Store NFT metadata using Pinata

## Security Considerations

1. **Private Key Management**: Keep your private key secure
2. **FHE Security**: Encryption handled by Zama's trusted execution environment
3. **Access Control**: Only contract owner can create auctions and determine winners
4. **Re-encryption**: Winner data can only be decrypted by authorized parties

## Troubleshooting

### Common Issues

1. **Compilation Errors**: Ensure Solidity version matches FHEVM requirements (0.8.24)
2. **Network Connection**: Verify RPC URL and network configuration
3. **Insufficient Funds**: Ensure wallet has enough ETH for gas fees
4. **FHE Operations**: Some functions only work on Zama network

### FHE-Specific Issues

1. **Encryption Failures**: Check Zama relayer availability and public key URI
2. **Proof Generation**: Ensure proper proof generation with `@fhevm/sdk`
3. **Gas Limits**: FHE operations may require higher gas limits

## Next Steps

1. Deploy to Zama Sepolia testnet for full FHE functionality
2. Test with multiple bidders using encrypted bids
3. Integrate with frontend for complete user experience
4. Add additional features like bid withdrawal or auction extensions