# ZepoMINT FHE Auction Testing Guide

## Prerequisites
- Node.js v20+ installed
- MetaMask or compatible wallet
- Sepolia ETH for gas fees
- Access to the deployed contract

## Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend/app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:5174`

## Testing Workflow

### 1. Auction Creation (Owner Only)
1. Connect your wallet (must be owner: `0x20dcd85aC3d79D97E1eC05375c45f4d94dD9371a`)
2. Navigate to the "Create Auction" page
3. Fill in auction details:
   - Collection Name: "Test Auction"
   - Description: "Test FHE Auction"
   - Duration: 1 hour (minimum)
   - Upload an image
4. Submit the auction creation
5. Verify the transaction completes successfully

### 2. Bid Submission (Any User)
1. Connect a different wallet (not the owner)
2. Navigate to the active auction
3. Submit an encrypted bid
4. Verify the bid is recorded

### 3. Auction Finalization (After End Time)
1. Wait for the auction to end (or use a test with shorter duration)
2. Connect the owner wallet
3. Go to the Owner Console
4. Click "Finalize Auction"
5. Verify the winner is determined using FHE

### 4. NFT Minting (Winner Only)
1. Connect the winning wallet
2. Navigate to the minting interface
3. Mint the victory NFT
4. Verify the NFT appears in the wallet

## Expected Behaviors

### ✅ Successful Operations
- Auction creation: Transaction completes, auction appears on site
- Bid submission: Encrypted bid recorded without revealing amount
- Finalization: Winner determined via FHE operations
- NFT minting: Winner receives NFT

### ⚠️ Error Handling
- Attempting to create auction while one exists: "Previous auction not finalized"
- Submitting bid after auction ends: "Bidding ended"
- Finalizing before auction ends: "Auction not ended"
- Non-owner creating auction: "Ownable: caller is not the owner"

## Troubleshooting

### Common Issues
1. **Contract not responding**: Check network is set to Sepolia
2. **Wrong contract address**: Verify `VITE_CONTRACT_ADDRESS` in `.env`
3. **FHE operations failing**: Ensure sufficient gas (10M limit set)
4. **Wallet connection issues**: Check wallet is connected to Sepolia

### Verification Steps
1. Check contract is at: `0xB9451B1fdD5CaBe38C1de2C64136ae47bb930725`
2. Verify public key URI: `https://relayer.testnet.zama.cloud/public_key`
3. Confirm owner address: `0x20dcd85aC3d79D97E1eC05375c45f4d94dD9371a`

## Test Scenarios

### Scenario 1: Single Bid Auction
- Create auction with 1-hour duration
- Submit 1 bid
- Wait for auction to end
- Finalize - should assign winner automatically

### Scenario 2: Multiple Bid Auction
- Create auction with 1-hour duration
- Submit 2+ bids from different accounts
- Wait for auction to end
- Finalize - should determine winner using FHE

### Scenario 3: No Bid Auction
- Create auction with 1-hour duration
- Submit 0 bids
- Wait for auction to end
- Finalize - should finalize without winner

## Success Metrics
- ✅ Auctions created successfully
- ✅ Bids submitted and encrypted properly
- ✅ FHE operations complete without revert
- ✅ Winners determined correctly
- ✅ NFTs minted to correct addresses
- ✅ UI displays all information correctly
- ✅ Error handling works as expected

## Performance Considerations
- FHE operations require higher gas limits (10M set)
- Transaction times may be longer due to FHE computations
- Ensure sufficient ETH balance for gas fees
- Use Sepolia testnet for development

## Security Notes
- Only contract owner can create auctions
- Bid amounts remain encrypted until finalization
- FHE ensures privacy while maintaining fairness
- Proper access controls prevent unauthorized operations