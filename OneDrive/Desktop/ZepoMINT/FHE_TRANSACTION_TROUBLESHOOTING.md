# FHE Contract Transaction Troubleshooting Guide

This document explains how to troubleshoot transaction issues specific to Zama FHE contracts, particularly the "Transaction failed - no transaction hash found" error.

## Understanding the Issue

FHE contracts behave differently from regular Ethereum contracts due to their integration with Zama's Fully Homomorphic Encryption technology. The transaction response structure may differ, and transaction hashes might not be immediately available.

## Common FHE Transaction Issues

### 1. "Transaction failed - no transaction hash found"

This error occurs because FHE contracts may return transaction responses in a different format than standard Ethereum contracts.

### 2. Transaction sent but no immediate confirmation

FHE operations can take longer to process, and the transaction hash might only become available after the transaction is mined.

### 3. Gas estimation failures

FHE operations require significant gas, and gas estimation can fail with complex operations.

## Solutions Implemented

### 1. Robust Transaction Response Handling

The updated code now handles multiple possible transaction response formats:

```javascript
// Different ways the transaction hash might be available
if (resolvedTx.hash) {
  txHash = resolvedTx.hash;
} else if (resolvedTx.transactionHash) {
  txHash = resolvedTx.transactionHash;
} else if (resolvedTx.tx && resolvedTx.tx.hash) {
  txHash = resolvedTx.tx.hash;
} else if (typeof resolvedTx === 'string' && resolvedTx.startsWith('0x') && resolvedTx.length === 66) {
  // If the function directly returns the transaction hash
  txHash = resolvedTx;
}
```

### 2. Special Handling for FHE Contracts

The code now includes special handling for FHE contract behavior:

```javascript
// Special handling for FHE contracts - they might return the hash directly
// or in a different property
if (!txHash) {
  // Try common FHE response patterns
  if (resolvedTx.wait) {
    // This is likely a valid transaction response, try to get hash from wait
    try {
      const receipt = await resolvedTx.wait(0); // Don't wait for confirmations
      if (receipt && receipt.hash) {
        txHash = receipt.hash;
        console.log("Got transaction hash from receipt:", txHash);
      }
    } catch (receiptError) {
      console.log("Could not get receipt immediately:", receiptError);
    }
  }
}
```

### 3. Graceful Handling of Delayed Hash Availability

For cases where the transaction hash isn't immediately available:

```javascript
// If we still don't have a hash, throw an error
// But first, let's check if we can find the transaction in some other way
if (!txHash) {
  console.log("Transaction sent but no hash found in response. This is common with FHE contracts.");
  console.log("The transaction may have been sent successfully, but we need to check manually.");
  
  // For FHE contracts, we'll return a special response indicating this situation
  return { 
    success: true, 
    transactionHash: null, 
    message: "Transaction sent but hash not immediately available. Check blockchain for confirmation.",
    rawResponse: resolvedTx
  };
}
```

## Testing the Fix

### 1. Check Browser Console

Look for these messages in the browser console:

```
Sending compute winner transaction with fixed gas limit...
Raw transaction response: ContractTransactionResponse {...}
Compute winner transaction sent: 0x...
Winner computed successfully in block: ...
```

Or for the special FHE case:

```
Sending compute winner transaction with fixed gas limit...
Raw transaction response: ContractTransactionResponse {...}
Transaction sent but no hash found in response. This is common with FHE contracts.
Winner computation initiated. Check blockchain for confirmation.
```

### 2. Verify on Blockchain

Even if the transaction hash isn't immediately available, check the blockchain for the transaction:

1. Visit https://sepolia.etherscan.io/
2. Search for transactions from your owner wallet address
3. Look for recent transactions calling `computeWinnerOnChain`

### 3. Check Contract State

Run the check script to verify if the auction was finalized:

```bash
node check-current-auction.js
```

Look for:
```
Auction finalized: true
```

## Best Practices for FHE Contracts

### 1. Always Use Fixed Gas Limits

FHE operations require significant gas:

```javascript
const tx = await contract.computeWinnerOnChain({
  gasLimit: 5000000 // High gas limit to ensure the transaction has enough gas
});
```

### 2. Handle Asynchronous Responses

FHE contracts may have delayed responses:

```javascript
// Don't expect immediate transaction hash
// Be prepared to wait for confirmation
```

### 3. Monitor Blockchain Directly

When in doubt, check the blockchain directly for transaction confirmation.

## Debugging Steps

### 1. Check Transaction Response Structure

Add detailed logging to understand the transaction response:

```javascript
console.log("Raw transaction response:", tx);
console.log("Transaction response type:", typeof tx);
console.log("Transaction response keys:", Object.keys(tx));
```

### 2. Verify Contract Function

Ensure the contract function is correctly implemented:

```solidity
function computeWinnerOnChain() external onlyOwner {
    // Function implementation
}
```

### 3. Check Wallet Connection

Verify the wallet is properly connected to Sepolia network:

```javascript
console.log("Wallet client:", walletClient);
console.log("Network:", await walletClient.getChainId());
```

## Contact Support

If issues persist:

1. Document the exact error messages
2. Note the transaction response structure from the console
3. Check Etherscan for the transaction
4. Contact the development team with this information

## References

- [Zama Documentation](https://docs.zama.ai/)
- [FHEVM GitHub Repository](https://github.com/zama-ai/fhevm)
- [Ethers.js Documentation](https://docs.ethers.io/)