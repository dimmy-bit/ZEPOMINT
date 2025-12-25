import React, { useState } from 'react';
import { usePublicClient } from 'wagmi';
import { getCurrentAuction, getBidCount, isAuctionInitialized } from '../utils/contract-interaction';

const ContractTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const publicClient = usePublicClient();

  const testContractFunctions = async () => {
    setLoading(true);
    setError('');
    setTestResults(null);

    try {
      console.log("Testing contract functions...");
      
      if (!publicClient) {
        throw new Error("Public client not available");
      }
      
      // Test if auction is initialized
      console.log("Checking if auction is initialized...");
      const initialized = await isAuctionInitialized(publicClient);
      console.log("Auction initialized:", initialized);
      
      // Test getting current auction
      console.log("Fetching current auction...");
      const auction = await getCurrentAuction(publicClient);
      console.log("Current auction:", auction);
      
      // Test getting bid count
      console.log("Fetching bid count...");
      const bidCount = await getBidCount(publicClient);
      console.log("Bid count:", bidCount);
      
      setTestResults({
        initialized,
        auction,
        bidCount
      });
    } catch (err) {
      console.error("Contract test failed:", err);
      setError(`Test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Contract Interaction Test</h2>
      
      <button
        onClick={testContractFunctions}
        disabled={loading || !publicClient}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Contract Functions'}
      </button>
      
      {!publicClient && (
        <p className="text-red-500 mt-2">Public client not available. Please connect your wallet.</p>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {testResults && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          <h3 className="font-semibold">Test Results</h3>
          <p>Auction Initialized: {testResults.initialized ? '✅ Yes' : '❌ No'}</p>
          <p>Bid Count: {testResults.bidCount}</p>
          {testResults.auction && (
            <div className="mt-2">
              <h4 className="font-semibold">Current Auction:</h4>
              <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(testResults.auction, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContractTest;