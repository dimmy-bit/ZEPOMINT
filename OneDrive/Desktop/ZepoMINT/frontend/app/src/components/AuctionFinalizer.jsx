import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { computeWinner, mintNFT, getCurrentAuction, hasAuctionEnded, getBidCount } from '../utils/contract-interaction';

const AuctionFinalizer = ({ contractOwner }) => {
  const [currentAuction, setCurrentAuction] = useState(null);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [bidCount, setBidCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [winnerDetermined, setWinnerDetermined] = useState(false);
  const [nftMinted, setNftMinted] = useState(false);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const isOwner = address && contractOwner && address.toLowerCase() === contractOwner.toLowerCase();

  // Fetch auction data
  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        // Use direct RPC provider for read operations instead of wagmi publicClient
        const rpcUrl = import.meta.env.VITE_ALCHEMY_RPC_URL || 
                       import.meta.env.VITE_INFURA_RPC_URL || 
                       import.meta.env.VITE_ANKR_RPC_URL || 
                       import.meta.env.VITE_SEPOLIA_RPC_URL ||
                       "https://rpc.sepolia.org";
        
        // Create a temporary provider just for this read operation
        const tempProvider = new ethers.JsonRpcProvider(rpcUrl);
        
        const auction = await getCurrentAuction(tempProvider);
        setCurrentAuction(auction);
        
        // Check if auction has ended
        const ended = await hasAuctionEnded(tempProvider);
        setAuctionEnded(ended);
        
        // Get bid count
        const count = await getBidCount(tempProvider);
        setBidCount(count);
        
        // Check if winner is already determined
        if (auction && auction.finalized) {
          setWinnerDetermined(true);
        }
      } catch (error) {
        console.error('Error fetching auction data:', error);
      }
    };
    
    fetchAuctionData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAuctionData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-finalize auction when it ends (only for owner)
  useEffect(() => {
    const autoFinalize = async () => {
      if (auctionEnded && isOwner && currentAuction && !currentAuction.finalized && bidCount > 0 && !isProcessing) {
        // Automatically compute winner
        await handleComputeWinner();
      }
    };
    
    autoFinalize();
  }, [auctionEnded, isOwner, currentAuction, bidCount, isProcessing]);

  const handleComputeWinner = async () => {
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
      const result = await computeWinner(walletClient);
      setTransactionHash(result.transactionHash);
      setMessage('Winner computed successfully!');
      setWinnerDetermined(true);
      
      // Refresh auction data
      try {
        // Use direct RPC provider for read operations instead of wagmi publicClient
        const rpcUrl = import.meta.env.VITE_ALCHEMY_RPC_URL || 
                       import.meta.env.VITE_INFURA_RPC_URL || 
                       import.meta.env.VITE_ANKR_RPC_URL || 
                       import.meta.env.VITE_SEPOLIA_RPC_URL ||
                       "https://rpc.sepolia.org";
        
        // Create a temporary provider just for this read operation
        const tempProvider = new ethers.JsonRpcProvider(rpcUrl);
        
        const auction = await getCurrentAuction(tempProvider);
        setCurrentAuction(auction);
      } catch (error) {
        console.error('Error refreshing auction data:', error);
      }
    } catch (error) {
      console.error('Error computing winner:', error);
      setMessage('Error computing winner: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMintNFT = async () => {
    if (!isConnected || !isOwner) {
      setMessage('Only the contract owner can mint the NFT');
      return;
    }
    
    if (!walletClient) {
      setMessage('Please connect your wallet and switch to Sepolia network');
      return;
    }
    
    if (!currentAuction || !currentAuction.finalized) {
      setMessage('Auction must be finalized first');
      return;
    }
    
    setIsProcessing(true);
    setMessage('Minting NFT...');
    setTransactionHash('');
    
    try {
      // Use a default tokenId since we don't have winnerIndex in the auction data
      const tokenId = 1;
      const result = await mintNFT(walletClient, tokenId);
      setTransactionHash(result.transactionHash);
      setMessage('NFT minted successfully!');
      setNftMinted(true);
    } catch (error) {
      console.error('Error minting NFT:', error);
      setMessage('Error minting NFT: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render anything if not the owner or auction hasn't ended
  if (!isOwner || !auctionEnded) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-yellow-800">Auction Ended - Auto Finalization</h3>
          <p className="text-yellow-700 text-sm">
            {winnerDetermined 
              ? 'Winner determined. Ready to mint NFT.' 
              : `Auction ended with ${bidCount} bid(s). Finalizing auction...`}
          </p>
        </div>
        <div>
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-yellow-500 mr-2"></div>
              <span className="text-yellow-700">Processing...</span>
            </div>
          ) : winnerDetermined && !nftMinted ? (
            <button
              onClick={handleMintNFT}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Mint NFT
            </button>
          ) : !winnerDetermined ? (
            <button
              onClick={handleComputeWinner}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Finalize Auction
            </button>
          ) : (
            <span className="text-green-600 font-medium">NFT Minted</span>
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

export default AuctionFinalizer;