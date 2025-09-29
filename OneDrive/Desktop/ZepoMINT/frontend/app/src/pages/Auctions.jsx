import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import NFTPreview from '../components/NFTPreview';
import BidForm from '../components/BidForm';
import { getCurrentAuction, getBidCount, hasAuctionEnded } from '../utils/contract-interaction';

const Auctions = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [auction, setAuction] = useState(null);
  const [bidCount, setBidCount] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  
  // Fetch auction data on component mount
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
        
        // Check if we have valid auction data
        if (!auctionDataResult || !auctionDataResult.metadataCID || auctionDataResult.metadataCID === "") {
          console.log("No valid auction data found, setting auction to null");
          setAuction(null);
        } else {
          console.log("Valid auction data found, setting auction:", auctionDataResult);
          setAuction(auctionDataResult);
        }
        
        // Get bid count
        const bidCountResult = await getBidCount(tempProvider);
        console.log("Bid count result:", bidCountResult);
        setBidCount(bidCountResult);
        
        // Check if auction has ended
        const auctionEnded = await hasAuctionEnded(tempProvider);
        console.log("Auction ended result:", auctionEnded);
        setHasEnded(auctionEnded);
        
        // Set loading to false
        setLoading(false);
      } catch (error) {
        console.error('Error fetching auction data:', error);
        // Set default values on error
        setAuction(null);
        setBidCount(0);
        setHasEnded(false);
        setError(`Failed to load auction data: ${error.message}`);
        setLoading(false);
      }
    };
    
    // Fetch auction data
    fetchAuctionData();
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchAuctionData, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Update time left every second
  useEffect(() => {
    if (!auction || !auction.endTime) return;
    
    const calculateTimeLeft = () => {
      const endTimestamp = parseInt(auction.endTime) * 1000;
      const now = Date.now();
      
      if (now >= endTimestamp) {
        return 'Auction has ended';
      }
      
      const diff = endTimestamp - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else {
        return `${minutes}m ${seconds}s`;
      }
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [auction]);
  
  // Main render
  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
              </div>
              <p className="mt-6 text-xl text-gray-600">Loading auction data...</p>
              <p className="mt-2 text-gray-500">Checking for active auctions</p>
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
              <div className="mt-4 text-sm text-gray-600">
                <p>This could be due to:</p>
                <ul className="list-disc list-inside mt-2 text-left">
                  <li>No auction has been created yet</li>
                  <li>Network connectivity issues</li>
                  <li>Contract not properly deployed</li>
                </ul>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                Retry
              </button>
              <button
                onClick={() => window.location.href='/mint'}
                className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-3 px-6 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                Create New Auction
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If we have auction data
  if (!auction || !auction.metadataCID || auction.metadataCID === "") {
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
              <h2 className="text-2xl font-bold text-gray-900 mt-4">No Active Auctions</h2>
              <p className="mt-2 text-gray-600">There are currently no active auctions running.</p>
              <button
                onClick={() => window.location.href='/mint'}
                className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-3 px-6 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                Create New Auction
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Format time left
  // WORKAROUND: Add a check for ended but not finalized auctions
  const auctionHasEnded = hasEnded || (timeLeft === 'Auction has ended');
  
  // If auction has ended and no bids were placed, show a different message
  // WORKAROUND: Also show a message if auction has ended but is not finalized
  if (auctionHasEnded && bidCount === 0) {
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
              <h2 className="text-2xl font-bold text-gray-900 mt-4">Auction Has Ended</h2>
              <p className="mt-2 text-gray-600">The auction has ended with no bids. Create a new auction to start bidding.</p>
              <button
                onClick={() => window.location.href='/mint'}
                className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-3 px-6 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                Create New Auction
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // WORKAROUND: Show a special message if auction has ended but is not finalized
  if (auctionHasEnded && !auction.finalized) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl shadow-lg p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-4">Auction Ended - Finalization Issue</h2>
              <p className="mt-2 text-yellow-700">
                The auction has ended but finalization is not working due to FHE operations issues.
              </p>
              <p className="mt-2 text-yellow-700">
                This is a known issue with Zama FHEVM on Sepolia testnet.
              </p>
              <div className="mt-4 text-sm text-gray-600">
                <p>What you can do:</p>
                <ul className="list-disc list-inside mt-2 text-left">
                  <li>Use the Owner Console to manually mint an NFT</li>
                  <li>This is only for testing - not for production use</li>
                  <li>Contact Zama support for FHEVM issues</li>
                </ul>
              </div>
              <button
                onClick={() => window.location.href='/owner'}
                className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                Go to Owner Console
              </button>
              <button
                onClick={() => window.location.href='/mint'}
                className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-3 px-6 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                Create New Auction
              </button>
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* NFT Preview Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-1 bg-gradient-to-r from-yellow-400 to-orange-500">
                  <div className="bg-white rounded-xl p-6">
                    <NFTPreview metadataCID={auction.metadataCID} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Auction Details Section */}
            <div>
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Auction Details</h2>
                
                <div className="space-y-5">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Auction Ends</span>
                    <span className="font-bold text-lg">
                      {timeLeft === 'Auction has ended' ? (
                        <span className="text-red-500">Auction Ended</span>
                      ) : (
                        <span className="text-yellow-600">{timeLeft}</span>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Total Bids</span>
                    <span className="font-bold text-lg">{bidCount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Status</span>
                    <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                      auctionHasEnded ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {auctionHasEnded ? 'Ended' : 'Active'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Auction ID</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {auction.metadataCID?.substring(0, 8)}...
                    </span>
                  </div>
                </div>
                
                {/* Bid Form */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Place Your Bid</h3>
                  <BidForm 
                    contractAddress={import.meta.env.VITE_CONTRACT_ADDRESS}
                    provider={publicClient}
                    signer={walletClient}
                    onBidPlaced={() => {
                      // Refresh auction data after bid is placed
                      const fetchAuctionData = async () => {
                        try {
                          const auctionDataResult = await getCurrentAuction(publicClient);
                          
                          // Check if we have valid auction data
                          if (!auctionDataResult || !auctionDataResult.metadataCID || auctionDataResult.metadataCID === "") {
                            setAuction(null);
                          } else {
                            setAuction(auctionDataResult);
                          }
                          
                          const bidCountResult = await getBidCount(publicClient);
                          setBidCount(bidCountResult);
                          
                          const auctionEnded = await hasAuctionEnded(publicClient);
                          setHasEnded(auctionEnded);
                        } catch (error) {
                          console.error('Error refreshing auction data:', error);
                        }
                      };
                      fetchAuctionData();
                    }}
                  />
                </div>
                
                {/* Security Notice */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-bold text-gray-900">Privacy Guarantee</h4>
                      <p className="mt-1 text-sm text-gray-700">
                        Your bid is encrypted using Zama's Fully Homomorphic Encryption technology. 
                        It remains completely private until the auction concludes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auctions;