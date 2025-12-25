import React, { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { encryptBidInteger, getFHEInstance } from '../utils/fhe-wrapper';

const BiddingTest = () => {
  const [bidAmount, setBidAmount] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [error, setError] = useState('');
  
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const testEncryption = async () => {
    if (!bidAmount) {
      setError('Please enter a bid amount');
      return;
    }
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!walletClient) {
      setError('Please connect your wallet and switch to Sepolia network');
      return;
    }
    
    // Validate bid amount
    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }
    
    setIsTesting(true);
    setError('');
    setTestResult('');
    
    try {
      // Test FHE instance creation
      setTestResult('Testing FHE instance creation...');
      const fheInstance = await getFHEInstance();
      console.log("FHE instance created successfully:", fheInstance);
      
      // Test encryption
      setTestResult('Testing bid encryption...');
      const encryptedData = await encryptBidInteger(
        bidValue,
        "0x7317A3152B16D1d2d5A9f0856233c739B5aA111e", // Test contract address
        address,
        walletClient // Pass the wallet client as provider
      );
      
      console.log("Encrypted data:", encryptedData);
      
      setTestResult(`Encryption successful! Encrypted bid: ${encryptedData.encryptedBid.slice(0, 20)}...`);
    } catch (err) {
      console.error('Error testing encryption:', err);
      setError('Failed to test encryption: ' + (err.message || 'Unknown error occurred'));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-yellow-50 shadow-lg hover:shadow-2xl transition">
      <h2 className="text-2xl font-bold mb-6">Bidding Process Test</h2>
      
      <div className="mb-4">
        <label htmlFor="bidAmount" className="block text-gray-700 text-sm font-bold mb-2">
          Test Bid Amount (ETH)
        </label>
        <input
          type="number"
          id="bidAmount"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="0.0"
          step="0.001"
          min="0"
          required
        />
      </div>
      
      <button
        onClick={testEncryption}
        disabled={isTesting}
        className="bg-[#FFD700] text-white px-6 py-3 rounded-xl text-sm md:text-base font-semibold hover:scale-[1.02] transition disabled:opacity-50 w-full mb-4"
      >
        {isTesting ? 'Testing...' : 'Test Bidding Process'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {testResult && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          {testResult}
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Configuration Status</h3>
        <div className="text-sm text-gray-600">
          <p>Relayer URL: {import.meta.env.VITE_RELAYER_URL || 'Not set'}</p>
          <p>KMS Contract: {import.meta.env.VITE_KMS_VERIFIER_CONTRACT || 'Not set'}</p>
          <p>Input Verifier Contract: {import.meta.env.VITE_INPUT_VERIFIER_CONTRACT || 'Not set'}</p>
          <p>Input Verification Contract: {import.meta.env.VITE_INPUT_VERIFICATION_CONTRACT || 'Not set'}</p>
        </div>
      </div>
    </div>
  );
};

export default BiddingTest;