# Backend Scripts Documentation

This document explains the purpose and usage of the various backend scripts for the ZepoMINT FHE Auction DApp.

## Available Scripts

### 1. `finalize-auction.js`
Automatically finalizes an auction if it has ended and has bids.

**Usage**:
```bash
node finalize-auction.js
```

**Functionality**:
- Checks if there's an active auction
- Verifies the auction has ended
- Confirms there are bids
- Calls `computeWinnerOnChain()` to finalize the auction
- Uses a high gas limit (5,000,000) to prevent gas estimation issues

### 2. `force-finalize-auction.js`
Forces finalization of an auction regardless of some conditions.

**Usage**:
```bash
node force-finalize-auction.js
```

**Functionality**:
- Similar to `finalize-auction.js` but with less strict condition checking
- Useful for debugging or special cases
- Uses a high gas limit (5,000,000)

### 3. `test-finalize.js`
Tests the auction finalization conditions without actually finalizing.

**Usage**:
```bash
node test-finalize.js
```

**Functionality**:
- Checks auction status
- Verifies auction end time
- Counts bids
- Reports whether the auction is ready for finalization

### 4. `check-current-auction.js`
Displays detailed information about the current auction.

**Usage**:
```bash
node check-current-auction.js
```

### 5. `create-test-auction.js`
Creates a test auction with a short duration for testing purposes.

**Usage**:
```bash
node create-test-auction.js
```

## Troubleshooting Finalization Issues

### Common Error Messages

1. **"gas required exceeds allowance"**
   - Solution: The script already uses a high gas limit. Ensure your wallet has sufficient ETH.

2. **"execution reverted"**
   - Check that:
     - The auction has ended
     - There are bids submitted
     - You're using the contract owner wallet
     - The auction is not already finalized

3. **"cannot estimate gas"**
   - This is usually resolved by using a fixed gas limit, which the scripts already do.

### Running Scripts

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Run a script**:
   ```bash
   node finalize-auction.js
   ```

3. **Check the output**:
   - Look for success messages
   - Note any error messages
   - Verify the transaction hash on Etherscan

## Best Practices

1. **Always run `test-finalize.js` first** to check conditions before finalizing
2. **Keep sufficient ETH in your wallet** for gas fees
3. **Use the correct owner wallet** (0x20dcd85aC3d79D97E1eC05375c45f4d94dD9371a)
4. **Monitor the console output** for detailed information
5. **Check Etherscan** for transaction details if issues occur

## Contact Support

If you continue to experience issues with the scripts:
1. Document the exact error messages
2. Note the steps you took before the error
3. Check console output for additional details
4. Contact the development team with this information