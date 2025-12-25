import React, { useState } from 'react';
import { encryptBidInteger } from '../utils/fhe-wrapper';

const BidEncryptionTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testEncryption = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      console.log('Starting bid encryption test...');
      
      // Use a dummy contract address and user address for testing
      const dummyContractAddress = '0x7317A3152B16D1d2d5A9f0856233c739B5aA111e';
      const dummyUserAddress = '0x1234567890123456789012345678901234567890';
      const testBidAmount = 1.5;

      console.log('Calling encryptBidInteger with:', {
        bidAmount: testBidAmount,
        contractAddress: dummyContractAddress,
        userAddress: dummyUserAddress
      });

      const result = await encryptBidInteger(
        testBidAmount,
        dummyContractAddress,
        dummyUserAddress
      );

      console.log('Encryption result:', result);
      setTestResult(result);
    } catch (err) {
      console.error('Encryption test failed:', err);
      console.error('Error stack:', err.stack);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Bid Encryption Test</h2>
      
      <div className="mb-4">
        <button
          onClick={testEncryption}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Bid Encryption'}
        </button>
      </div>

      {loading && (
        <div className="py-4">
          <p>Testing bid encryption...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {testResult && (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <h3 className="text-lg font-semibold text-green-700 mb-2">Success</h3>
          <div className="space-y-2">
            <p><strong>Encrypted Bid:</strong> {testResult.encryptedBid}</p>
            <p><strong>Input Proof:</strong> {testResult.inputProof}</p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">Debug Information</h3>
        <p className="text-sm">
          This test directly calls the encryptBidInteger function to check if there are any issues with 
          the relayer configuration or encryption process. Check the browser console for detailed logs.
        </p>
      </div>
    </div>
  );
};

export default BidEncryptionTest;