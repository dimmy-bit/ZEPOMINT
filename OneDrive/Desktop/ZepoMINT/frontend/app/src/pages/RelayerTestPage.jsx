import React, { useState } from 'react';
import { getFHEInstance, encryptBidInteger } from '../utils/fhe-wrapper';

const RelayerTestPage = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testRelayerConnection = async () => {
    setLoading(true);
    setError('');
    setTestResult(null);

    try {
      console.log("Testing relayer connection...");
      
      // Test 1: Check environment variables
      const envVars = {
        VITE_RELAYER_URL: import.meta.env.VITE_RELAYER_URL,
        VITE_KMS_VERIFIER_CONTRACT: import.meta.env.VITE_KMS_VERIFIER_CONTRACT,
        VITE_ACL_CONTRACT: import.meta.env.VITE_ACL_CONTRACT,
        VITE_INPUT_VERIFIER_CONTRACT: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT
      };
      
      console.log("Environment variables:", envVars);
      
      if (!envVars.VITE_RELAYER_URL || !envVars.VITE_KMS_VERIFIER_CONTRACT) {
        throw new Error("Missing required environment variables");
      }
      
      // Test 2: Create FHE instance
      console.log("Creating FHE instance...");
      const instance = await getFHEInstance();
      console.log("FHE instance created:", instance);
      
      // Test 3: Try to encrypt a sample bid
      console.log("Testing bid encryption...");
      const testAddress = "0x0000000000000000000000000000000000000000"; // Dummy address for testing
      const encryptedData = await encryptBidInteger(
        0.1, // 0.1 ETH
        testAddress,
        testAddress
      );
      
      console.log("Encryption successful:", encryptedData);
      
      setTestResult({
        envVars,
        instanceCreated: !!instance,
        encryptionSuccess: !!encryptedData,
        encryptedData
      });
    } catch (err) {
      console.error("Relayer test failed:", err);
      setError(`Test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Relayer Connection Test</h1>
        
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Test Relayer Functionality</h2>
          
          <button
            onClick={testRelayerConnection}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Relayer Connection'}
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {testResult && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
              <h3 className="font-semibold">Test Results</h3>
              <p>Environment Variables: {testResult.envVars.VITE_RELAYER_URL && testResult.envVars.VITE_KMS_VERIFIER_CONTRACT ? '✅ Set' : '❌ Missing'}</p>
              <p>FHE Instance: {testResult.instanceCreated ? '✅ Created' : '❌ Failed'}</p>
              <p>Bid Encryption: {testResult.encryptionSuccess ? '✅ Success' : '❌ Failed'}</p>
              
              {testResult.encryptedData && (
                <div className="mt-2">
                  <h4 className="font-semibold">Encrypted Data:</h4>
                  <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(testResult.encryptedData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Relayer Test Information</h2>
          <p className="text-gray-700">
            This test verifies that the Zama relayer is properly configured and accessible.
            It checks environment variables, creates an FHE instance, and tests bid encryption.
          </p>
          <p className="text-gray-700 mt-2">
            Required environment variables:
          </p>
          <ul className="text-gray-700 list-disc pl-5 mt-1">
            <li>VITE_RELAYER_URL</li>
            <li>VITE_KMS_VERIFIER_CONTRACT</li>
            <li>VITE_ACL_CONTRACT</li>
            <li>VITE_INPUT_VERIFIER_CONTRACT</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RelayerTestPage;