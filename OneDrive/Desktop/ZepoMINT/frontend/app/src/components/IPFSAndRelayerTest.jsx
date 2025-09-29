import React, { useState } from 'react';

const IPFSAndRelayerTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const testIPFSAndRelayer = async () => {
    setIsTesting(true);
    setTestResults(null);

    try {
      const results = {
        envVars: {
          relayerUrl: import.meta.env.VITE_RELAYER_URL,
          kmsContract: import.meta.env.VITE_KMS_VERIFIER_CONTRACT,
          aclContract: import.meta.env.VITE_ACL_CONTRACT,
          inputVerifierContract: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT
        },
        relayerTest: null,
        ipfsTest: null
      };

      // Test relayer URL
      if (results.envVars.relayerUrl) {
        try {
          const response = await fetch(results.envVars.relayerUrl + '/health', { method: 'HEAD' });
          results.relayerTest = {
            status: response.status,
            ok: response.ok,
            message: response.status === 404 ? 'OK (404 expected)' : `Status: ${response.status}`
          };
        } catch (error) {
          results.relayerTest = {
            error: error.message
          };
        }
      }

      // Test IPFS with a known good metadata CID
      try {
        // Import the IPFS utilities
        const { fetchIpfsMetadata } = await import('../utils/ipfsUtils');
        
        // Test with a known good metadata CID
        const testMetadataCID = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR';
        const metadata = await fetchIpfsMetadata(testMetadataCID);
        results.ipfsTest = {
          success: true,
          metadata: metadata
        };
      } catch (error) {
        results.ipfsTest = {
          error: error.message
        };
      }

      setTestResults(results);
    } catch (error) {
      console.error('Test error:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">IPFS and Relayer Test</h2>
      
      <button
        onClick={testIPFSAndRelayer}
        disabled={isTesting}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 mb-4"
      >
        {isTesting ? 'Testing...' : 'Test IPFS and Relayer'}
      </button>

      {testResults && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="font-bold mb-2">Test Results:</h3>
          
          {testResults.error && (
            <div className="text-red-600 mb-2">Error: {testResults.error}</div>
          )}
          
          <div className="mb-2">
            <h4 className="font-semibold">Environment Variables:</h4>
            <div className="ml-4">
              {Object.entries(testResults.envVars || {}).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-medium w-48">{key}:</span>
                  <span className={value ? 'text-green-600' : 'text-red-600'}>
                    {value || 'Not set'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {testResults.relayerTest && (
            <div className="mb-2">
              <h4 className="font-semibold">Relayer Test:</h4>
              <div className="ml-4">
                {testResults.relayerTest.error ? (
                  <span className="text-red-600">Error: {testResults.relayerTest.error}</span>
                ) : (
                  <span className={testResults.relayerTest.ok ? 'text-green-600' : 'text-red-600'}>
                    {testResults.relayerTest.message}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {testResults.ipfsTest && (
            <div className="mb-2">
              <h4 className="font-semibold">IPFS Test:</h4>
              <div className="ml-4">
                {testResults.ipfsTest.error ? (
                  <span className="text-red-600">Error: {testResults.ipfsTest.error}</span>
                ) : (
                  <div>
                    <span className="text-green-600">Success!</span>
                    <div className="text-sm mt-1">
                      Name: {testResults.ipfsTest.metadata?.name || 'N/A'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IPFSAndRelayerTest;