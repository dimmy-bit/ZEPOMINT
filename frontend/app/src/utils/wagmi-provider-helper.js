// wagmi-provider-helper.js - Helper functions to convert wagmi providers to ethers providers
import { ethers } from 'ethers';

/**
 * Convert wagmi provider to ethers provider
 * @param {Object} wagmiProvider - The wagmi provider
 * @returns {ethers.Provider} - The ethers provider
 */
export function getEthersProviderFromWagmi(wagmiProvider) {
  // If it's already an ethers provider, return it as is
  if (wagmiProvider && wagmiProvider._isProvider) {
    return wagmiProvider;
  }
  
  // If it's a wagmi public client, create a new ethers provider with the same RPC URL
  if (wagmiProvider && typeof wagmiProvider.request === 'function') {
    // Use the same RPC URL that's configured in the environment
    const rpcUrl = import.meta.env.VITE_ALCHEMY_RPC_URL || 
                   import.meta.env.VITE_SEPOLIA_RPC_URL ||
                   "https://rpc.sepolia.org";
    
    return new ethers.JsonRpcProvider(rpcUrl);
  }
  
  // Fallback to creating a new provider with the configured RPC URL
  const rpcUrl = import.meta.env.VITE_ALCHEMY_RPC_URL || 
                 import.meta.env.VITE_SEPOLIA_RPC_URL ||
                 "https://rpc.sepolia.org";
  
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Extract signer address from various signer types
 * @param {Object} signer - The signer object
 * @param {Object} provider - The provider object
 * @returns {string|null} - The signer address or null if not found
 */
export async function getSignerAddress(signer, provider) {
  if (!signer) return null;
  
  console.log('Getting signer address from signer:', signer);
  console.log('Signer type:', typeof signer);
  console.log('Signer keys:', Object.keys(signer || {}));
  
  // Handle different signer types with comprehensive fallbacks
  if (typeof signer.getAddress === 'function') {
    // Standard ethers signer
    console.log('Using signer.getAddress() method');
    try {
      return await signer.getAddress();
    } catch (err) {
      console.log('Error getting address from signer.getAddress():', err);
    }
  }
  
  if (signer.address) {
    // Signer with address property
    console.log('Using signer.address property');
    return signer.address;
  }
  
  if (signer.account) {
    // Some signers use account property
    console.log('Using signer.account property');
    if (typeof signer.account === 'string') {
      return signer.account;
    } else if (signer.account.address) {
      return signer.account.address;
    }
  }
  
  if (signer._address) {
    // Some signers use _address property
    console.log('Using signer._address property');
    return signer._address;
  }
  
  if (signer.accounts && Array.isArray(signer.accounts) && signer.accounts.length > 0) {
    // Some signers have accounts array
    console.log('Using signer.accounts[0]');
    return signer.accounts[0];
  }
  
  // Special handling for wagmi wallet client
  if (signer && typeof signer === 'object') {
    // Check if this is a wagmi wallet client
    if (signer.account && signer.account.address) {
      console.log('Got address from wagmi wallet client.account.address');
      return signer.account.address;
    } else if (signer.data && signer.data.account && signer.data.account.address) {
      console.log('Got address from wagmi wallet client.data.account.address');
      return signer.data.account.address;
    } else if (signer.data && signer.data.address) {
      console.log('Got address from wagmi wallet client.data.address');
      return signer.data.address;
    }
  }
  
  // Try to get signer from provider
  if (provider) {
    console.log('Trying to get signer from provider');
    try {
      if (typeof provider.getSigner === 'function') {
        const providerSigner = await provider.getSigner();
        console.log('Provider signer type:', typeof providerSigner);
        console.log('Provider signer keys:', Object.keys(providerSigner || {}));
        
        if (typeof providerSigner.getAddress === 'function') {
          const address = await providerSigner.getAddress();
          console.log('Got address from provider signer:', address);
          return address;
        } else if (providerSigner.address) {
          console.log('Got address from provider signer.address:', providerSigner.address);
          return providerSigner.address;
        } else if (providerSigner.account) {
          if (typeof providerSigner.account === 'string') {
            console.log('Got address from provider signer.account:', providerSigner.account);
            return providerSigner.account;
          } else if (providerSigner.account.address) {
            console.log('Got address from provider signer.account.address:', providerSigner.account.address);
            return providerSigner.account.address;
          }
        } else if (providerSigner._address) {
          console.log('Got address from provider signer._address:', providerSigner._address);
          return providerSigner._address;
        }
      }
    } catch (providerSignerError) {
      console.log('Could not get signer from provider:', providerSignerError);
    }
    
    // Fallback: try to get accounts from provider
    console.log('Trying to get accounts from provider');
    try {
      if (typeof provider.listAccounts === 'function') {
        const accounts = await provider.listAccounts();
        console.log('Accounts from provider:', accounts);
        if (accounts && accounts.length > 0) {
          console.log('Got address from provider accounts:', accounts[0]);
          return accounts[0];
        }
      } else if (typeof provider.getAccounts === 'function') {
        // Some providers use getAccounts
        const accounts = await provider.getAccounts();
        console.log('Accounts from provider (getAccounts):', accounts);
        if (accounts && accounts.length > 0) {
          console.log('Got address from provider getAccounts:', accounts[0]);
          return accounts[0];
        }
      } else if (provider.selectedAddress) {
        // Some providers have selectedAddress property
        console.log('Got address from provider.selectedAddress:', provider.selectedAddress);
        return provider.selectedAddress;
      } else if (provider.accounts && provider.accounts.length > 0) {
        // Some providers have accounts array
        console.log('Got address from provider.accounts:', provider.accounts[0]);
        return provider.accounts[0];
      }
    } catch (accountsError) {
      console.log('Could not get accounts from provider:', accountsError);
    }
  }
  
  // Last resort: try to get from window.ethereum if available
  if (typeof window !== 'undefined' && window.ethereum) {
    console.log('Trying to get accounts from window.ethereum');
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      console.log('Accounts from window.ethereum:', accounts);
      if (accounts && accounts.length > 0) {
        console.log('Got address from window.ethereum:', accounts[0]);
        return accounts[0];
      }
    } catch (ethereumError) {
      console.log('Could not get accounts from window.ethereum:', ethereumError);
    }
  }
  
  console.error('Unable to get user address from any source');
  console.error('Signer:', signer);
  console.error('Provider:', provider);
  return null;
}