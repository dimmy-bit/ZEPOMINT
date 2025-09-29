# Zama FHE Sealed-Bid DApp - Fix Checklist

This checklist will help you verify that all three errors have been resolved:

## 1. Fix for "Invalid relayer URL configuration" Error

### ✅ Environment Variables Configuration
- [ ] Verify [.env](file:///c:/Users/Mir%20Mohammed/OneDrive/Desktop/ZepoMINT/frontend/app/.env) file in `frontend/app/` contains:
  ```
  VITE_RELAYER_URL=https://relayer.testnet.zama.cloud
  VITE_KMS_VERIFIER_CONTRACT=0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC
  VITE_ACL_CONTRACT=0x687820221192C5B662b25367F70076A37bc79b6c
  VITE_INPUT_VERIFIER_CONTRACT=0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4
  VITE_DECRYPTION_ORACLE_CONTRACT=0xa02Cda4Ca3a71D7C46997716F4283aa851C28812
  ```

- [ ] Verify backend [.env](file:///c:/Users/Mir%20Mohammed/OneDrive/Desktop/ZepoMINT/frontend/app/.env) file in `backend/` contains:
  ```
  RELAYER_URL=https://relayer.testnet.zama.cloud
  KMS_VERIFIER_CONTRACT=0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC
  INPUT_VERIFIER_CONTRACT=0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4
  DECRYPTION_ORACLE_CONTRACT=0xa02Cda4Ca3a71D7C46997716F4283aa851C28812
  FHEVM_EXECUTOR_CONTRACT=0x848B0066793BcC60346Da1F49049357399B8D595
  ```

### ✅ Code Updates
- [ ] Verify `fhe-wrapper.js` uses correct configuration without gateway URL
- [ ] Verify `RelayerConfigTest.jsx` uses correct configuration without gateway URL
- [ ] Verify all FHE-related functions use the correct contract addresses

### ✅ Restart Development Server
- [ ] Stop the Vite development server (CTRL+C)
- [ ] Start the Vite development server again (`npm run dev`)

## 2. Fix for "KMS contract address is not valid or empty" Error

### ✅ Verify Contract Addresses
All contract addresses should match the official Zama Sepolia addresses:
- KMS Verifier Contract: `0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC`
- ACL Contract: `0x687820221192C5B662b25367F70076A37bc79b6c`
- Input Verifier Contract: `0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4`
- Decryption Oracle Contract: `0xa02Cda4Ca3a71D7C46997716F4283aa851C28812`

### ✅ Verify Contract Existence
You can verify contracts exist using this script:
```javascript
// Test script to verify contract addresses
import { ethers } from 'ethers';

async function testContractAddresses() {
  // Use a public Sepolia RPC
  const provider = new ethers.JsonRpcProvider('https://eth-sepolia.public.blastapi.io');
  
  // Contract addresses from Zama documentation
  const contractAddresses = [
    '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC', // KMS_VERIFIER_CONTRACT
    '0x687820221192C5B662b25367F70076A37bc79b6c', // ACL_CONTRACT
    '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4', // INPUT_VERIFIER_CONTRACT
    '0xa02Cda4Ca3a71D7C46997716F4283aa851C28812'  // DECRYPTION_ORACLE_CONTRACT
  ];
  
  for (const address of contractAddresses) {
    try {
      const code = await provider.getCode(address);
      if (code === '0x') {
        console.log(`❌ No contract found at ${address}`);
      } else {
        console.log(`✅ Contract exists at ${address}`);
      }
    } catch (error) {
      console.log(`❌ Error checking ${address}: ${error.message}`);
    }
  }
}

testContractAddresses().catch(console.error);
```

## 3. Fix for Relayer Config Test Page Failure

### ✅ Verify Relayer URL Accessibility
Test the relayer URL with:
```bash
curl -I "https://relayer.testnet.zama.cloud"
```

Expected response: HTTP 404 with "no Route matched" message (this is normal)

### ✅ Verify Relayer Config Test Component
The `RelayerConfigTest.jsx` component should:
1. Import the relayer SDK correctly
2. Use the correct configuration parameters
3. Handle errors gracefully
4. Display meaningful error messages

## 4. Fix for NFT Preview Not Showing (IPFS Metadata/Image Field)

### ✅ IPFS Metadata Format
Ensure your metadata JSON follows this format:
```json
{
  "name": "Your NFT Name",
  "description": "Your NFT Description",
  "image": "ipfs://QmYourImageCID",
  "attributes": []
}
```

### ✅ IPFS Utility Functions
Use the `ipfsUtils.js` file to convert IPFS URLs to HTTP gateway URLs:
```javascript
/**
 * Converts IPFS URLs to HTTP gateway URLs
 * @param {string} ipfsUrl - The IPFS URL (ipfs://...)
 * @param {string} gateway - The IPFS gateway URL
 * @returns {string} - The HTTP gateway URL
 */
export const convertIpfsUrl = (ipfsUrl, gateway = 'https://ipfs.io/ipfs/') => {
  if (!ipfsUrl) return '';
  
  // If it's already an HTTP URL, return as is
  if (ipfsUrl.startsWith('http')) {
    return ipfsUrl;
  }
  
  // Convert ipfs:// to gateway URL
  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', gateway);
  }
  
  // If it's just a CID, prepend the gateway
  return `${gateway}${ipfsUrl}`;
};
```

### ✅ NFT Preview Component
The `NFTPreview.jsx` component should:
1. Convert IPFS URLs to HTTP gateway URLs
2. Try multiple gateways if one fails
3. Handle loading and error states properly
4. Display meaningful error messages

## 5. WebSocket Unauthorized 3000 Error

This error typically means:
1. Missing or invalid API key for the relayer
2. Trying to connect to a WebSocket endpoint that doesn't exist

### ✅ Solutions
1. Ensure you're not trying to connect to WebSocket endpoints directly
2. Use the HTTP relayer URL instead: `https://relayer.testnet.zama.cloud`
3. Check if you need to provide authentication credentials

## 6. Manual Tests to Verify Everything is Working

### ✅ Test Relayer Connectivity
```bash
curl -I "https://relayer.testnet.zama.cloud"
```

### ✅ Test Contract Addresses
Use the contract verification script above

### ✅ Test FHE Instance Creation
```javascript
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/node';

async function testFHE() {
  try {
    const config = {
      ...SepoliaConfig,
      relayerUrl: 'https://relayer.testnet.zama.cloud'
    };
    
    const instance = await createInstance(config);
    const publicKey = await instance.getPublicKey();
    console.log('✅ FHE setup working correctly');
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}
```

### ✅ Test Bid Encryption
```javascript
async function testBidEncryption() {
  try {
    const config = {
      ...SepoliaConfig,
      relayerUrl: 'https://relayer.testnet.zama.cloud'
    };
    
    const instance = await createInstance(config);
    const encryptedInput = instance.createEncryptedInput(contractAddress, userAddress);
    encryptedInput.add128(BigInt(Math.floor(bidAmount * 1e18)));
    const encryptedData = await encryptedInput.encrypt();
    console.log('✅ Bid encryption working correctly');
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}
```

## 7. Final Verification Steps

1. ✅ Restart your development server after any [.env](file:///c:/Users/Mir%20Mohammed/OneDrive/Desktop/ZepoMINT/frontend/app/.env) changes
2. ✅ Clear browser cache and refresh the page
3. ✅ Check browser console for any errors
4. ✅ Verify all environment variables are loaded correctly
5. ✅ Test placing a bid through the UI
6. ✅ Test viewing NFT previews
7. ✅ Test the relayer config test page

If you follow this checklist and all items are checked, your Zama FHE Sealed-Bid DApp should be working correctly!