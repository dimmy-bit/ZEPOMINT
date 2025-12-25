import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { testAutoFinalization } from '../utils/auto-finalize-test';

const TestAutoFinalize = () => {
  const [result, setResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState('');

  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const handleTestAutoFinalize = async () => {
    if (!isConnected || !walletClient || !publicClient) {
      setMessage('Please connect your wallet and switch to Sepolia network');
      return;
    }

    setIsTesting(true);
    setMessage('Testing automatic finalization...');
    setResult(null);

    try {
      const testResult = await testAutoFinalization(publicClient, walletClient);
      setResult(testResult);
      setMessage(testResult.message);
    } catch (error) {
      console.error('Error testing auto-finalization:', error);
      setMessage('Error: ' + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Auto Finalization</h1>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                This page allows you to manually test the automatic auction finalization process.
              </p>
              <p className="text-gray-700 mb-4">
                If an auction has ended but not been finalized, this will attempt to automatically finalize it.
              </p>
            </div>
            
            <button
              onClick={handleTestAutoFinalize}
              disabled={isTesting || !isConnected}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-3 px-6 rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isTesting ? 'Testing...' : 'Test Auto Finalization'}
            </button>
            
            {message && (
              <div className={`mt-6 p-4 rounded-lg ${result?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
              </div>
            )}
            
            {result && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Test Results:</h3>
                <pre className="text-sm text-gray-700 overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAutoFinalize;