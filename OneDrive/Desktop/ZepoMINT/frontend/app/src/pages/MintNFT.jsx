import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { mintNFT, getCurrentAuction } from '../utils/contract-interaction';
import WalletInfo from '../components/WalletInfo.jsx';
import NFTPreview from '../components/NFTPreview';

const MintNFT = () => {
  const [currentAuction, setCurrentAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [nftMinted, setNftMinted] = useState(false);
  const [isWinner, setIsWinner] = useState(false);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Fetch auction data and check if user is winner
  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!publicClient) {
          setError('Provider not available');
          return;
        }
        
        const auction = await getCurrentAuction(publicClient);
        
        if (auction && auction.finalized) {
          setCurrentAuction(auction);
          
          // In a real implementation, you would compare against the decrypted winner address
          // For now, we'll assume the user is the winner if they can access this page
          // In practice, you would check if address === decryptedWinnerAddress
          setIsWinner(true);
        } else {
          setError('Auction not finalized yet or no active auction');
        }
      } catch (err) {
        console.error('Error fetching auction data:', err);
        setError('Failed to load auction data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (isConnected && publicClient) {
      fetchAuctionData();
    }
  }, [isConnected, publicClient]);

  const handleMintNFT = async () => {
    if (!isConnected) {
      setMessage('Please connect your wallet first');
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
    
    if (!isWinner) {
      setMessage('You are not the winner of this auction');
      return;
    }
    
    setIsProcessing(true);
    setMessage('Minting your NFT...');
    setTransactionHash('');
    
    try {
      // Use winningBidIndex as tokenId for simplicity
      const tokenId = parseInt(currentAuction.winningBidIndex || 1);
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
              <h2 className="text-2xl font-bold text-gray-900 mt-4">Access Denied</h2>
              <p className="mt-2 text-red-700">{error}</p>
              <button
                onClick={() => window.location.href = '/'}
                className="mt-6 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                Back to Home
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
              Mint Your NFT
            </h1>
            <p className="text-xl text-gray-600">
              Congratulations! You've won the auction. Mint your exclusive NFT now.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - NFT Preview */}
            <div>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-1 bg-gradient-to-r from-yellow-400 to-orange-500">
                  <div className="bg-white rounded-xl p-6">
                    {currentAuction && currentAuction.metadataCID && (
                      <NFTPreview metadataCID={currentAuction.metadataCID} />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Winner Badge */}
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-green-800">Auction Winner!</h3>
                    <p className="text-green-700">
                      Congratulations, you've won this auction with the highest bid.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Mint Form */}
            <div>
              {!isConnected ? (
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-yellow-100">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                    <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mt-4">Connect Your Wallet</h3>
                  <p className="mt-2 text-gray-600">Please connect your wallet to mint your NFT</p>
                  <div className="mt-6">
                    <WalletInfo />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Mint Your NFT</h3>
                  
                  {nftMinted ? (
                    <div className="text-center py-8">
                      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mt-4">NFT Minted Successfully!</h4>
                      <p className="mt-2 text-gray-600">
                        Your NFT has been minted and sent to your wallet.
                      </p>
                      {transactionHash && (
                        <div className="mt-4">
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${transactionHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View transaction on Etherscan
                          </a>
                        </div>
                      )}
                      <button
                        onClick={() => window.location.href = '/'}
                        className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-3 px-6 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                      >
                        Back to Home
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                          <span className="text-gray-600">Auction ID</span>
                          <span className="font-mono text-sm">#{currentAuction?.winningBidIndex || '1'}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                          <span className="text-gray-600">Your Wallet</span>
                          <span className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status</span>
                          <span className="font-bold text-green-600">Winner</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleMintNFT}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                            Minting NFT...
                          </div>
                        ) : (
                          'Mint Your NFT Now'
                        )}
                      </button>
                      
                      {message && (
                        <div className={`mt-4 p-3 rounded-lg text-center ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {message}
                          {transactionHash && (
                            <div className="mt-2">
                              <a 
                                href={`https://sepolia.etherscan.io/tx/${transactionHash}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View on Etherscan
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Security Notice */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-gray-900">Secure Minting</h4>
                    <p className="mt-2 text-gray-700">
                      Your NFT is minted directly to your wallet. This process is secured by the Ethereum blockchain.
                    </p>
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

export default MintNFT;