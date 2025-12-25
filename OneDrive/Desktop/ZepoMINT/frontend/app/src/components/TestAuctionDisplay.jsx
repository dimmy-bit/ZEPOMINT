// TestAuctionDisplay.jsx
// Component to test auction display functionality
import React, { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { getCurrentAuction, getBidCount, hasAuctionEnded } from '../utils/contract-interaction';
import { ethers } from 'ethers';

const TestAuctionDisplay = () => {
  const publicClient = usePublicClient();
  const [auctionData, setAuctionData] = useState(null);
  const [bidCount, setBidCount] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        console.log("Fetching auction data with direct RPC provider");
        
        // Use direct RPC provider for read operations instead of wagmi publicClient
        const rpcUrl = import.meta.env.VITE_ALCHEMY_RPC_URL || 
                       import.meta.env.VITE_INFURA_RPC_URL || 
                       import.meta.env.VITE_ANKR_RPC_URL || 
                       import.meta.env.VITE_SEPOLIA_RPC_URL ||
                       "https://rpc.sepolia.org";
        
        // Create a temporary provider just for this read operation
        const tempProvider = new ethers.JsonRpcProvider(rpcUrl);

        // Get the current auction
        const auctionDataResult = await getCurrentAuction(tempProvider);
        console.log("Raw auction data result:", auctionDataResult);
        setAuctionData(auctionDataResult);

        // Get bid count
        const bidCountResult = await getBidCount(tempProvider);
        console.log("Bid count result:", bidCountResult);
        setBidCount(bidCountResult);

        // Check if auction has ended
        const auctionEnded = await hasAuctionEnded(tempProvider);
        console.log("Auction ended result:", auctionEnded);
        setHasEnded(auctionEnded);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching auction data:', error);
        setError(`Failed to load auction data: ${error.message}`);
        setLoading(false);
      }
    };

    fetchAuctionData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-yellow-100 rounded">
        <p>Loading auction data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 rounded">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-100 rounded">
      <h2 className="text-xl font-bold mb-4">Test Auction Display</h2>
      
      {auctionData ? (
        <div>
          <h3 className="font-bold">Auction Details:</h3>
          <ul className="list-disc pl-5">
            <li>Metadata CID: {auctionData.metadataCID}</li>
            <li>End Time: {auctionData.endTime}</li>
            <li>Finalized: {auctionData.finalized ? 'Yes' : 'No'}</li>
            <li>Initialized: {auctionData.initialized ? 'Yes' : 'No'}</li>
          </ul>
        </div>
      ) : (
        <p>No auction data available</p>
      )}
      
      <div className="mt-4">
        <p>Bid Count: {bidCount}</p>
        <p>Auction Ended: {hasEnded ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default TestAuctionDisplay;