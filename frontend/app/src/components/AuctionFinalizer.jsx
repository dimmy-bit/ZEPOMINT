import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { usePublicClient, useWalletClient, useAccount } from 'wagmi';
import { getFHEInstance } from '../utils/fhe-wrapper';
import ZepoMintFHEData from '../abi/ZepoMINTFHEAuctionComplete.json' with { type: 'json' };

const AuctionFinalizer = ({ contractAddress, auctionData, bidCount, onAuctionFinalized }) => {
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState(null);
  const [winnerData, setWinnerData] = useState(null);
  const [isCheckingWinner, setIsCheckingWinner] = useState(false);
  
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Check if auction has ended
  const hasAuctionEnded = () => {
    if (!auctionData || !auctionData.endTime) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= parseInt(auctionData.endTime);
  };

  // Check if auction is eligible for finalization
  const canFinalize = () => {
    return auctionData && 
           auctionData.initialized && 
           !auctionData.finalized && 
           hasAuctionEnded();
  };

  const handleFinalize = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!walletClient) {
      setError('Wallet client not available. Please check your wallet connection.');
      return;
    }
    
    if (!canFinalize()) {
      setError('Auction cannot be finalized yet');
      return;
    }
    
    setIsFinalizing(true);
    setError(null);
    setSuccess(false);
    setTransactionHash(null);
    
    try {
      // Get contract instance
      const contract = new ethers.Contract(
        contractAddress,
        ZepoMintFHEData.abi,
        walletClient
      );
      
      // Estimate gas
      let gasLimit;
      try {
        gasLimit = await contract.smartFinalize.estimateGas();
        // Add 20% buffer to gas estimate
        gasLimit = (gasLimit * 120n) / 100n;
      } catch (gasError) {
        console.warn('Could not estimate gas, using default limit:', gasError);
        gasLimit = 1000000n; // Higher gas limit for FHE operations
      }
      
      // Finalize the auction
      const tx = await contract.smartFinalize({
        gasLimit: gasLimit
      });
      
      console.log('Finalization transaction sent:', tx);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Finalization transaction confirmed:', receipt);
      
      setTransactionHash(receipt.hash);
      setSuccess(true);
      
      // Notify parent component
      if (onAuctionFinalized) {
        onAuctionFinalized();
      }
      
    } catch (err) {
      console.error('Finalization failed:', err);
      console.error('Error stack:', err.stack);
      
      // Handle specific error cases
      if (err.code === 'INSUFFICIENT_FUNDS') {
        setError('Insufficient funds for gas fees');
      } else if (err.code === 4001) {
        setError('Transaction rejected by wallet');
      } else if (err.message.includes('Auction not ended')) {
        setError('Auction has not ended yet. Please wait until the auction end time.');
      } else if (err.message.includes('Already finalized')) {
        setError('Auction has already been finalized');
      } else {
        setError(`Failed to finalize auction: ${err.message.substring(0, 100)}${err.message.length > 100 ? '...' : ''}`);
      }
    } finally {
      setIsFinalizing(false);
    }
  };

  // Check winner after finalization
  const checkWinner = async () => {
    try {
      // Get RPC URL from environment variables
      const rpcUrl = import.meta.env.VITE_ALCHEMY_RPC_URL || 
                    import.meta.env.VITE_INFURA_RPC_URL || 
                    import.meta.env.VITE_ANKR_RPC_URL || 
                    import.meta.env.VITE_SEPOLIA_RPC_URL ||
                    "https://rpc.sepolia.org";
      
      // Create provider for read operations
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Get contract instance with provider (read-only)
      const contract = new ethers.Contract(
        contractAddress,
        ZepoMintFHEData.abi,
        provider
      );
      
      // Get winner data
      const winnerEncrypted = await contract.winnerEncrypted();
      const winningBidEncrypted = await contract.winningBidEncrypted();
      const winningBidIndex = await contract.winningBidIndex();
      
      setWinnerData({
        winnerEncrypted,
        winningBidEncrypted,
        winningBidIndex: winningBidIndex.toString()
      });
      
    } catch (err) {
      console.error('Failed to check winner:', err);
    } finally {
      setIsCheckingWinner(false);
    }
  };

  // Check winner when auction is finalized
  useEffect(() => {
    if (auctionData && auctionData.finalized) {
      checkWinner();
    }
  }, [auctionData]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Auction Finalization</h3>
      
      {auctionData && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Auction Status</p>
              <p className={`text-lg font-bold ${auctionData.finalized ? 'text-green-600' : 'text-orange-600'}`}>
                {auctionData.finalized ? 'Finalized' : 'Active'}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Bid Count</p>
              <p className="text-lg font-bold text-gray-900">{bidCount}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">End Time</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(auctionData.endTime * 1000).toLocaleString()}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Time Remaining</p>
              <p className="text-lg font-bold text-gray-900">
                {hasAuctionEnded() ? 'Ended' : 'Active'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!auctionData?.finalized ? (
        <div>
          <button
            onClick={handleFinalize}
            disabled={!canFinalize() || isFinalizing || !isConnected}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-md transition-all ${
              isFinalizing 
                ? 'bg-yellow-400 cursor-not-allowed' 
                : canFinalize() && isConnected
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 hover:shadow-lg'
                  : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isFinalizing ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Finalizing Auction...
              </div>
            ) : canFinalize() && isConnected ? (
              'Finalize Auction'
            ) : (
              !isConnected ? 'Connect Wallet' : 'Cannot Finalize Yet'
            )}
          </button>
          
          {(!canFinalize() || !isConnected) && (
            <p className="mt-3 text-sm text-gray-600 text-center">
              {!isConnected 
                ? 'Please connect your wallet to finalize the auction.' 
                : hasAuctionEnded() 
                  ? 'Auction has ended. Click "Finalize Auction" to determine the winner.' 
                  : 'Auction is still active. Please wait until the end time to finalize.'}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Auction Finalized</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>The auction has been successfully finalized and the winner has been determined through secure FHE computation.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {winnerData && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-bold text-blue-800 mb-2">Winner Information</h4>
          <div className="text-sm text-blue-700">
            <p><strong>Winner Address (Encrypted):</strong> {winnerData.winnerEncrypted}</p>
            <p><strong>Winning Bid (Encrypted):</strong> {winnerData.winningBidEncrypted}</p>
            <p><strong>Winning Bid Index:</strong> {winnerData.winningBidIndex}</p>
          </div>
        </div>
      )}
      
      {transactionHash && (
        <div className="mt-4 rounded-lg bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Auction Finalized Successfully</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>The auction has been finalized and the winner determined.</p>
                <div className="mt-3">
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-green-900 underline hover:text-green-800"
                  >
                    View transaction on Etherscan
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Finalizing Auction</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionFinalizer;