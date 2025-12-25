import React, { useState, useEffect } from 'react';
import { validateZamaRelayerConfig } from '../utils/env-validator';
import { encryptBidInteger } from '../utils/fhe-wrapper';

const ZamaTestPage = () => {
  const [validationResult, setValidationResult] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runValidation = () => {
    const result = validateZamaRelayerConfig();
    setValidationResult(result);
    console.log('Validation result:', result);
  };

  const runTestEncryption = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      // Mock provider for testing
      const mockProvider = {
        request: async (params) => {
          if (params.method === 'eth_accounts') {
            return ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'];
          }
          return null;
        }
      };
      
      // Test with a small bid value
      const result = await encryptBidInteger(
        0.01, // bid amount
        '0x7317A3152B16D1d2d5A9f0856233c739B5aA111e', // contract address
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // user address
        mockProvider // provider
      );
      
      setTestResult({
        success: true,
        data: result
      });
      console.log('Encryption test result:', result);
    } catch (error) {
      console.error('Encryption test error:', error);
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runValidation();
  }, []);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Zama Relayer Configuration Test</h1>
        
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Environment Validation</h2>
            <button
              onClick={runValidation}
              className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
            >
              Re-run Validation
            </button>
          </div>
          
          {validationResult ? (
            <div className={`p-4 rounded-lg ${validationResult.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-semibold">
                Status: {validationResult.isValid ? '✅ Valid' : '❌ Invalid'}
              </p>
              {validationResult.isValid ? (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Configuration Details:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Relayer URL: {validationResult.config.relayerUrl}</li>
                    <li>KMS Contract: {validationResult.config.kmsContractAddress}</li>
                    <li>Network URL: {validationResult.config.networkUrl}</li>
                    <li>Chain ID: {validationResult.config.chainId}</li>
                    <li>Gateway Chain ID: {validationResult.config.gatewayChainId}</li>
                  </ul>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-red-700">Error: {validationResult.error}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Please check your .env file and ensure all required Zama variables are set correctly.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p>Loading validation result...</p>
          )}
        </div>
        
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Encryption Test</h2>
            <button
              onClick={runTestEncryption}
              disabled={loading || (validationResult && !validationResult.isValid)}
              className={`py-1 px-3 rounded text-sm ${
                loading || (validationResult && !validationResult.isValid)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-700 text-white'
              }`}
            >
              {loading ? 'Testing...' : 'Run Encryption Test'}
            </button>
          </div>
          
          {validationResult && !validationResult.isValid ? (
            <div className="p-4 bg-yellow-100 rounded-lg">
              <p>Please fix the environment validation errors before running the encryption test.</p>
            </div>
          ) : testResult ? (
            <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-semibold">
                Test Result: {testResult.success ? '✅ Success' : '❌ Failed'}
              </p>
              {testResult.success ? (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Encrypted Data:</h3>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p><strong>Encrypted Bid:</strong> {testResult.data.encryptedBid}</p>
                    <p className="mt-2"><strong>Input Proof:</strong> {testResult.data.inputProof.substring(0, 100)}...</p>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-red-700">Error: {testResult.error}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    This could be due to network connectivity issues, invalid relayer configuration, or problems with the Zama SDK.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p>Click "Run Encryption Test" to test the Zama FHE encryption functionality.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZamaTestPage;