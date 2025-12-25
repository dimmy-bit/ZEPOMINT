import React, { useState } from 'react';
import { encryptBidInteger, getFHEInstance } from '../utils/fhe-wrapper';

const FHERelayerTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');

  const testFHERelayer = async () => {
    setIsTesting(true);
    setError('');
    setTestResult(null);

    try {
      console.log('Testing FHE Relayer connection...');
      
      // Test 1: Check environment variables
      const envVars = {
        relayerUrl: import.meta.env.VITE_RELAYER_URL,
        kmsContract: import.meta.env.VITE_KMS_VERIFIER_CONTRACT,
        aclContract: import.meta.env.VITE_ACL_CONTRACT,
        inputVerifierContract: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT
      };

      console.log('Environment variables:', envVars);

      if (!envVars.relayerUrl) {
        throw new Error('VITE_RELAYER_URL is not set');
      }

      if (!envVars.kmsContract) {
        throw new Error('VITE_KMS_VERIFIER_CONTRACT is not set');
      }

      // Test 2: Create FHE instance
      console.log('Creating FHE instance...');
      const fheInstance = await getFHEInstance();
      console.log('FHE instance created:', fheInstance);

      // Test 3: Try to encrypt a test value
      console.log('Testing encryption...');
      const testValue = 100;
      const contractAddress = "0x1a68a637f729e431dAAF33F20Df7f86c9A885f8c"; // Current contract address
      const userAddress = "0x20dcd85aC3d79D97E1eC05375c45f4d94dD9371a"; // Current owner address

      const encryptedData = await encryptBidInteger(testValue, contractAddress, userAddress);
      console.log('Encryption successful:', encryptedData);

      setTestResult({
        envVars,
        fheInstance: !!fheInstance,
        encryptedData
      });
    } catch (err) {
      console.error('FHE Relayer Test Error:', err);
      setError(err.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">FHE Relayer Connection Test</h2>
      
      <button
        onClick={testFHERelayer}
        disabled={isTesting}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isTesting ? 'Testing...' : 'Test FHE Relayer Connection'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {testResult && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
          <h3 className="font-bold">Test Results:</h3>
          <div className="mt-2">
            <p>✅ Environment Variables Loaded</p>
            <p>✅ FHE Instance Created: {testResult.fheInstance ? 'Yes' : 'No'}</p>
            <p>✅ Encryption Successful: {testResult.encryptedData ? 'Yes' : 'No'}</p>
            
            {testResult.encryptedData && (
              <div className="mt-2">
                <p>Encrypted Data Preview:</p>
                <p className="text-xs font-mono break-all">
                  Handle: {testResult.encryptedData.encryptedBid?.slice(0, 32)}...
                </p>
                <p className="text-xs font-mono break-all">
                  Proof: {testResult.encryptedData.inputProof?.slice(0, 32)}...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FHERelayerTest;