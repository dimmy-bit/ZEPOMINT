# Frontend Integration Guide

This guide explains how to properly integrate and test the frontend with your new ZepoMintFHEOptimized contract.

## 1. Environment Setup

### Contract Address Update
The contract address has been automatically updated in the following files:
- `frontend/app/.env` - VITE_CONTRACT_ADDRESS variable
- `frontend/app/src/config/zama-config.js` - contractAddress property
- `frontend/app/src/contract-deployment.json` - contractAddress field

### ABI Update
The new contract ABI has been copied to:
- `frontend/app/src/utils/ZepoMintFHEOptimized.json`

### Contract Interaction Utilities
The contract interaction utilities have been updated to use the new ABI:
- `frontend/app/src/utils/contract-interaction.js`

## 2. Testing the Integration

### Development Server
The development server is running at: http://localhost:5173/

### Test Pages
Several test pages are available to verify the integration:

1. **Contract Test Page**: http://localhost:5173/contract-test
   - Tests contract connection and basic functionality
   - Verifies provider connection, contract instance, and view functions

2. **Environment Test Page**: http://localhost:5173/env-test
   - Verifies environment variables are correctly set
   - Checks Zama configuration values

3. **Comprehensive Verification Page**: http://localhost:5173/comprehensive-test
   - Complete end-to-end testing of all components

### Manual Testing
You can also test manually by:

1. Visiting the Auctions page: http://localhost:5173/auctions
2. Checking if auction data loads correctly
3. Trying to create a new auction (if you're the owner)
4. Placing a bid on an existing auction

## 3. Key Integration Points

### Contract Address
All contract interactions now use the new contract address:
```
0x0771aFDD5Ef859cDe4371dA1EafA62F07Ed2686a
```

### ABI Compatibility
The new contract maintains ABI compatibility with the previous version, so most frontend code should work without changes.

### FHE Integration
The FHE encryption functionality in `fhe-wrapper.js` should work with the new contract since it uses the same Zama FHEVM interfaces.

## 4. Troubleshooting

### Common Issues

1. **Contract Not Found**: Verify the contract address is correct in `.env` file
2. **ABI Mismatch**: Ensure you're using the correct ABI file (`ZepoMintFHEOptimized.json`)
3. **Network Issues**: Check that you're connected to Sepolia testnet
4. **RPC Connection**: Verify RPC URLs in environment variables

### Debugging Steps

1. Check browser console for JavaScript errors
2. Verify environment variables are loaded correctly
3. Test contract connection using the contract test page
4. Check Hardhat deployment logs for any issues

### Contract Verification

To verify the contract is working correctly:

1. Visit http://localhost:5173/contract-test
2. Check that all connection tests pass
3. Verify the contract address shown matches your deployed contract
4. Check the browser console for detailed logs

## 5. Next Steps

### Create an Auction
If you're the contract owner, you can create a new auction:

1. Visit the Mint page: http://localhost:5173/mint
2. Fill in the auction details
3. Submit the form to create the auction

### Place a Bid
Once an auction is created, users can place bids:

1. Visit the Auctions page: http://localhost:5173/auctions
2. Enter a bid amount
3. Submit the encrypted bid

### Finalize Auction
As the owner, you can finalize the auction after it ends:

1. Visit the Owner Console: http://localhost:5173/owner
2. Use the finalize auction functionality

## 6. Security Considerations

### Private Key Security
- Never expose private keys in frontend code
- Use environment variables for sensitive configuration
- Ensure only authorized users can access owner functions

### FHE Security
- All bid encryption happens client-side
- Private keys never leave the user's wallet
- Bid values remain encrypted throughout the process

## 7. Maintenance

### Contract Updates
If you deploy a new version of the contract:

1. Update the contract address in `.env` file
2. Copy the new ABI to `ZepoMintFHEOptimized.json`
3. Test the integration thoroughly

### Environment Variables
Regularly check that all environment variables are up to date:

- RPC URLs
- Zama contract addresses
- Contract address
- IPFS configuration

This integration ensures your frontend works correctly with the new contract while maintaining all the privacy-preserving features of the Zama FHEVM.