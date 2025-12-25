// env-validator.js - Utility to validate environment variables
/**
 * Validates that all required environment variables are set
 * @returns {Object} Object containing validation results
 */
export function validateEnvironmentVariables() {
  const requiredVars = [
    'VITE_RELAYER_URL',
    'VITE_KMS_VERIFIER_CONTRACT',
    'VITE_INPUT_VERIFIER_CONTRACT',
    'VITE_ACL_CONTRACT',
    'VITE_DECRYPTION_ORACLE_CONTRACT',
    'VITE_FHEVM_EXECUTOR_CONTRACT',
    'VITE_HCU_LIMIT_CONTRACT',
    'VITE_CHAIN_ID',
    'VITE_GATEWAY_CHAIN_ID',
    'VITE_NETWORK_URL',
    'VITE_CONTRACT_ADDRESS'
  ];
  
  const missingVars = [];
  const envVars = {};
  
  console.log('=== Environment Variable Validation ===');
  console.log('Available environment variables:', import.meta.env);
  
  for (const varName of requiredVars) {
    const value = import.meta.env[varName];
    envVars[varName] = value;
    
    if (!value || value === '') {
      missingVars.push(varName);
      console.error(`❌ Missing environment variable: ${varName}`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  }
  
  const isValid = missingVars.length === 0;
  
  if (!isValid) {
    console.error('Missing environment variables:', missingVars);
  }
  
  return {
    isValid,
    missingVars,
    envVars,
    errorMessage: isValid 
      ? null 
      : `Missing required environment variables: ${missingVars.join(', ')}. Please check your .env file and restart the development server.`
  };
}

/**
 * Gets a validated environment variable with fallback
 * @param {string} varName - The environment variable name
 * @param {string} fallback - Fallback value if variable is not set
 * @returns {string} The environment variable value
 */
export function getEnvVar(varName, fallback = null) {
  const value = import.meta.env[varName];
  if (!value || value === '') {
    console.warn(`Environment variable ${varName} is not set, using fallback: ${fallback}`);
    return fallback;
  }
  return value;
}

/**
 * Validates Zama relayer configuration
 * @returns {Object} Validation result
 */
export function validateZamaRelayerConfig() {
  try {
    // Check required environment variables
    const relayerUrl = import.meta.env.VITE_RELAYER_URL;
    const kmsContract = import.meta.env.VITE_KMS_VERIFIER_CONTRACT;
    const aclContract = import.meta.env.VITE_ACL_CONTRACT;
    const inputVerifier = import.meta.env.VITE_INPUT_VERIFIER_CONTRACT;
    const inputVerification = import.meta.env.VITE_INPUT_VERIFICATION_CONTRACT;
    const decryptionOracle = import.meta.env.VITE_DECRYPTION_ORACLE_CONTRACT;
    const fhevmExecutor = import.meta.env.VITE_FHEVM_EXECUTOR_CONTRACT;
    const hcuLimit = import.meta.env.VITE_HCU_LIMIT_CONTRACT;
    const chainId = import.meta.env.VITE_CHAIN_ID;
    const gatewayChainId = import.meta.env.VITE_GATEWAY_CHAIN_ID;
    const networkUrl = import.meta.env.VITE_NETWORK_URL;
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    
    // Check if required variables are set
    if (!relayerUrl || !kmsContract || !aclContract || !inputVerifier || 
        !inputVerification || !decryptionOracle || !fhevmExecutor || 
        !hcuLimit || !chainId || !gatewayChainId || !networkUrl || !contractAddress) {
      return {
        isValid: false,
        error: 'Missing required environment variables for Zama relayer'
      };
    }
    
    // Validate relayer URL
    try {
      new URL(relayerUrl);
    } catch (e) {
      return {
        isValid: false,
        error: `Invalid relayer URL: ${relayerUrl}`
      };
    }
    
    // Validate contract addresses
    const contractAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!contractAddressRegex.test(kmsContract)) {
      return {
        isValid: false,
        error: `Invalid KMS contract address: ${kmsContract}`
      };
    }
    
    if (!contractAddressRegex.test(aclContract)) {
      return {
        isValid: false,
        error: `Invalid ACL contract address: ${aclContract}`
      };
    }
    
    if (!contractAddressRegex.test(inputVerifier)) {
      return {
        isValid: false,
        error: `Invalid input verifier contract address: ${inputVerifier}`
      };
    }
    
    if (!contractAddressRegex.test(inputVerification)) {
      return {
        isValid: false,
        error: `Invalid input verification contract address: ${inputVerification}`
      };
    }
    
    if (!contractAddressRegex.test(decryptionOracle)) {
      return {
        isValid: false,
        error: `Invalid decryption oracle contract address: ${decryptionOracle}`
      };
    }
    
    if (!contractAddressRegex.test(fhevmExecutor)) {
      return {
        isValid: false,
        error: `Invalid FHEVM executor contract address: ${fhevmExecutor}`
      };
    }
    
    if (!contractAddressRegex.test(hcuLimit)) {
      return {
        isValid: false,
        error: `Invalid HCU limit contract address: ${hcuLimit}`
      };
    }
    
    // Validate chain IDs
    const chainIdInt = parseInt(chainId);
    if (isNaN(chainIdInt)) {
      return {
        isValid: false,
        error: `Invalid chain ID: ${chainId}`
      };
    }
    
    const gatewayChainIdInt = parseInt(gatewayChainId);
    if (isNaN(gatewayChainIdInt)) {
      return {
        isValid: false,
        error: `Invalid gateway chain ID: ${gatewayChainId}`
      };
    }
    
    // Validate network URL
    try {
      new URL(networkUrl);
    } catch (e) {
      return {
        isValid: false,
        error: `Invalid network URL: ${networkUrl}`
      };
    }
    
    // All validations passed
    return {
      isValid: true,
      config: {
        relayerUrl: relayerUrl,
        kmsContractAddress: kmsContract,
        aclContractAddress: aclContract,
        inputVerifierContractAddress: inputVerifier,
        inputVerificationAddress: inputVerification,
        decryptionOracleContractAddress: decryptionOracle,
        fhevmExecutorContractAddress: fhevmExecutor,
        hcuLimitContractAddress: hcuLimit,
        chainId: chainIdInt,
        gatewayChainId: gatewayChainIdInt,
        networkUrl: networkUrl,
        contractAddress: contractAddress
      }
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Environment validation error: ${error.message}`
    };
  }
}

/**
 * Debug function to log all environment variables
 */
export function debugEnvironmentVariables() {
  console.log('=== DEBUG: All Environment Variables ===');
  console.log('import.meta.env:', import.meta.env);
  console.log('typeof import.meta.env:', typeof import.meta.env);
  
  if (import.meta.env) {
    const keys = Object.keys(import.meta.env);
    console.log('Environment variable keys:', keys);
    
    // Log Zama specific variables
    const zamaVars = keys.filter(key => key.includes('VITE_') && (key.includes('RELAYER') || key.includes('KMS') || key.includes('CONTRACT')));
    console.log('Zama related variables:', zamaVars);
    
    zamaVars.forEach(varName => {
      console.log(`${varName}:`, import.meta.env[varName]);
    });
  }
  
  console.log('=== END DEBUG ===');
}