# ZepoMintFHEOptimized Deployment Guide

This guide explains how to deploy and set up the ZepoMintFHEOptimized contract after your wallet was hacked.

## Prerequisites

1. Ensure you have a new wallet with sufficient Sepolia ETH for deployment
2. Update your private key in the `.env` file
3. Verify all Zama FHE configuration values are correct

## Step-by-Step Deployment Process

### 1. Update Your Private Key

Replace the existing private key in `backend/.env`:

```
# Sepolia Testnet Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=YOUR_NEW_PRIVATE_KEY_HERE
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Zama Testnet Configuration
ZAMA_RPC_URL=https://devnet.zama.ai
RELAYER_URL=https://relayer.testnet.zama.cloud/
GATEWAY_URL=https://gateway.sepolia.zama.ai/
KMS_VERIFIER_CONTRACT=0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC
INPUT_VERIFIER_CONTRACT=0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4
DECRYPTION_ORACLE_CONTRACT=0xa02Cda4Ca3a71D7C46997716F4283aa851C28812
FHEVM_EXECUTOR_CONTRACT=0x848B0066793BcC60346Da1F49049357399B8D595
```

### 2. Compile the Contract

```bash
cd backend
npx hardhat compile
```

### 3. Deploy the Contract

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/full-deployment-setup.js --network sepolia
```

This script will:
- Deploy the ZepoMintFHEOptimized contract
- Initialize the contract
- Verify the deployment
- Create a sample auction (optional)

### 4. Set Public Key URI

```bash
npx hardhat run scripts/set-public-key-uri.js --network sepolia
```

### 5. Verify Contract Deployment

```bash
npx hardhat run scripts/verify-zepamint-optimized.js --network sepolia
```

## Contract Details

The deployed contract includes:

- **FHE-encrypted bidding**: All bids are submitted as encrypted values
- **Secure winner selection**: Uses Zama FHE operations to determine the winner without revealing bids
- **NFT minting functionality**: Winner can mint the NFT after auction completion
- **IPFS metadata support**: NFT metadata is stored on IPFS

## Frontend Integration

After deployment, update your frontend configuration to use the new contract address:

1. Check the deployment file at `backend/deployments/zepamint-optimized-deployment.json`
2. Update the contract address in your frontend configuration
3. Test the auction functionality

## Testing

To test the contract locally (without FHE):

```bash
# Run local Hardhat node
npx hardhat node

# In another terminal, deploy to local network
npx hardhat run scripts/full-deployment-setup.js --network localhost
```

Note: FHE functionality will not work on local networks. Use Sepolia testnet for full FHE testing.

## Troubleshooting

### Common Issues

1. **Insufficient funds**: Ensure your wallet has enough Sepolia ETH
2. **RPC connection errors**: Verify your RPC URL is correct
3. **FHE initialization errors**: Check that all Zama contract addresses are correct
4. **Permission errors**: Ensure your private key has the correct permissions

### Contract Verification

If you need to verify the contract on Etherscan:

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## Security Considerations

1. **Private Key Security**: Never commit your private key to version control
2. **FHE Operations**: All sensitive operations are performed using Zama FHE
3. **Access Control**: Only the contract owner can create auctions and set the public key URI
4. **Bid Privacy**: Bids are encrypted and remain private throughout the auction process

## Support

For issues with the deployment or contract functionality, please check:
- Zama documentation: https://docs.zama.ai/fhevm
- Hardhat documentation: https://hardhat.org/docs
- Contract source code in `backend/contracts/ZepoMintFHEOptimized.sol`