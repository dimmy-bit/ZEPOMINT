import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import RealFHEBidForm from '../components/RealFHEBidForm';
import AuctionFinalizer from '../components/AuctionFinalizer';
import WinnerRevealer from '../components/WinnerRevealer';
import { ZamaConfig } from '../config/zama-config';

const RealFHEAuctionPage = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [auctionData, setAuctionData] = useState(null);
  const [bidCount, setBidCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load auction data
  useEffect(() => {
    const loadAuctionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get RPC URL from environment variables
        const rpcUrl = import.meta.env.VITE_ALCHEMY_RPC_URL || 
                      import.meta.env.VITE_INFURA_RPC_URL || 
                      import.meta.env.VITE_ANKR_RPC_URL || 
                      import.meta.env.VITE_SEPOLIA_RPC_URL ||
                      "https://rpc.sepolia.org";
        
        // Create provider for read operations
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        
        // Get contract instance
        const contract = new ethers.Contract(
          ZamaConfig.contractAddress,
          (await import('../abi/ZepoMINTFHEAuctionComplete.json')).default.abi,
          provider
        );
        
        // Get auction details
        const auctionDetails = await contract.getAuctionDetails();
        setAuctionData({
          metadataCID: auctionDetails.metadataCID,
          endTime: auctionDetails.endTime.toString(),
          finalized: auctionDetails.finalized,
          initialized: auctionDetails.initialized
        });
        
        // Get bid count
        const count = await contract.getBidCount();
        setBidCount(parseInt(count));
        
      } catch (err) {
        console.error('Failed to load auction data:', err);
        setError('Failed to load auction data. Please make sure the contract is deployed and initialized.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAuctionData();
  }, []);

  const handleBidPlaced = async () => {
    // Refresh bid count
    try {
      const rpcUrl = import.meta.env.VITE_ALCHEMY_RPC_URL || 
                    import.meta.env.VITE_INFURA_RPC_URL || 
                    import.meta.env.VITE_ANKR_RPC_URL || 
                    import.meta.env.VITE_SEPOLIA_RPC_URL ||
                    "https://rpc.sepolia.org";
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      const contract = new ethers.Contract(
        ZamaConfig.contractAddress,
        (await import('../abi/ZepoMINTFHEAuctionComplete.json')).default.abi,
        provider
      );
      
      const count = await contract.getBidCount();
      setBidCount(parseInt(count));
    } catch (err) {
      console.error('Failed to refresh bid count:', err);
    }
  };

  const handleAuctionFinalized = async () => {
    // Refresh auction data
    try {
      const rpcUrl = import.meta.env.VITE_ALCHEMY_RPC_URL || 
                    import.meta.env.VITE_INFURA_RPC_URL || 
                    import.meta.env.VITE_ANKR_RPC_URL || 
                    import.meta.env.VITE_SEPOLIA_RPC_URL ||
                    "https://rpc.sepolia.org";
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      const contract = new ethers.Contract(
        ZamaConfig.contractAddress,
        (await import('../abi/ZepoMINTFHEAuctionComplete.json')).default.abi,
        provider
      );
      
      const auctionDetails = await contract.getAuctionDetails();
      setAuctionData({
        metadataCID: auctionDetails.metadataCID,
        endTime: auctionDetails.endTime.toString(),
        finalized: auctionDetails.finalized,
        initialized: auctionDetails.initialized
      });
    } catch (err) {
      console.error('Failed to refresh auction data:', err);
    }
  };

  const handleWinnerRevealed = (winnerAddress) => {
    console.log('Winner revealed:', winnerAddress);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-lg text-gray-600">Loading auction data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Real FHE Auction
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Experience privacy-preserving auctions with Zama's Fully Homomorphic Encryption
          </p>
        </div>

        {!isConnected ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              To participate in the auction, please connect your wallet.
            </p>
            <button
              onClick={() => document.querySelector('button[children="Connect Wallet"]').click()}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Auction Details */}
            {auctionData && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Auction Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Metadata CID</p>
                    <p className="text-lg font-medium text-gray-900">{auctionData.metadataCID}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Time</p>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(auctionData.endTime * 1000).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`text-lg font-medium ${auctionData.finalized ? 'text-green-600' : 'text-orange-600'}`}>
                      {auctionData.finalized ? 'Finalized' : 'Active'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bids</p>
                    <p className="text-lg font-medium text-gray-900">{bidCount}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bid Form */}
            {!auctionData?.finalized && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Place Your Bid</h2>
                <RealFHEBidForm
                  contractAddress={ZamaConfig.contractAddress}
                  provider={publicClient}
                  signer={null} // Will be handled by the component using wagmi
                  onBidPlaced={handleBidPlaced}
                />
              </div>
            )}

            {/* Auction Finalizer */}
            <AuctionFinalizer
              contractAddress={ZamaConfig.contractAddress}
              provider={publicClient}
              signer={null} // Will be handled by the component using wagmi
              auctionData={auctionData}
              bidCount={bidCount}
              onAuctionFinalized={handleAuctionFinalized}
            />

            {/* Winner Revealer */}
            <WinnerRevealer
              contractAddress={ZamaConfig.contractAddress}
              provider={publicClient}
              signer={null} // Will be handled by the component using wagmi
              auctionData={auctionData}
              onWinnerRevealed={handleWinnerRevealed}
            />
          </div>
        )}

        {error && (
          <div className="mt-8 bg-red-50 rounded-xl p-6 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealFHEAuctionPage;