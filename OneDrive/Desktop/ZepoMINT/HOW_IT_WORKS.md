# How Your ZepoMINT FHE Auction DApp Works

## Overview

Your DApp is a sealed-bid NFT auction platform that uses Fully Homomorphic Encryption (FHE) to keep bids private until the auction ends.

## Complete Workflow

### 1. Auction Creation
- **Owner** creates an auction with:
  - Duration (e.g., 72 hours)
  - NFT metadata (stored on IPFS)
- Auction is now **Active**

### 2. Bidding Period
- **Users** submit encrypted bids using FHE
- All bids remain private and encrypted on-chain
- No one (including the owner) can see bid amounts during this period

### 3. Auction End
- When the timer reaches zero, the auction **Ends**
- Owner must manually finalize the auction

### 4. Manual Finalization
- **Owner** visits the Owner Console at `/owner`
- **Owner** clicks "Finalize Now" when auction ends
- **FHE operations** compare all encrypted bids
- **Winner** is determined using `FHE.gt()` (greater than) operations
- Auction is marked as **Finalized**

### 5. Winner Notification
- **Winner** can visit the minting page to mint their NFT
- Winner will see a banner on the auction page directing them to mint

### 6. NFT Minting
- **Winner** visits `/mint-nft` to mint their NFT
- NFT is minted and sent to winner's wallet

## How to Test the Complete Flow

### Step 1: Create Auction
1. Connect with owner wallet (0x20dcd85aC3d79D97E1eC05375c45f4d94dD9371a)
2. Visit `/owner` 
3. Go to "Create Auction" tab
4. Set duration (try 5 minutes for testing)
5. Add metadata CID
6. Click "Create Auction"

### Step 2: Submit Bids
1. Connect with different wallets (not owner)
2. Visit the main page or `/auctions`
3. Submit encrypted bids

### Step 3: Wait for Auction to End
- Wait for the auction duration to complete
- You can check the timer on the auction page

### Step 4: Manual Finalization
- **IMPORTANT**: Owner must visit the `/owner` page
- When auction ends, owner will see a "Finalize Now" button
- Owner clicks "Finalize Now" to determine the winner
- System will use FHE operations to compare bids and select winner

### Step 5: Winner Minting
- Winner will see a banner on the auction page directing them to mint
- Winner can visit `/mint-nft` to mint their NFT

## Troubleshooting

### If Finalization Doesn't Work
1. **Check you're connected as owner**: 
   - Wallet address must be 0x20dcd85aC3d79D97E1eC05375c45f4d94dD9371a
   - You can check this on the Owner Console page

2. **Verify Auction Conditions**:
   - Auction must be initialized
   - Auction must not already be finalized
   - Auction end time must have passed
   - There must be at least one bid

3. **Check Wallet Connection**:
   - Make sure you're connected to Sepolia testnet
   - Ensure you have enough ETH for gas fees
   - Verify the wallet can sign transactions

### If Winner Can't Mint
1. **Check Auction is Finalized**:
   - Owner Console should show "Auction Finalized"
   - Winner address should be visible

2. **Connect as Winner**:
   - Winner must use the same wallet that submitted the winning bid

## Important Notes

1. **Manual Finalization Only**: Automatic finalization has been removed. Owner must manually finalize auctions.

2. **Network**: Make sure you're on Sepolia testnet.

3. **Privacy**: All bids remain encrypted until auction finalization.

4. **Gas Requirements**: FHE operations require significant gas. Ensure the owner wallet has sufficient ETH.

## Testing Tips

1. **Quick Test**: Create a 5-minute auction for testing
2. **Multiple Bids**: Submit bids from different wallets
3. **Manual Finalization**: Visit `/owner` and click "Finalize Now" when auction ends
4. **Check Winner**: After finalization, the highest bidder can mint their NFT

## URLs to Visit

- `/` - Main page
- `/auctions` - View current auction
- `/owner` - Owner console (required for manual finalization)
- `/mint-nft` - Winner's minting page
- `/debug-auction` - Debug information (if needed)