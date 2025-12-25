# Auction Finalization Testing Guide

This guide provides step-by-step instructions for testing the auction finalization process in the ZepoMINT FHE Auction DApp.

## Prerequisites

1. Ensure the contract is deployed on Sepolia testnet
2. Have the owner wallet (0x20dcd85aC3d79D97E1eC05375c45f4d94dD9371a) with sufficient ETH for gas
3. Have at least one bidder wallet with test ETH
4. Ensure the frontend is running at `http://localhost:5173`

## Testing Process

### Step 1: Create a Test Auction

1. Visit `http://localhost:5173/owner`
2. Connect with the owner wallet
3. Go to the "Create Auction" section
4. Create an auction with a short duration (e.g., 5 minutes)
5. Note the auction end time

### Step 2: Submit Bids

1. Switch to a bidder wallet
2. Visit the auction page
3. Submit at least one encrypted bid
4. Verify the bid was submitted successfully

### Step 3: Wait for Auction End

1. Monitor the auction end time
2. Wait until the current time is past the auction end time

### Step 4: Observe Automatic Finalization

1. Keep the Owner Console page open at `http://localhost:5173/owner`
2. The system should automatically detect the auction end
3. The "Auction Ended - Ready to Finalize" banner should appear
4. The system should automatically trigger finalization after a few seconds

### Step 5: Manual Finalization (if needed)

If automatic finalization doesn't work:

1. Click the "Finalize Now" button in the banner
2. Or go to the "Run Onchain Compute" tab and click "Run Onchain Compute"

### Step 6: Verify Finalization

1. Check that the auction status shows as "Finalized"
2. Verify the winner information is displayed
3. Check the transaction on Etherscan using the provided link

### Step 7: Winner Mints NFT

1. Switch to the winner's wallet
2. Visit `http://localhost:5173/mint-nft`
3. Click "Mint Your NFT Now"
4. Verify the NFT is minted successfully

## Troubleshooting Common Issues

### Issue 1: Automatic Finalization Not Triggering

**Solution**:
1. Ensure the Owner Console page is open
2. Refresh the page to force data update
3. Check browser console for errors
4. Manually trigger finalization

### Issue 2: "Cannot read properties of null" Error

**Solution**:
1. Check network connectivity
2. Verify sufficient ETH in owner wallet
3. Try manual finalization
4. Check contract state with backend scripts

### Issue 3: Transaction Fails with "execution reverted"

**Solution**:
1. Verify auction conditions:
   - Auction is initialized
   - Auction is not already finalized
   - Auction has ended
   - There are bids submitted
2. Check that you're using the owner wallet
3. Try with a higher gas limit

## Backend Script Testing

### Check Auction Status

```bash
node check-current-auction.js
```

Expected output:
```
Current Auction: {
  metadataCID: "Qm...",
  endTime: 1758807564n,
  finalized: false,
  initialized: true
}
Auction finalized: false
Auction initialized: true
Auction end time: 2025-09-25T13:39:24.000Z
Current time: 2025-09-26T00:59:48.000Z
Auction ended: true
Bid count: 1
```

### Test Finalization Conditions

```bash
node test-finalize.js
```

Expected output when ready to finalize:
```
Auction has ended. Ready to finalize.
You can now run the finalize-auction.js script to finalize the auction.
```

### Force Finalization

```bash
node force-finalize-auction.js
```

## Browser Console Debugging

When debugging finalization issues, look for these key messages in the browser console:

1. **Auction Status Checks**:
   ```
   Checking if auction has ended with provider: ...
   Debug - Current time: ...
   Debug - End time: ...
   Debug - Current time >= End time: true
   Auction ended result: true
   ```

2. **Bid Count**:
   ```
   Getting bid count with provider: ...
   Bid count result: 1
   ```

3. **Transaction Sending**:
   ```
   Sending compute winner transaction with fixed gas limit...
   Transaction response: ...
   Transaction hash: 0x...
   ```

4. **Success**:
   ```
   Winner computed successfully in block: ...
   ```

5. **Errors**:
   ```
   Error computing winner: ...
   ```

## Verification Checklist

Before considering finalization successful, verify:

- [ ] Auction status shows as "Finalized"
- [ ] Winner information is displayed
- [ ] Transaction is confirmed on Etherscan
- [ ] Winner can access the mint page
- [ ] Winner can mint the NFT successfully

## Contact Support

If you continue to experience issues with auction finalization:

1. Document the exact error messages
2. Note the steps you took before the error
3. Check browser console for additional details
4. Verify contract state with the check scripts
5. Contact the development team with this information