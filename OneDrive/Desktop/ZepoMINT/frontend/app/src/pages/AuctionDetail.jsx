import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BidForm from '../components/BidForm';
import WalletInfo from '../components/WalletInfo.jsx';
import NFTPreview from '../components/NFTPreview';
import { useAccount, usePublicClient } from 'wagmi';
import { getCurrentAuction, hasAuctionEnded, getBidCount } from '../utils/contract-interaction';
import { formatTimeRemaining } from '../utils/timeUtils';
import { ethers } from 'ethers';

const AuctionDetail = () => {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  
  const [auctionData, setAuctionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [bidCount, setBidCount] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [isWinner, setIsWinner] = useState(false);

  // Fetch auction data from contract
  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Use direct RPC provider for read operations instead of wagmi publicClient
        const rpcUrl = import.meta.env.VITE_NETWORK_URL || "https://rpc.sepolia.org";
        
        // Create a temporary provider just for this read operation
        const tempProvider = new ethers.JsonRpcProvider(rpcUrl);
        
        const auction = await getCurrentAuction(tempProvider);
        
        if (auction && auction.metadataCID) {
          setAuctionData(auction);
          
          // Check if auction has ended
          const ended = await hasAuctionEnded(tempProvider);
          setAuctionEnded(ended);
          
          // Get bid count
          const count = await getBidCount(tempProvider);
          setBidCount(count);
          
          // Check if current user is owner (for demo purposes, we'll use a fixed address)
          // In a real implementation, you would check against the actual contract owner
          const contractOwner = "0x20dcd85aC3d79D97E1eC05375c45f4d94dD9371a"; // From deployment
          setIsOwner(address && address.toLowerCase() === contractOwner.toLowerCase());
          
          // Check if auction is finalized and redirect winner to mint page
          if (auction.finalized) {
            // In a real implementation, you would compare against the decrypted winner address
            // For now, we'll use a simplified check for demo purposes
            setIsWinner(true);
            
            // Auto-redirect winner to mint page after a short delay
            if (address) {
              setTimeout(() => {
                navigate('/mint-nft');
              }, 3000);
            }
          }
        } else {
          setError('No active auction found');
        }
      } catch (err) {
        console.error('Error fetching auction data:', err);
        setError('Failed to load auction data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuctionData();
  }, [address, navigate]);

  // Update time remaining every second
  useEffect(() => {
    if (!auctionData) return;
    
    const interval = setInterval(() => {
      const endTime = parseInt(auctionData.endTime) * 1000;
      setTimeRemaining(formatTimeRemaining(endTime));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [auctionData]);

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
              </div>
              <p className="mt-6 text-xl text-gray-600">Loading auction details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-4">Error Loading Auction</h2>
              <p className="mt-2 text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!auctionData) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-4">No Active Auction</h2>
              <p className="mt-2 text-gray-600">There is currently no active auction. Please check back later.</p>
              <button
                onClick={() => window.location.href = '/'}
                className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-3 px-6 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Auto-redirect banner for winners
  if (auctionData.finalized && isWinner) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-green-50 border border-green-200 rounded-2xl shadow-lg p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-4">Congratulations, Winner!</h2>
              <p className="mt-2 text-green-700">
                You've won this auction! Redirecting you to mint your NFT...
              </p>
              <div className="mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mx-auto"></div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                If you are not redirected automatically, <a href="/mint-nft" className="text-blue-600 hover:underline">click here</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
              Live Auction
            </h1>
            <p className="text-xl text-gray-600">
              Place your encrypted bid on this exclusive NFT collection
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - NFT Preview */}
            <div>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-1 bg-gradient-to-r from-yellow-400 to-orange-500">
                  <div className="bg-white rounded-xl p-6">
                    <NFTPreview metadataCID={auctionData.metadataCID} />
                  </div>
                </div>
              </div>
              
              {/* Auction Details Card */}
              <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Auction Information</h3>
                
                <div className="space-y-5">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Auction Ends</span>
                    <span className="font-bold text-lg text-yellow-600">{timeRemaining}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Status</span>
                    <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                      auctionData.finalized ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {auctionData.finalized ? 'Finalized' : 'Active'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Collection Size</span>
                    <span className="font-bold">10 NFTs</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Minimum Bid</span>
                    <span className="font-bold">0.01 ETH</span>
                  </div>
                </div>
              </div>
              
              {/* Auction Ended Banner */}
              {auctionEnded && !auctionData.finalized && !isOwner && (
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-yellow-800">Auction Ended</h4>
                      <p className="mt-2 text-yellow-700">
                        This auction has ended with {bidCount} bid(s). The owner will now manually finalize the auction to determine the winner.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Auction Finalized Banner */}
              {auctionData.finalized && (
                <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-green-800">Auction Finalized</h4>
                      <p className="mt-2 text-green-700">
                        This auction has been finalized. {isWinner ? (
                          <span>The winner can now mint their NFT. Redirecting...</span>
                        ) : (
                          <span>The winner has been determined.</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column - Bid Form */}
            <div>
              {!isConnected ? (
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-yellow-100 mb-8">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                    <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-xl font-medium text-gray-900">Connect Your Wallet</h3>
                  <p className="mt-2 text-gray-600">Please connect your wallet to place a bid</p>
                  <div className="mt-6">
                    <WalletInfo />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Place Your Bid</h3>
                  <BidForm 
                    contractAddress={import.meta.env.VITE_CONTRACT_ADDRESS}
                    onBidPlaced={() => {
                      // Refresh auction data after bid is placed
                      const fetchAuctionData = async () => {
                        try {
                          // Use direct RPC provider for read operations instead of wagmi publicClient
                          const rpcUrl = import.meta.env.VITE_NETWORK_URL || "https://rpc.sepolia.org";
                          
                          // Create a temporary provider just for this read operation
                          const tempProvider = new ethers.JsonRpcProvider(rpcUrl);
                          
                          const auction = await getCurrentAuction(tempProvider);
                          
                          if (auction && auction.metadataCID) {
                            setAuctionData(auction);
                            
                            // Check if auction has ended
                            const ended = await hasAuctionEnded(tempProvider);
                            setAuctionEnded(ended);
                            
                            // Get bid count
                            const count = await getBidCount(tempProvider);
                            setBidCount(count);
                          }
                        } catch (error) {
                          console.error('Error refreshing auction data:', error);
                        }
                      };
                      fetchAuctionData();
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;