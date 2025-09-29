import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { computeWinner, getCurrentAuction, hasAuctionEnded, getBidCount } from '../utils/contract-interaction';

const AutoAuctionFinalizer = ({ contractOwner }) => {
  const [currentAuction, setCurrentAuction] = useState(null);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [bidCount, setBidCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [winnerDetermined, setWinnerDetermined] = useState(false);
  const hasAutoTriggered = useRef(false);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const isOwner = address && contractOwner && address.toLowerCase() === contractOwner.toLowerCase();

  const handleComputeWinner = useCallback(async () => {
    if (!isConnected || !isOwner) {
      setMessage('Only the contract owner can finalize the auction');
      return;
    }
    
    if (!walletClient) {
      setMessage('Please connect your wallet and switch to Sepolia network');
      return;
    }
    
    if (!currentAuction || currentAuction.finalized) {
      setMessage('Auction is already finalized');
      return;
    }
    
    setIsProcessing(true);
    setMessage('Computing winner...');
    setTransactionHash('');
    
    try {
      console.log("Attempting to compute winner...");
      const result = await computeWinner(walletClient);
      console.log("Winner computation result:", result);
      
      if (result.success) {
        // Handle the special case where transaction hash might not be immediately available
        if (result.transactionHash) {
          setTransactionHash(result.transactionHash);
          setMessage('Winner computed successfully!');
        } else {
          // For FHE contracts, the transaction might be sent but hash not immediately available
          setMessage(result.message || 'Winner computation initiated. Check blockchain for confirmation.');
        }
        
        setWinnerDetermined(true);
        
        // Refresh auction data
        if (publicClient) {
          const auction = await getCurrentAuction(publicClient);
          setCurrentAuction(auction);
        }
      } else {
        throw new Error(result.error || 'Failed to compute winner');
      }
    } catch (error) {
      console.error('Error computing winner:', error);
      console.error('Error stack:', error.stack);
      setMessage('Error computing winner: ' + error.message);
    } finally {
      setIsProcessing(false);
      hasAutoTriggered.current = true;
    }
  }, [isConnected, isOwner, walletClient, currentAuction, publicClient]);

  // Fetch auction data
  useEffect(() => {
    const fetchAuctionData = async () => {
      if (publicClient) {
        try {
          const auction = await getCurrentAuction(publicClient);
          setCurrentAuction(auction);
          
          // Check if auction has ended
          const ended = await hasAuctionEnded(publicClient);
          setAuctionEnded(ended);
          
          // Get bid count
          const count = await getBidCount(publicClient);
          setBidCount(count);
          
          // Check if winner is already determined
          if (auction && auction.finalized) {
            setWinnerDetermined(true);
          }
        } catch (error) {
          console.error('Error fetching auction data:', error);
        }
      }
    };
    
    fetchAuctionData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAuctionData, 30000);
    return () => clearInterval(interval);
  }, [publicClient]);

  // Automatically trigger finalization when auction ends and hasn't been finalized yet
  useEffect(() => {
    if (isOwner && auctionEnded && currentAuction && !currentAuction.finalized && !isProcessing && !hasAutoTriggered.current) {
      // Add a small delay to ensure all data is loaded
      const timer = setTimeout(() => {
        console.log("Auto-triggering auction finalization...");
        console.log("Auction ended:", auctionEnded);
        console.log("Current auction:", currentAuction);
        console.log("Is processing:", isProcessing);
        console.log("Has auto triggered:", hasAutoTriggered.current);
        handleComputeWinner();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isOwner, auctionEnded, currentAuction, isProcessing, handleComputeWinner]);

  // Don't render anything if not the owner or auction hasn't ended
  if (!isOwner || !auctionEnded || !currentAuction || currentAuction.finalized) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-yellow-800">Auction Ended - Finalizing Automatically</h3>
          <p className="text-yellow-700 text-sm">
            This auction ended with {bidCount} bid(s). Automatically determining the winner...
          </p>
        </div>
        <div>
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-yellow-500 mr-2"></div>
              <span className="text-yellow-700">Processing...</span>
            </div>
          ) : (
            <button
              onClick={handleComputeWinner}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              disabled={true}
            >
              Auto-Finalizing...
            </button>
          )}
        </div>
      </div>
      
      {message && (
        <div className={`mt-2 text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
          {transactionHash && (
            <div className="mt-1">
              Transaction: <a 
                href={`https://sepolia.etherscan.io/tx/${transactionHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoAuctionFinalizer;