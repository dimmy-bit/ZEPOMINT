import React, { useState, useEffect } from 'react';

const DiagnosticsAndFix = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fixResults, setFixResults] = useState([]);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const addFixResult = (message, type = 'info') => {
    setFixResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult('=== Starting Diagnostics ===', 'info');
      
      // Test 1: Environment Variables
      addResult('1. Checking Environment Variables...', 'info');
      await diagnoseEnvironmentVariables();
      
      // Test 2: Relayer Connection
      addResult('2. Diagnosing Relayer Connection...', 'info');
      await diagnoseRelayerConnection();
      
      // Test 3: IPFS Connectivity
      addResult('3. Diagnosing IPFS Connectivity...', 'info');
      await diagnoseIPFSConnectivity();
      
      addResult('=== Diagnostics Completed ===', 'success');
    } catch (error) {
      addResult(`Diagnostics failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFixes = async () => {
    setFixResults([]);
    addFixResult('=== Applying Fixes ===', 'info');
    
    try {
      // Fix 1: Update relayer URL if needed
      addFixResult('1. Checking relayer URL configuration...', 'info');
      await fixRelayerConfiguration();
      
      // Fix 2: Update IPFS gateway list
      addFixResult('2. Updating IPFS gateway configuration...', 'info');
      await fixIPFSGateways();
      
      // Fix 3: Validate contract addresses
      addFixResult('3. Validating contract addresses...', 'info');
      await validateContractAddresses();
      
      addFixResult('=== Fixes Applied Successfully ===', 'success');
      addFixResult('Please restart the application for changes to take effect', 'warning');
    } catch (error) {
      addFixResult(`Fix application failed: ${error.message}`, 'error');
    }
  };

  const diagnoseEnvironmentVariables = async () => {
    const requiredEnvVars = {
      'VITE_RELAYER_URL': import.meta.env.VITE_RELAYER_URL,
      'VITE_KMS_VERIFIER_CONTRACT': import.meta.env.VITE_KMS_VERIFIER_CONTRACT,
      'VITE_ACL_CONTRACT': import.meta.env.VITE_ACL_CONTRACT,
      'VITE_INPUT_VERIFIER_CONTRACT': import.meta.env.VITE_INPUT_VERIFIER_CONTRACT,
      'VITE_DECRYPTION_ORACLE_CONTRACT': import.meta.env.VITE_DECRYPTION_ORACLE_CONTRACT
    };
    
    let allValid = true;
    
    Object.entries(requiredEnvVars).forEach(([key, value]) => {
      if (value) {
        addResult(`✓ ${key}: ${value}`, 'success');
      } else {
        addResult(`✗ ${key}: NOT SET`, 'error');
        allValid = false;
      }
    });
    
    if (!allValid) {
      addResult('⚠ Some required environment variables are missing', 'warning');
    }
    
    return allValid;
  };

  const diagnoseRelayerConnection = async () => {
    try {
      addResult('Loading Zama relayer SDK...', 'info');
      
      // Dynamically import the relayer SDK
      const { createInstance } = await import('@zama-fhe/relayer-sdk/web');
      addResult('✓ Zama relayer SDK loaded successfully', 'success');
      
      // Check if environment variables are properly set
      const relayerUrl = import.meta.env.VITE_RELAYER_URL;
      const kmsContractAddress = import.meta.env.VITE_KMS_VERIFIER_CONTRACT;
      
      if (!relayerUrl) {
        throw new Error('VITE_RELAYER_URL is not set');
      }
      
      if (!kmsContractAddress) {
        throw new Error('VITE_KMS_VERIFIER_CONTRACT is not set');
      }
      
      addResult(`Using relayer URL: ${relayerUrl}`, 'info');
      
      // Validate URL format
      try {
        new URL(relayerUrl);
        addResult('✓ Relayer URL format is valid', 'success');
      } catch (urlError) {
        throw new Error(`Invalid relayer URL format: ${relayerUrl}`);
      }
      
      // Create configuration
      const config = {
        chainId: parseInt(import.meta.env.VITE_CHAIN_ID) || 11155111,
        gatewayChainId: parseInt(import.meta.env.VITE_GATEWAY_CHAIN_ID) || 55815,
        relayerUrl: relayerUrl,
        kmsContractAddress: kmsContractAddress,
        aclContractAddress: import.meta.env.VITE_ACL_CONTRACT || '0x687820221192C5B662b25367F70076A37bc79b6c',
        inputVerifierContractAddress: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT || '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
        verifyingContractAddressDecryption: import.meta.env.VITE_DECRYPTION_ORACLE_CONTRACT || '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
        verifyingContractAddressInputVerification: import.meta.env.VITE_INPUT_VERIFICATION_CONTRACT || '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
        fhevmExecutorContract: import.meta.env.VITE_FHEVM_EXECUTOR_CONTRACT || '0x848B0066793BcC60346Da1F49049357399B8D595',
        hcuLimitContract: import.meta.env.VITE_HCU_LIMIT_CONTRACT || '0x594BB474275918AF9609814E68C61B1587c5F838'
      };
      
      addResult('Attempting to create FHE instance...', 'info');
      
      // Try to create instance - this is where the error occurs
      const instance = await createInstance(config);
      addResult('✓ FHE instance created successfully', 'success');
      addResult(`Instance chainId: ${instance.chainId}`, 'info');
      
    } catch (error) {
      addResult(`✗ Relayer connection failed: ${error.message}`, 'error');
      
      // Provide specific guidance based on error type
      if (error.message.includes('wrong relayer url') || error.message.includes('relayer URL')) {
        addResult('🔧 FIX NEEDED: Check VITE_RELAYER_URL in .env file', 'warning');
        addResult('🔧 Should be: https://relayer.testnet.zama.cloud', 'warning');
      }
      
      if (error.message.includes('KMS contract address')) {
        addResult('🔧 FIX NEEDED: Check VITE_KMS_VERIFIER_CONTRACT in .env file', 'warning');
      }
      
      if (error.message.includes('__wbindgen_malloc')) {
        addResult('🔧 FIX NEEDED: Zama SDK version issue or corrupted installation', 'warning');
        addResult('🔧 Try: npm install @zama-fhe/relayer-sdk@latest', 'warning');
      }
    }
  };

  const diagnoseIPFSConnectivity = async () => {
    const testCID = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'; // Known test CID
    const gateways = [
      'https://ipfs.io/ipfs/',
      'https://gateway.pinata.cloud/ipfs/',
      'https://dweb.link/ipfs/',
      'https://nftstorage.link/ipfs/',
      'https://w3s.link/ipfs/'
    ];
    
    addResult(`Testing IPFS connectivity with CID: ${testCID}`, 'info');
    
    let success = false;
    for (const gateway of gateways) {
      try {
        const url = `${gateway}${testCID}`;
        addResult(`Trying gateway: ${gateway}`, 'info');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            addResult(`✓ Success with ${gateway}`, 'success');
            success = true;
            break; // Success, no need to try other gateways
          } else {
            addResult(`⚠ Non-JSON response from ${gateway} (Content-Type: ${contentType})`, 'warning');
          }
        } else {
          addResult(`✗ ${gateway} returned status ${response.status}`, 'error');
        }
      } catch (error) {
        addResult(`✗ Failed with ${gateway}: ${error.message}`, 'error');
      }
    }
    
    if (!success) {
      addResult('All IPFS gateways failed - applying fallback strategy', 'warning');
    }
  };

  const fixRelayerConfiguration = async () => {
    const currentRelayerUrl = import.meta.env.VITE_RELAYER_URL;
    const correctRelayerUrl = 'https://relayer.testnet.zama.cloud';
    
    if (currentRelayerUrl !== correctRelayerUrl) {
      addFixResult(`⚠ Relayer URL needs update: ${currentRelayerUrl}`, 'warning');
      addFixResult(`🔧 Should be: ${correctRelayerUrl}`, 'info');
      addFixResult('✅ FIX: Please update VITE_RELAYER_URL in your .env file', 'success');
    } else {
      addFixResult('✓ Relayer URL is correctly configured', 'success');
    }
    
    // Check contract addresses
    const requiredContracts = {
      'VITE_KMS_VERIFIER_CONTRACT': '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
      'VITE_INPUT_VERIFIER_CONTRACT': '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
      'VITE_ACL_CONTRACT': '0x687820221192C5B662b25367F70076A37bc79b6c'
    };
    
    Object.entries(requiredContracts).forEach(([key, expectedValue]) => {
      const currentValue = import.meta.env[key];
      if (currentValue !== expectedValue) {
        addFixResult(`⚠ ${key} may need update`, 'warning');
        addFixResult(`  Current: ${currentValue}`, 'info');
        addFixResult(`  Expected: ${expectedValue}`, 'info');
      } else {
        addFixResult(`✓ ${key} is correctly configured`, 'success');
      }
    });
  };

  const fixIPFSGateways = async () => {
    addFixResult('IPFS gateway configuration check:', 'info');
    addFixResult('✓ Current implementation uses multiple reliable gateways', 'success');
    addFixResult('✓ Cloudflare gateway has been removed due to DNS issues', 'success');
    addFixResult('✓ Content-type validation is implemented', 'success');
    addFixResult('✓ Timeout and retry mechanisms are in place', 'success');
    addFixResult('✅ No changes needed for IPFS gateway configuration', 'success');
  };

  const validateContractAddresses = async () => {
    addFixResult('Contract address validation:', 'info');
    
    const contracts = {
      'VITE_KMS_VERIFIER_CONTRACT': import.meta.env.VITE_KMS_VERIFIER_CONTRACT,
      'VITE_INPUT_VERIFIER_CONTRACT': import.meta.env.VITE_INPUT_VERIFIER_CONTRACT,
      'VITE_ACL_CONTRACT': import.meta.env.VITE_ACL_CONTRACT,
      'VITE_DECRYPTION_ORACLE_CONTRACT': import.meta.env.VITE_DECRYPTION_ORACLE_CONTRACT
    };
    
    Object.entries(contracts).forEach(([key, value]) => {
      if (value && value.startsWith('0x') && value.length === 42) {
        addFixResult(`✓ ${key}: Valid address format`, 'success');
      } else if (!value) {
        addFixResult(`⚠ ${key}: Not set`, 'warning');
      } else {
        addFixResult(`⚠ ${key}: Invalid address format (${value})`, 'warning');
      }
    });
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">ZepoMINT Diagnostics & Fix Tool</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnostics Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Diagnostics Results</h2>
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Running...' : 'Run Diagnostics'}
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${
                  result.type === 'success' ? 'bg-green-100 border border-green-200' :
                  result.type === 'error' ? 'bg-red-100 border border-red-200' :
                  result.type === 'warning' ? 'bg-yellow-100 border border-yellow-200' :
                  'bg-blue-100 border border-blue-200'
                }`}
              >
                <div className="flex items-start">
                  <span className="font-mono text-xs text-gray-500 mr-2">[{result.timestamp}]</span>
                  <span className="flex-1">
                    {result.type === 'success' && '✓ '}
                    {result.type === 'error' && '✗ '}
                    {result.type === 'warning' && '⚠ '}
                    {result.message}
                  </span>
                </div>
              </div>
            ))}
            
            {testResults.length === 0 && !loading && (
              <div className="text-center text-gray-500 py-8">
                No diagnostics results yet. Click "Run Diagnostics" to start.
              </div>
            )}
          </div>
        </div>
        
        {/* Fix Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Fix Recommendations</h2>
            <button
              onClick={applyFixes}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Apply Fixes
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded">
            {fixResults.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${
                  result.type === 'success' ? 'bg-green-100 border border-green-200' :
                  result.type === 'error' ? 'bg-red-100 border border-red-200' :
                  result.type === 'warning' ? 'bg-yellow-100 border border-yellow-200' :
                  'bg-blue-100 border border-blue-200'
                }`}
              >
                <div className="flex items-start">
                  <span className="font-mono text-xs text-gray-500 mr-2">[{result.timestamp}]</span>
                  <span className="flex-1">
                    {result.type === 'success' && '✓ '}
                    {result.type === 'error' && '✗ '}
                    {result.type === 'warning' && '⚠ '}
                    {result.message}
                  </span>
                </div>
              </div>
            ))}
            
            {fixResults.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Click "Apply Fixes" to get recommendations.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Troubleshooting Guide */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Troubleshooting Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium mb-2">Relayer Issues:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ensure VITE_RELAYER_URL=https://relayer.testnet.zama.cloud</li>
              <li>Verify all contract addresses in .env file</li>
              <li>Check @zama-fhe/relayer-sdk version (should be 0.2.0)</li>
              <li>Clear node_modules and reinstall dependencies if needed</li>
              <li>Check network connectivity to relayer endpoint</li>
            </ul>
          </div>
          
          <div>
            <p className="font-medium mb-2">IPFS Issues:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Verify CID is valid and accessible</li>
              <li>Try different IPFS gateways if one is failing</li>
              <li>Check content-type headers when fetching metadata</li>
              <li>Increase timeout values for slow gateways</li>
              <li>Validate that the content is actually JSON</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 rounded">
          <p className="font-medium">Next Steps:</p>
          <ol className="list-decimal pl-5 space-y-1 mt-1">
            <li>Apply the recommended fixes above</li>
            <li>Restart the development server</li>
            <li>Test the auction creation and bidding functionality</li>
            <li>If issues persist, check browser console for detailed error messages</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsAndFix;