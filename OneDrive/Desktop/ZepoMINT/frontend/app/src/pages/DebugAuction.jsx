import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { getCurrentAuction, hasAuctionEnded, getBidCount, computeWinner } from '../utils/contract-interaction';

const DebugAuction = () => {
  const [auctionData, setAuctionData] = useState(null);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [bidCount, setBidCount] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Contract owner address (from deployment)
  const contractOwner = "0x20dcd85aC3d79D97E1eC05375c45f4d94dD9371a";

  // Fetch auction data
  useEffect(() => {
    const fetchAuctionData = async () => {
      if (publicClient) {
        try {
          const auction = await getCurrentAuction(publicClient);
          setAuctionData(auction);
          
          // Check if auction has ended
          const ended = await hasAuctionEnded(publicClient);
          setAuctionEnded(ended);
          
          // Get bid count
          const count = await getBidCount(publicClient);
          setBidCount(count);
          
          // Check if current user is owner
          setIsOwner(address && address.toLowerCase() === contractOwner.toLowerCase());
          
          // Set debug info
          setDebugInfo({
            currentTime: Math.floor(Date.now() / 1000),
            currentTimeFormatted: new Date().toISOString(),
            auctionEndTime: auction ? parseInt(auction.endTime) : null,
            auctionEndTimeFormatted: auction ? new Date(parseInt(auction.endTime) * 1000).toISOString() : null,
            timeDifference: auction ? Math.floor(Date.now() / 1000) - parseInt(auction.endTime) : null,
            isOwner: address && address.toLowerCase() === contractOwner.toLowerCase(),
            address: address
          });
        } catch (error) {
          console.error('Error fetching auction data:', error);
          setMessage('Error fetching auction data: ' + error.message);
        }
      }
    };
    
    fetchAuctionData();
    
    // Refresh every 5 seconds for debugging
    const interval = setInterval(fetchAuctionData, 5000);
    return () => clearInterval(interval);
  }, [publicClient, address]);

  const handleManualFinalize = async () => {
    if (!isConnected || !walletClient) {
      setMessage('Please connect your wallet and switch to Sepolia network');
      return;
    }
    
    if (!isOwner) {
      setMessage('Only the contract owner can finalize the auction');
      return;
    }
    
    setIsProcessing(true);
    setMessage('Attempting to finalize auction...');
    
    try {
      const result = await computeWinner(walletClient);
      setMessage('Auction finalized successfully! Transaction: ' + result.transactionHash);
    } catch (error) {
      console.error('Error finalizing auction:', error);
      setMessage('Error finalizing auction: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Auction Debug Information</h1>
          
          {message && (
            <div className="mb-6 p-4 rounded-lg bg-blue-100 text-blue-800">
              {message}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Auction Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Auction Initialized:</span>
                  <span className={auctionData?.initialized ? 'text-green-600 font-bold' : 'text-red-600'}>
                    {auctionData?.initialized ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auction Finalized:</span>
                  <span className={auctionData?.finalized ? 'text-green-600 font-bold' : 'text-red-600'}>
                    {auctionData?.finalized ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auction Ended:</span>
                  <span className={auctionEnded ? 'text-green-600 font-bold' : 'text-red-600'}>
                    {auctionEnded ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bid Count:</span>
                  <span className="font-bold">{bidCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Is Owner:</span>
                  <span className={isOwner ? 'text-green-600 font-bold' : 'text-red-600'}>
                    {isOwner ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Debug Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Time:</span>
                  <span className="font-mono text-sm">{debugInfo.currentTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auction End Time:</span>
                  <span className="font-mono text-sm">{debugInfo.auctionEndTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Difference:</span>
                  <span className="font-mono text-sm">{debugInfo.timeDifference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Address:</span>
                  <span className="font-mono text-sm text-xs">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Owner Address:</span>
                  <span className="font-mono text-sm text-xs">{contractOwner.slice(0, 6)}...{contractOwner.slice(-4)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {isOwner && auctionEnded && auctionData && !auctionData.finalized && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-yellow-800">Manual Finalization</h2>
              <p className="text-yellow-700 mb-4">
                The auction has ended but is not yet finalized. You can manually trigger finalization below.
              </p>
              <button
                onClick={handleManualFinalize}
                disabled={isProcessing}
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
              >
                {isProcessing ? 'Finalizing...' : 'Manually Finalize Auction'}
              </button>
            </div>
          )}
          
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Next Steps</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>If you're the owner and the auction has ended, the system should automatically finalize it</li>
              <li>If automatic finalization isn't working, use the manual finalize button above</li>
              <li>After finalization, the winner can mint their NFT at the /mint-nft page</li>
              <li>Check that your wallet is connected to the Sepolia network</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuction;