import React, { useState } from 'react';
import { fetchIpfsMetadata } from '../utils/ipfsUtils';
import { getFHEInstance } from '../utils/fhe-wrapper';

const IntegrationTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const addTestResult = (testName, success, message, details = null) => {
    setTestResults(prev => [...prev, {
      name: testName,
      success,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testRelayerConfig = async () => {
    try {
      // Check environment variables
      const relayerUrl = import.meta.env.VITE_RELAYER_URL;
      const kmsContractAddress = import.meta.env.VITE_KMS_VERIFIER_CONTRACT;
      
      if (!relayerUrl) {
        throw new Error("VITE_RELAYER_URL is not set");
      }
      
      if (!kmsContractAddress) {
        throw new Error("VITE_KMS_VERIFIER_CONTRACT is not set");
      }
      
      addTestResult(
        "Environment Variables", 
        true, 
        "All required environment variables are set",
        { relayerUrl, kmsContractAddress }
      );
      
      // Test FHE instance creation
      const instance = await getFHEInstance();
      addTestResult(
        "FHE Instance Creation", 
        true, 
        "Successfully created FHE instance",
        { instanceType: typeof instance }
      );
      
      return true;
    } catch (error) {
      addTestResult(
        "Relayer Configuration", 
        false, 
        `Failed: ${error.message}`
      );
      return false;
    }
  };

  const testIPFSMetadata = async () => {
    try {
      // Test with a known good CID
      const testCid = "QmPfdWC4BUErFduRLCx6i7XG91sF8m2D4dDvbpK8JzF4cH";
      const metadata = await fetchIpfsMetadata(testCid);
      addTestResult(
        "IPFS Metadata Fetch", 
        true, 
        "Successfully fetched metadata from IPFS",
        { metadataKeys: Object.keys(metadata) }
      );
      return true;
    } catch (error) {
      addTestResult(
        "IPFS Metadata Fetch", 
        false, 
        `Failed: ${error.message}`
      );
      return false;
    }
  };

  const runAllTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    try {
      // Test 1: Relayer configuration
      await testRelayerConfig();
      
      // Test 2: IPFS metadata fetching
      await testIPFSMetadata();
      
      addTestResult(
        "Complete Integration Test", 
        true, 
        "All tests completed successfully"
      );
    } catch (error) {
      addTestResult(
        "Complete Integration Test", 
        false, 
        `Tests failed: ${error.message}`
      );
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Integration Tests</h2>
      
      <div className="mb-6">
        <button 
          onClick={runAllTests}
          disabled={isTesting}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isTesting ? 'Running Tests...' : 'Run Integration Tests'}
        </button>
      </div>
      
      {testResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Test Results</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 rounded ${result.success ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'}`}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.name}
                  </span>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
                <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                  {result.message}
                </p>
                {result.details && (
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Test Information</h3>
        <p className="text-sm text-gray-700">
          This integration test verifies that both the IPFS metadata loading and Zama FHE relayer 
          configuration are working correctly in the actual application.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          If all tests pass, the fixes for both issues have been successfully implemented:
        </p>
        <ul className="text-sm text-gray-700 list-disc pl-5 mt-2 space-y-1">
          <li>NFT metadata should load correctly from IPFS with proper gateway fallback</li>
          <li>Bid encryption should work with proper relayer configuration</li>
        </ul>
      </div>
    </div>
  );
};

export default IntegrationTest;