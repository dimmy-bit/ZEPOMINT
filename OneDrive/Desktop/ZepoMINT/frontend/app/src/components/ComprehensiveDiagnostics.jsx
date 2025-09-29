import React, { useState, useEffect } from 'react';

const ComprehensiveDiagnostics = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runComprehensiveTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult('=== Starting Comprehensive Diagnostics ===', 'info');
      
      // Test 1: Environment Variables
      addResult('1. Checking Environment Variables...', 'info');
      await testEnvironmentVariables();
      
      // Test 2: Relayer Connection
      addResult('2. Testing Relayer Connection...', 'info');
      await testRelayerConnection();
      
      // Test 3: IPFS Connectivity
      addResult('3. Testing IPFS Connectivity...', 'info');
      await testIPFSConnectivity();
      
      // Test 4: Contract Interaction
      addResult('4. Testing Contract Interaction...', 'info');
      await testContractInteraction();
      
      addResult('=== Diagnostics Completed ===', 'success');
    } catch (error) {
      addResult(`Diagnostics failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testEnvironmentVariables = async () => {
    const envVars = {
      VITE_RELAYER_URL: import.meta.env.VITE_RELAYER_URL,
      VITE_KMS_VERIFIER_CONTRACT: import.meta.env.VITE_KMS_VERIFIER_CONTRACT,
      VITE_ACL_CONTRACT: import.meta.env.VITE_ACL_CONTRACT,
      VITE_INPUT_VERIFIER_CONTRACT: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT
    };
    
    Object.entries(envVars).forEach(([key, value]) => {
      if (value) {
        addResult(`✓ ${key}: ${value}`, 'success');
      } else {
        addResult(`✗ ${key}: NOT SET`, 'error');
      }
    });
  };

  const testRelayerConnection = async () => {
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
      addResult(`Using KMS contract: ${kmsContractAddress}`, 'info');
      
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
      
      addResult('Configuration created, attempting to create instance...', 'info');
      
      // Try to create instance
      const instance = await createInstance(config);
      addResult('✓ FHE instance created successfully', 'success');
      addResult(`Instance chainId: ${instance.chainId}`, 'info');
      
    } catch (error) {
      addResult(`✗ Relayer connection failed: ${error.message}`, 'error');
      addResult(`Error stack: ${error.stack}`, 'error');
    }
  };

  const testIPFSConnectivity = async () => {
    const testCID = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'; // Known test CID
    const gateways = [
      'https://ipfs.io/ipfs/',
      'https://gateway.pinata.cloud/ipfs/',
      'https://dweb.link/ipfs/',
      'https://nftstorage.link/ipfs/',
      'https://w3s.link/ipfs/'
    ];
    
    addResult(`Testing IPFS connectivity with CID: ${testCID}`, 'info');
    
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
            addResult(`  Content type: ${contentType}`, 'info');
            addResult(`  Data preview: ${JSON.stringify(data).substring(0, 100)}...`, 'info');
            return; // Success, no need to try other gateways
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
    
    addResult('All IPFS gateways failed', 'error');
  };

  const testContractInteraction = async () => {
    try {
      // This would require a wallet connection in a real scenario
      addResult('Contract interaction test placeholder - would require wallet connection', 'info');
      addResult('✓ Contract interaction test structure ready', 'success');
    } catch (error) {
      addResult(`✗ Contract interaction test failed: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    runComprehensiveTests();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">ZepoMINT Comprehensive Diagnostics</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Test Results</h2>
          <button
            onClick={runComprehensiveTests}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run Diagnostics Again'}
          </button>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto p-2">
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
              No test results yet. Click "Run Diagnostics" to start.
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Troubleshooting Guide</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Relayer Issues:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Check that VITE_RELAYER_URL is set to https://relayer.testnet.zama.cloud</li>
            <li>Verify all contract addresses in environment variables</li>
            <li>Ensure @zama-fhe/relayer-sdk is properly installed (v0.2.0)</li>
            <li>Check network connectivity to the relayer endpoint</li>
          </ul>
          
          <p className="mt-3"><strong>IPFS Issues:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Try different IPFS gateways if one is failing</li>
            <li>Check that the CID is valid and accessible</li>
            <li>Verify content type headers when fetching metadata</li>
            <li>Increase timeout values for slow gateways</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveDiagnostics;