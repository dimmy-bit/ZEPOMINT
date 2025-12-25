import React, { useState, useEffect } from 'react';
import { testRelayerConfig } from '../utils/relayerTest';
import { fetchIpfsMetadata } from '../utils/ipfsUtils';

const VerificationTest = () => {
  const [relayerTestResult, setRelayerTestResult] = useState(null);
  const [ipfsTestResult, setIpfsTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testRelayer = async () => {
    setLoading(true);
    try {
      const result = await testRelayerConfig();
      setRelayerTestResult(result);
    } catch (error) {
      setRelayerTestResult({
        success: false,
        error: error.message,
        message: "Relayer test failed"
      });
    } finally {
      setLoading(false);
    }
  };

  const testIpfs = async () => {
    setLoading(true);
    try {
      // Test with a known good CID
      const testCid = "QmPfdWC4BUErFduRLCx6i7XG91sF8m2D4dDvbpK8JzF4cH";
      const metadata = await fetchIpfsMetadata(testCid);
      setIpfsTestResult({
        success: true,
        metadata,
        message: "IPFS metadata fetch successful"
      });
    } catch (error) {
      setIpfsTestResult({
        success: false,
        error: error.message,
        message: "IPFS metadata fetch failed"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Verification Tests</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Relayer Configuration Test</h3>
        <button 
          onClick={testRelayer}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Relayer Config'}
        </button>
        
        {relayerTestResult && (
          <div className={`mt-4 p-4 rounded ${relayerTestResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={relayerTestResult.success ? 'text-green-800' : 'text-red-800'}>
              {relayerTestResult.message}
            </p>
            {relayerTestResult.config && (
              <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(relayerTestResult.config, null, 2)}
              </pre>
            )}
            {relayerTestResult.error && (
              <p className="text-red-800 mt-2">Error: {relayerTestResult.error}</p>
            )}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">IPFS Metadata Test</h3>
        <button 
          onClick={testIpfs}
          disabled={loading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test IPFS Metadata'}
        </button>
        
        {ipfsTestResult && (
          <div className={`mt-4 p-4 rounded ${ipfsTestResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={ipfsTestResult.success ? 'text-green-800' : 'text-red-800'}>
              {ipfsTestResult.message}
            </p>
            {ipfsTestResult.metadata && (
              <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(ipfsTestResult.metadata, null, 2)}
              </pre>
            )}
            {ipfsTestResult.error && (
              <p className="text-red-800 mt-2">Error: {ipfsTestResult.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationTest;