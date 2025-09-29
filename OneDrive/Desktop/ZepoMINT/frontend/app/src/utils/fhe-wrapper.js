// fhe-wrapper.js - Wrapper for Zama FHE functionality
// Updated to use the new Zama FHE React template approach with CDN loading

import { ZamaConfig } from '../config/zama-config';
import { validateZamaRelayerConfig } from './env-validator';

// We'll load the relayer SDK dynamically using the CDN approach from the new template
let fheInstance = null;
let publicKey = null;

/**
 * Load the Zama Relayer SDK from CDN
 * @returns {Promise} - The loaded relayer SDK
 */
async function loadRelayerSDK() {
  // Check if already loaded
  if (typeof window !== 'undefined' && window.relayerSDK) {
    return window.relayerSDK;
  }

  // Load from CDN like in the new template
  const SDK_CDN_URL = "https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs";
  
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${SDK_CDN_URL}"]`);
    if (existingScript) {
      // Already loaded
      if (window.relayerSDK) {
        resolve(window.relayerSDK);
      } else {
        reject(new Error('Relayer SDK script exists but window.relayerSDK is not available'));
      }
      return;
    }

    const script = document.createElement('script');
    script.src = SDK_CDN_URL;
    script.type = 'text/javascript';
    script.async = true;

    script.onload = () => {
      if (window.relayerSDK) {
        resolve(window.relayerSDK);
      } else {
        reject(new Error('Relayer SDK loaded but window.relayerSDK is not available'));
      }
    };

    script.onerror = () => {
      reject(new Error(`Failed to load Relayer SDK from ${SDK_CDN_URL}`));
    };

    document.head.appendChild(script);
  });
}

/**
 * Initialize the Zama Relayer SDK
 * @returns {Promise<boolean>} - True if initialization successful
 */
async function initializeRelayerSDK() {
  try {
    const relayerSDK = await loadRelayerSDK();
    
    // Check if already initialized
    if (relayerSDK.__initialized__ === true) {
      return true;
    }
    
    // Initialize the SDK
    const result = await relayerSDK.initSDK();
    relayerSDK.__initialized__ = result;
    
    return result;
  } catch (error) {
    console.error('Error initializing Relayer SDK:', error);
    throw new Error(`Relayer SDK initialization failed: ${error.message}`);
  }
}

/**
 * Create FHE instance using the new template approach
 * @param {Object} provider - The Ethereum provider
 * @returns {Promise<Object>} - The FHE instance
 */
async function createFHEInstance(provider) {
  try {
    // Load and initialize the SDK
    await loadRelayerSDK();
    await initializeRelayerSDK();
    
    const relayerSDK = window.relayerSDK;
    
    // Get the Sepolia config from the SDK
    const config = {
      ...relayerSDK.SepoliaConfig,
      network: provider
    };
    
    // Create the instance
    const instance = await relayerSDK.createInstance(config);
    return instance;
  } catch (error) {
    console.error('Error creating FHE instance:', error);
    throw new Error(`FHE instance creation failed: ${error.message}`);
  }
}

/**
 * Initialize FHE instance with proper configuration
 * @param {Object} provider - The provider to use for FHE operations
 * @returns {Promise} - The initialized FHE instance
 */
export async function initializeFHE(provider) {
  try {
    // Validate environment variables
    const validation = validateZamaRelayerConfig();
    if (!validation.isValid) {
      throw new Error(`Zama configuration error: ${validation.error}`);
    }
    
    // Create FHE instance using the new approach
    fheInstance = await createFHEInstance(provider);
    
    // Fetch public key
    publicKey = fheInstance.getPublicKey();
    
    return fheInstance;
  } catch (error) {
    console.error('Error initializing FHE:', error);
    throw new Error(`FHE initialization failed: ${error.message}`);
  }
}

/**
 * Gets the public key from the relayer
 * @returns {Promise} - The public key
 */
export async function getPublicKey() {
  if (!publicKey) {
    throw new Error('Public key not available. FHE instance not initialized.');
  }
  return publicKey;
}

// Encrypt a bid value using FHE
export async function encryptBidValue(instance, contractAddress, userAddress, value) {
  try {
    console.log(`Encrypting bid value: ${value}`);
    
    // Create encrypted input for the bid amount
    const amountInput = instance.createEncryptedInput(contractAddress, userAddress);
    amountInput.add128(BigInt(Math.floor(value * 1e18))); // Convert to smallest unit
    const amountData = await amountInput.encrypt();
    
    // Create encrypted input for the bidder address
    const bidderInput = instance.createEncryptedInput(contractAddress, userAddress);
    bidderInput.addAddress(userAddress);
    const bidderData = await bidderInput.encrypt();
    
    console.log('Encryption completed successfully');
    
    return {
      encryptedAmount: amountData.handles[0],
      bidder: bidderData.handles[0],
      amountProof: amountData.inputProof,
      bidderProof: bidderData.inputProof
    };
  } catch (error) {
    console.error('Error encrypting bid:', error);
    throw new Error(`Bid encryption failed: ${error.message}`);
  }
}

// Fetch public key from the relayer
export async function fetchPublicKey() {
  try {
    console.log('Fetching public key from relayer...');
    
    // Load and initialize SDK
    await loadRelayerSDK();
    await initializeRelayerSDK();
    
    const relayerSDK = window.relayerSDK;
    
    // Create a temporary instance to fetch public key
    const tempInstance = await relayerSDK.createInstance({
      ...relayerSDK.SepoliaConfig,
      network: import.meta.env.VITE_NETWORK_URL || "https://eth-sepolia.g.alchemy.com/v2/kEl3NhorDcbSNncThw3-PbyCrtJcFsKe"
    });
    
    // Get public key
    const publicKey = tempInstance.getPublicKey();
    console.log('Public key fetched successfully');
    
    return publicKey;
  } catch (error) {
    console.error('Failed to fetch public key:', error);
    throw error;
  }
}

// Check if the relayer is healthy
export async function checkRelayerHealth() {
  try {
    const response = await fetch(`${ZamaConfig.relayerUrl}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Get current FHE status
export async function getFHEStatus() {
  try {
    const isHealthy = await checkRelayerHealth();
    let publicKey = null;
    
    if (isHealthy) {
      publicKey = await fetchPublicKey();
    }
    
    return {
      isInitialized: isHealthy,
      publicKeyAvailable: !!publicKey,
      relayerUrl: ZamaConfig.relayerUrl,
      publicKey: publicKey
    };
  } catch (error) {
    console.error('Error getting FHE status:', error);
    return {
      isInitialized: false,
      publicKeyAvailable: false,
      relayerUrl: ZamaConfig.relayerUrl
    };
  }
}

/**
 * Fetches the public key directly from the relayer to avoid WebAssembly issues
 * @returns {Promise<string>} - The public key data
 */
async function fetchPublicKeyDirectly() {
  try {
    console.log('Fetching public key directly from relayer...');
    
    // Get the relayer URL from environment variables
    const relayerUrl = import.meta.env.VITE_RELAYER_URL || "https://relayer.testnet.zama.cloud";
    console.log(`Fetching key info from: ${relayerUrl}/v1/keyurl`);
    
    const response = await fetch(`${relayerUrl}/v1/keyurl`);
    console.log('Relayer response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Relayer request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Relayer response data received');
    
    // Extract the public key URL from the response
    const publicKeyUrl = data.response.fhe_key_info[0].fhe_public_key.urls[0];
    console.log('Public key URL:', publicKeyUrl);
    
    // Fetch the public key directly
    console.log('Fetching public key from:', publicKeyUrl);
    const publicKeyResponse = await fetch(publicKeyUrl);
    console.log('Public key response status:', publicKeyResponse.status);
    
    if (!publicKeyResponse.ok) {
      throw new Error(`Public key request failed with status ${publicKeyResponse.status}`);
    }
    
    const publicKeyData = await publicKeyResponse.text();
    console.log('Public key data length:', publicKeyData.length);
    
    return publicKeyData;
  } catch (error) {
    console.error('Error fetching public key directly:', error);
    throw new Error("Failed to fetch public key directly from relayer: " + error.message);
  }
}

/**
 * Creates an FHE instance with fallback handling for WebAssembly issues
 * @param {Object} config - Configuration for the FHE instance
 * @param {Object} provider - Ethereum provider
 * @returns {Promise<Object>} - The FHE instance
 */
async function createFHEInstanceWithFallback(config, provider) {
  try {
    console.log("Attempting to create FHE instance with relayer SDK...");
    
    // Load and initialize the SDK
    await loadRelayerSDK();
    await initializeRelayerSDK();
    
    const relayerSDK = window.relayerSDK;
    
    // Handle different provider types correctly
    console.log('Processing provider for Zama SDK...');
    
    let networkParam;
    if (provider) {
      // Check if it's an EIP-1193 provider (MetaMask, etc.)
      if (typeof provider.request === 'function') {
        console.log('Provider is EIP-1193 provider, using it directly');
        networkParam = provider;
      } 
      // If it's an ethers BrowserProvider, we need to extract the underlying provider
      else if (provider && typeof provider.getSigner === 'function') {
        console.log('Provider is ethers BrowserProvider, using fallback network URL');
        // For ethers BrowserProvider, use network URL instead
        networkParam = import.meta.env.VITE_NETWORK_URL || "https://eth-sepolia.g.alchemy.com/v2/kEl3NhorDcbSNncThw3-PbyCrtJcFsKe";
      } 
      else if (typeof provider === 'object' && provider !== null && Object.keys(provider).length > 0) {
        // If it's a valid EIP-1193 provider object
        console.log('Using provider object directly');
        networkParam = provider;
      } 
      else {
        // Fallback to network URL
        console.log('Provider is invalid, using fallback network URL');
        networkParam = import.meta.env.VITE_NETWORK_URL || "https://eth-sepolia.g.alchemy.com/v2/kEl3NhorDcbSNncThw3-PbyCrtJcFsKe";
      }
    } else {
      // No provider, use network URL
      console.log('No provider provided, using fallback network URL');
      networkParam = import.meta.env.VITE_NETWORK_URL || "https://eth-sepolia.g.alchemy.com/v2/kEl3NhorDcbSNncThw3-PbyCrtJcFsKe";
    }
    
    console.log('Network parameter for Zama SDK:', networkParam);
    
    // Try to create the instance
    const instanceConfig = {
      ...relayerSDK.SepoliaConfig,
      network: networkParam
    };
    
    const instance = await relayerSDK.createInstance(instanceConfig);
    console.log("FHE instance created successfully");
    return instance;
  } catch (error) {
    console.error("Error creating FHE instance:", error);
    
    // If this is a WebAssembly error, try a fallback approach
    if (error.message.includes('__wbindgen_malloc') || error.message.includes('Impossible to fetch public key')) {
      console.log("WebAssembly or public key error detected, trying fallback approach...");
      // Try with a simpler configuration that might work
      try {
        console.log("Attempting fallback with minimal configuration...");
        await loadRelayerSDK();
        await initializeRelayerSDK();
        
        const relayerSDK = window.relayerSDK;
        
        // Use only the essential parameters without network parameter
        const minimalConfig = {
          ...relayerSDK.SepoliaConfig
        };
        
        const instance = await relayerSDK.createInstance(minimalConfig);
        console.log("FHE instance created successfully with minimal config");
        return instance;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        throw new Error("WebAssembly binding error in Zama SDK. This is a known issue. Please try refreshing the page or using a different browser. Error: " + fallbackError.message);
      }
    }
    
    throw error;
  }
}

/**
 * Encrypts a bid integer value using Zama's FHE SDK with improved error handling
 * @param {number} value - The bid value to encrypt
 * @param {string} contractAddress - The address of the ZepoMintFHE contract
 * @param {string} userAddress - The address of the user submitting the bid
 * @param {Object} provider - The Ethereum provider (wallet client)
 * @returns {Promise<Object>} - Object containing the encrypted bid and proof
 */
export async function encryptBidInteger(value, contractAddress, userAddress, provider) {
  try {
    console.log("Creating FHE instance for Sepolia network using relayer-sdk...");
    
    // Debug what provider is being passed
    console.log('Provider being passed to encryptBidInteger:', provider);
    console.log('Provider type:', typeof provider);
    console.log('Provider constructor:', provider?.constructor?.name);
    console.log('Provider keys:', Object.keys(provider || {}));
    
    // Validate environment variables using the new validation utility
    const validation = validateZamaRelayerConfig();
    
    if (!validation.isValid) {
      console.error("Zama relayer configuration validation failed:", validation.error);
      throw new Error(`Network configuration error: ${validation.error}`);
    }
    
    const config = validation.config;
    const relayerUrl = config.relayerUrl;
    const kmsContractAddress = config.kmsContractAddress;
    
    console.log("Environment variables check in fhe-wrapper:", {
      relayerUrl: relayerUrl,
      kmsContractAddress: kmsContractAddress,
      allEnv: import.meta.env
    });
    
    // Validate relayer URL format
    try {
      new URL(relayerUrl);
    } catch (urlError) {
      throw new Error(`Invalid relayer URL format: ${relayerUrl}`);
    }
    
    // Try to fetch the public key directly first to test connectivity
    try {
      console.log("Testing relayer connectivity by fetching public key...");
      await fetchPublicKeyDirectly();
      console.log("Relayer connectivity test successful");
    } catch (connectivityError) {
      console.error("Relayer connectivity test failed:", connectivityError);
      throw new Error("Failed to connect to Zama relayer. Please check your network connection and relayer URL configuration.");
    }
    
    // Create FHE instance with proper network configuration for Sepolia using the relayer SDK
    const instanceConfig = {
      chainId: parseInt(import.meta.env.VITE_CHAIN_ID) || 11155111, // Sepolia chain ID
      gatewayChainId: parseInt(import.meta.env.VITE_GATEWAY_CHAIN_ID) || 55815, // Gateway chain ID
      relayerUrl: relayerUrl,
      kmsContractAddress: kmsContractAddress,
      aclContractAddress: import.meta.env.VITE_ACL_CONTRACT || "0x687820221192C5B662b25367F70076A37bc79b6c",
      inputVerifierContractAddress: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT || "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4",
      verifyingContractAddressDecryption: import.meta.env.VITE_DECRYPTION_ORACLE_CONTRACT || "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1",
      verifyingContractAddressInputVerification: import.meta.env.VITE_INPUT_VERIFICATION_CONTRACT || "0x7048C39f048125eDa9d678AEbaDfB22F7900a29F",
      fhevmExecutorContract: import.meta.env.VITE_FHEVM_EXECUTOR_CONTRACT || "0x848B0066793BcC60346Da1F49049357399B8D595",
      hcuLimitContract: import.meta.env.VITE_HCU_LIMIT_CONTRACT || "0x594BB474275918AF9609814E68C61B1587c5F838"
    };
    
    console.log("Creating instance with config:", instanceConfig);
    
    // Try to create the instance with fallback handling
    const instance = await createFHEInstanceWithFallback(instanceConfig, provider);
    
    // Create encrypted input
    console.log("Creating encrypted input...");
    const encryptedInput = instance.createEncryptedInput(contractAddress, userAddress);
    encryptedInput.add128(BigInt(Math.floor(value * 1e18))); // Convert to wei-like precision
    
    // Encrypt the input
    console.log("Encrypting input...");
    const encryptedData = await encryptedInput.encrypt();
    console.log("Encryption completed successfully");
    
    return {
      encryptedBid: encryptedData.handles[0],
      inputProof: encryptedData.inputProof
    };
  } catch (error) {
    console.error("Error encrypting bid:", error);
    console.error("Error stack:", error.stack);
    
    // Provide more specific error messages based on the error type
    if (error.message.includes('__wbindgen_malloc') || error.message.includes('Impossible to fetch public key')) {
      throw new Error("Failed to encrypt bid value: WebAssembly binding error in Zama SDK. This is a known issue with the current SDK version. Please try refreshing the page or using a different browser. Technical details: " + error.message);
    } else if (error.message.includes('relayer url') || error.message.includes('relayer URL')) {
      throw new Error("Failed to encrypt bid value: Invalid relayer URL configuration. Please check your VITE_RELAYER_URL environment variable and restart the dev server. Make sure the relayer URL is accessible.");
    } else if (error.message.includes('public key')) {
      throw new Error("Failed to encrypt bid value: Unable to fetch public key from the relayer. Please check your relayer configuration and network connectivity.");
    } else if (error.message.includes('KMS contract address is not valid or empty')) {
      throw new Error("Failed to encrypt bid value: KMS contract address is not valid or empty. Please check your VITE_KMS_VERIFIER_CONTRACT environment variable and restart the dev server.");
    } else if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
      throw new Error("Failed to encrypt bid value: Network error connecting to relayer. Please check your internet connection and try again.");
    } else {
      throw new Error("Failed to encrypt bid value: " + error.message);
    }
  }
}

/**
 * Gets the FHE instance for encryption with improved error handling
 * @returns {Promise<Object>} - The FHE instance
 */
export async function getFHEInstance() {
  try {
    // Validate environment variables using the new validation utility
    const validation = validateZamaRelayerConfig();
    
    if (!validation.isValid) {
      console.error("Zama relayer configuration validation failed:", validation.error);
      throw new Error(`Network configuration error: ${validation.error}`);
    }
    
    const envConfig = validation.config;
    const relayerUrl = envConfig.relayerUrl;
    const kmsContractAddress = envConfig.kmsContractAddress;
    
    // Test relayer connectivity first
    try {
      console.log("Testing relayer connectivity...");
      await fetchPublicKeyDirectly();
      console.log("Relayer connectivity test passed");
    } catch (connectivityError) {
      console.error("Relayer connectivity test failed:", connectivityError);
      throw new Error("Failed to connect to Zama relayer. Please check your network connection and relayer URL configuration.");
    }
    
    // Create and return a real FHE instance with proper network configuration
    const config = {
      chainId: envConfig.chainId || 11155111, // Sepolia chain ID
      gatewayChainId: envConfig.gatewayChainId || 55815, // Gateway chain ID
      relayerUrl: relayerUrl || "https://relayer.testnet.zama.cloud",
      kmsContractAddress: kmsContractAddress || "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
      aclContractAddress: import.meta.env.VITE_ACL_CONTRACT || "0x687820221192C5B662b25367F70076A37bc79b6c",
      inputVerifierContractAddress: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT || "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4",
      verifyingContractAddressDecryption: import.meta.env.VITE_DECRYPTION_ORACLE_CONTRACT || "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1",
      verifyingContractAddressInputVerification: import.meta.env.VITE_INPUT_VERIFICATION_CONTRACT || "0x7048C39f048125eDa9d678AEbaDfB22F7900a29F",
      fhevmExecutorContract: import.meta.env.VITE_FHEVM_EXECUTOR_CONTRACT || "0x848B0066793BcC60346Da1F49049357399B8D595",
      hcuLimitContract: import.meta.env.VITE_HCU_LIMIT_CONTRACT || "0x594BB474275918AF9609814E68C61B1587c5F838"
    };
    
    console.log("Creating FHE instance with config:", config);
    
    // For Zama SDK, we can pass network URL directly
    const networkUrl = import.meta.env.VITE_NETWORK_URL || "https://eth-sepolia.g.alchemy.com/v2/kEl3NhorDcbSNncThw3-PbyCrtJcFsKe";
    
    // Use the new approach with CDN loading
    await loadRelayerSDK();
    await initializeRelayerSDK();
    
    const relayerSDK = window.relayerSDK;
    const instanceConfig = {
      ...relayerSDK.SepoliaConfig,
      network: networkUrl
    };
    
    const instance = await relayerSDK.createInstance(instanceConfig);
    return instance;
  } catch (error) {
    console.error("Error creating FHE instance:", error);
    
    // Provide more specific error messages based on the error type
    if (error.message.includes('__wbindgen_malloc')) {
      throw new Error("Failed to create FHE instance: WebAssembly binding error in Zama SDK. This is a known issue. Please try refreshing the page or using a different browser.");
    } else if (error.message.includes('relayer url') || error.message.includes('relayer URL')) {
      throw new Error("Failed to create FHE instance: Invalid relayer URL. Please check your VITE_RELAYER_URL environment variable.");
    } else if (error.message.includes('KMS contract address is not valid or empty')) {
      throw new Error("Failed to create FHE instance: KMS contract address is not valid or empty. Please check your VITE_KMS_VERIFIER_CONTRACT environment variable.");
    } else {
      throw new Error("Failed to create FHE instance: " + error.message);
    }
  }
}

/**
 * Gets the public FHE key from the contract
 * @param {ethers.Contract} contract - The ZepoMintFHE contract instance
 * @returns {Promise<string>} - The public key
 */
export async function getFHEPublicKey(contract) {
  try {
    // Get the public key URI from the contract
    const publicKeyURI = await contract.publicKeyURI();
    return publicKeyURI;
  } catch (error) {
    console.error("Error getting FHE public key:", error);
    throw new Error("Failed to retrieve FHE public key");
  }
}

/**
 * Submits an encrypted bid to the contract
 * @param {ethers.Contract} contract - The ZepoMintFHE contract instance
 * @param {Object} encryptedData - The encrypted bid data
 * @returns {Promise<ethers.ContractTransaction>} - The transaction
 */
export async function submitEncryptedBid(contract, encryptedData) {
  try {
    // Submit the encrypted bid to the contract
    const tx = await contract.submitBid(
      encryptedData.encryptedBid,
      encryptedData.inputProof
    );
    
    return tx;
  } catch (error) {
    console.error("Error submitting encrypted bid:", error);
    throw new Error("Failed to submit encrypted bid");
  }
}

/**
 * Initializes the Zama relayer for FHE operations
 * @param {string} relayerUrl - The URL of the Zama relayer
 * @returns {Promise<Object>} - The relayer instance
 */
export async function initializeZamaRelayer(relayerUrl) {
  try {
    // Test relayer connectivity first
    try {
      console.log("Testing relayer connectivity...");
      await fetchPublicKeyDirectly();
      console.log("Relayer connectivity test passed");
    } catch (connectivityError) {
      console.error("Relayer connectivity test failed:", connectivityError);
      throw new Error("Failed to connect to Zama relayer. Please check your network connection and relayer URL configuration.");
    }
    
    // Load and initialize the SDK
    await loadRelayerSDK();
    await initializeRelayerSDK();
    
    const relayerSDK = window.relayerSDK;
    
    // Create a real relayer instance
    const config = {
      ...relayerSDK.SepoliaConfig,
      network: import.meta.env.VITE_NETWORK_URL || "https://eth-sepolia.g.alchemy.com/v2/kEl3NhorDcbSNncThw3-PbyCrtJcFsKe"
    };
    
    console.log("Initializing Zama relayer with config:", config);
    
    const instance = await relayerSDK.createInstance(config);
    return instance;
  } catch (error) {
    console.error("Error initializing Zama relayer:", error);
    
    // Provide more specific error messages based on the error type
    if (error.message.includes('__wbindgen_malloc')) {
      throw new Error("Failed to initialize Zama relayer: WebAssembly binding error in Zama SDK. This is a known issue. Please try refreshing the page or using a different browser.");
    } else if (error.message.includes('relayer url')) {
      throw new Error("Failed to initialize Zama relayer: Invalid relayer URL. Please check your configuration.");
    } else if (error.message.includes('KMS contract address is not valid or empty')) {
      throw new Error("Failed to initialize Zama relayer: KMS contract address is not valid or empty. Please check your VITE_KMS_VERIFIER_CONTRACT configuration.");
    } else {
      throw new Error("Failed to initialize Zama relayer: " + error.message);
    }
  }
}

/**
 * Registers encrypted input with the relayer
 * @param {Object} relayer - The relayer instance
 * @param {string} contractAddress - The contract address
 * @param {string} userAddress - The user address
 * @param {number} value - The value to encrypt
 * @returns {Promise<Object>} - The encrypted input data
 */
export async function registerEncryptedInput(relayer, contractAddress, userAddress, value) {
  try {
    // Create and register encrypted input
    const encryptedInput = relayer.createEncryptedInput(contractAddress, userAddress);
    encryptedInput.add128(BigInt(Math.floor(value * 1e18))); // Convert to wei-like precision
    
    const encryptedData = await encryptedInput.encrypt();
    
    return {
      encryptedBid: encryptedData.handles[0],
      inputProof: encryptedData.inputProof
    };
  } catch (error) {
    console.error("Error registering encrypted input:", error);
    throw new Error("Failed to register encrypted input with relayer");
  }
}

/**
 * Generates input proof for encrypted bid
 * @param {Object} instance - The FHE instance
 * @param {string} contractAddress - The contract address
 * @param {string} userAddress - The user address
 * @param {number} value - The bid value
 * @returns {Promise<Object>} - Object containing encrypted bid and input proof
 */
export async function generateBidInputProof(instance, contractAddress, userAddress, value) {
  try {
    console.log(`Generating input proof for bid value: ${value}`);
    
    // Create encrypted input
    const encryptedInput = instance.createEncryptedInput(contractAddress, userAddress);
    
    // Add value as uint128
    encryptedInput.add128(BigInt(Math.floor(value * 1e18))); // Convert to smallest unit
    
    // Encrypt the input
    const encryptedData = await encryptedInput.encrypt();
    console.log('Input proof generation completed successfully');
    
    return {
      encryptedBid: encryptedData.handles[0],
      inputProof: encryptedData.inputProof
    };
  } catch (error) {
    console.error('Error generating bid input proof:', error);
    throw new Error(`Bid input proof generation failed: ${error.message}`);
  }
}

/**
 * Gets the Sepolia network configuration
 * @returns {Object} - Network configuration
 */
export function getSepoliaConfig() {
  return {
    chainId: 11155111,
    rpcUrl: import.meta.env.VITE_NETWORK_URL || "https://eth-sepolia.g.alchemy.com/v2/kEl3NhorDcbSNncThw3-PbyCrtJcFsKe",
    networkName: "Sepolia"
  };
}

/**
 * Gets the localhost network configuration
 * @returns {Object} - Network configuration
 */
export function getLocalhostConfig() {
  return {
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545",
    networkName: "Localhost"
  };
}