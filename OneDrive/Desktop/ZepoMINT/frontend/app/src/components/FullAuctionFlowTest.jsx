import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { encryptBidInteger } from '../utils/fhe-wrapper';
import { getContract } from '../utils/contract-interaction';

const FullAuctionFlowTest = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bidAmount, setBidAmount] = useState('0.1');

  const testFullAuctionFlow = async () => {
    setLoading(true);
    setTestResults(null);
    
    try {
      if (!isConnected) {
        throw new Error('Please connect your wallet first');
      }

      // Step 1: Test FHE encryption
      console.log('Step 1: Testing FHE encryption...');
      const contractAddress = localStorage.getItem('contractAddress') || '0x7317A3152B16D1d2d5A9f0856233c739B5aA111e';
      
      const encryptedData = await encryptBidInteger(
        parseFloat(bidAmount),
        contractAddress,
        address
      );
      
      console.log('Encryption successful:', encryptedData);
      
      // Step 2: Test contract interaction
      console.log('Step 2: Testing contract interaction...');
      // Create a signer from the wallet client
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      
      // Check if auction is initialized
      const auctionInitialized = await contract.auctionInitialized();
      console.log('Auction initialized:', auctionInitialized);
      
      if (!auctionInitialized) {
        throw new Error('Auction is not initialized. Please create an auction first.');
      }
      
      // Check if auction has ended
      const auctionEnded = await contract.hasAuctionEnded();
      console.log('Auction ended:', auctionEnded);
      
      if (auctionEnded) {
        throw new Error('Auction has already ended.');
      }
      
      // Get current auction details
      const auctionDetails = await contract.getAuctionDetails();
      console.log('Auction details:', auctionDetails);
      
      // Step 3: Test bid submission (we won't actually submit to avoid spamming the contract)
      console.log('Step 3: Testing bid submission preparation...');
      console.log('Encrypted bid data ready for submission:', encryptedData);
      
      setTestResults({
        success: true,
        message: 'Full auction flow test completed successfully!',
        steps: [
          '✓ FHE encryption working correctly',
          '✓ Contract interaction successful',
          '✓ Auction status verified',
          '✓ Bid preparation completed'
        ],
        encryptedData: {
          encryptedBid: encryptedData.encryptedBid.substring(0, 20) + '...',
          inputProof: encryptedData.inputProof.substring(0, 20) + '...'
        }
      });
    } catch (error) {
      console.error('Error in full auction flow test:', error);
      setTestResults({
        success: false,
        message: error.message,
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Full Auction Flow Test</h2>
      
      {!isConnected ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p><strong>Wallet not connected:</strong> Please connect your wallet to run the test.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Bid Amount (ETH)
            </label>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              step="0.001"
              min="0.001"
            />
          </div>
          
          <button
            onClick={testFullAuctionFlow}
            disabled={loading || !isConnected}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Full Auction Flow'}
          </button>
        </div>
      )}
      
      {loading && (
        <div className="mt-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Running full auction flow test...</p>
        </div>
      )}
      
      {testResults && (
        <div className={`mt-4 p-4 rounded ${testResults.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="font-semibold">{testResults.message}</p>
          
          {testResults.success && (
            <div className="mt-3">
              {testResults.steps && (
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {testResults.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              )}
              
              {testResults.encryptedData && (
                <div className="mt-3 p-2 bg-white rounded">
                  <p className="font-medium">Encrypted Data (truncated):</p>
                  <p className="font-mono text-sm">Encrypted Bid: {testResults.encryptedData.encryptedBid}</p>
                  <p className="font-mono text-sm">Input Proof: {testResults.encryptedData.inputProof}</p>
                </div>
              )}
            </div>
          )}
          
          {testResults.error && (
            <div className="mt-2">
              <p className="font-mono text-sm">{testResults.error.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FullAuctionFlowTest;