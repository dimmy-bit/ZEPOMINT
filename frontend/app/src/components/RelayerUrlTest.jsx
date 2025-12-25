import React, { useState, useEffect } from 'react';

const RelayerUrlTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testRelayerUrl = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult('=== Starting Relayer URL Test ===', 'info');
      
      // Check environment variable
      const relayerUrl = import.meta.env.VITE_RELAYER_URL;
      addResult(`Environment Variable VITE_RELAYER_URL: ${relayerUrl || 'NOT SET'}`, relayerUrl ? 'success' : 'error');
      
      if (!relayerUrl) {
        addResult('❌ FATAL: VITE_RELAYER_URL is not set in .env file', 'error');
        return;
      }
      
      // Validate URL format
      try {
        const url = new URL(relayerUrl);
        addResult(`✅ URL Format Valid: ${url.origin}`, 'success');
      } catch (urlError) {
        addResult(`❌ Invalid URL Format: ${relayerUrl}`, 'error');
        addResult(`Error: ${urlError.message}`, 'error');
        return;
      }
      
      // Test connectivity
      addResult('Testing connectivity to relayer...', 'info');
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(relayerUrl, {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        addResult(`Connectivity Test: ${response.ok ? 'SUCCESS' : 'FAILED'}`, response.ok ? 'success' : 'error');
        addResult(`Status Code: ${response.status}`, 'info');
      } catch (connectError) {
        addResult(`Connectivity Test: FAILED`, 'error');
        addResult(`Error: ${connectError.message}`, 'error');
      }
      
      addResult('=== Relayer URL Test Completed ===', 'success');
    } catch (error) {
      addResult(`Test failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testRelayerUrl();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Relayer URL Configuration Test</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Test Results</h2>
          <button
            onClick={testRelayerUrl}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Run Test Again'}
          </button>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto p-2">
          {testResults.map((result, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg ${
                result.type === 'success' ? 'bg-green-100 border border-green-200' :
                result.type === 'error' ? 'bg-red-100 border border-red-200' :
                'bg-blue-100 border border-blue-200'
              }`}
            >
              <div className="flex items-start">
                <span className="font-mono text-xs text-gray-500 mr-2">[{result.timestamp}]</span>
                <span className="flex-1">
                  {result.type === 'success' && '✅ '}
                  {result.type === 'error' && '❌ '}
                  {result.message}
                </span>
              </div>
            </div>
          ))}
          
          {testResults.length === 0 && !loading && (
            <div className="text-center text-gray-500 py-8">
              No test results yet. Click "Run Test Again" to start.
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Configuration Guide</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Correct .env Configuration:</strong></p>
          <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
            {`VITE_RELAYER_URL=https://relayer.testnet.zama.cloud
VITE_KMS_VERIFIER_CONTRACT=0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC
VITE_INPUT_VERIFIER_CONTRACT=0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4
VITE_ACL_CONTRACT=0x687820221192C5B662b25367F70076A37bc79b6c`}
          </pre>
          
          <p className="mt-3"><strong>Troubleshooting Steps:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ensure the .env file is in the frontend/app directory</li>
            <li>Verify there are no extra spaces or quotes around values</li>
            <li>Restart the development server after .env changes</li>
            <li>Check that @zama-fhe/relayer-sdk is properly installed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RelayerUrlTest;