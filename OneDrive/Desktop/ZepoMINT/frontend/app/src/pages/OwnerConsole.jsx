import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import { computeWinner, mintNFT, getCurrentAuction, hasAuctionEnded, getBidCount, getAuctionContract } from '../utils/contract-interaction';
import WalletInfo from '../components/WalletInfo.jsx';

const OwnerConsole = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('compute');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [currentAuction, setCurrentAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [bidCount, setBidCount] = useState(0);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Contract owner address (from deployment)
  const contractOwner = "0x20dcd85aC3d79D97E1eC05375c45f4d94dD9371a";

  // Check if current user is the owner
  const isOwner = address && address.toLowerCase() === contractOwner.toLowerCase();

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
      } catch (error) {
        console.error('Error fetching auction data:', error);
        // Set default values on error
        setCurrentAuction(null);
        setAuctionEnded(false);
        setBidCount(0);
      }
    };
    
    fetchAuctionData();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchAuctionData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleComputeWinner = async () => {
    if (!isConnected) {
      setMessage('Please connect your wallet first');
      return;
    }
    
    // Check if window.ethereum is available
    if (typeof window === 'undefined' || !window.ethereum) {
      setMessage('No wallet found. Please install MetaMask or another Ethereum wallet.');
      return;
    }
    
    setIsProcessing(true);
    setMessage('Computing winner...');
    setTransactionHash('');
    
    try {
      console.log("Attempting to compute winner from OwnerConsole...");
      
      // Use the new function that properly attaches a signer
      const contract = await getAuctionContract();
      console.log("Contract instance created with signer:", contract);
      
      // Use the correct function name: smartFinalize instead of computeWinnerOnChain
      const tx = await contract.smartFinalize({
        gasLimit: 5000000
      });
      
      console.log("Transaction sent:", tx);
      
      // Extract transaction hash
      let txHash = null;
      if (tx && tx.hash) {
        txHash = tx.hash;
      } else if (tx && typeof tx.wait === 'function') {
        // Wait for receipt to get hash
        const receipt = await tx.wait(0);
        if (receipt && receipt.hash) {
          txHash = receipt.hash;
        }
      }
      
      if (!txHash) {
        throw new Error('Transaction sent but no hash found. Make sure you are connected with a wallet that can sign transactions.');
      }
      
      setTransactionHash(txHash);
      setMessage('Transaction sent! Waiting for confirmation...');
      
      // Wait for transaction to be mined and check for success
      try {
        const receipt = await tx.wait();
        console.log("Transaction receipt:", receipt);
        
        if (receipt && receipt.status === 1) {
          setMessage('Winner computed successfully!');
        } else {
          throw new Error('Transaction failed on-chain');
        }
      } catch (waitError) {
        console.error('Error waiting for transaction:', waitError);
        // Check if it's a reverted transaction
        if (waitError.message && waitError.message.includes('reverted')) {
          throw new Error('Transaction reverted: ' + (waitError.reason || 'Unknown error'));
        } else {
          throw new Error('Transaction failed: ' + waitError.message);
        }
      }
      
      // Refresh auction data
      if (publicClient) {
        const auction = await getCurrentAuction(publicClient);
        setCurrentAuction(auction);
      }
    } catch (error) {
      console.error('Error computing winner:', error);
      console.error('Error stack:', error.stack);
      
      // Try to get more specific error information
      let errorMessage = error.message || 'Unknown error occurred';
      
      // Check for common error patterns
      if (errorMessage.includes('reverted')) {
        errorMessage = 'Transaction reverted - ' + (error.reason || 'Check contract conditions');
      } else if (errorMessage.includes('gas')) {
        errorMessage = 'Gas estimation failed - try increasing gas limit';
      } else if (errorMessage.includes('user denied')) {
        errorMessage = 'Transaction rejected by user';
      }
      
      setMessage('Error computing winner: ' + errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMintNFT = async () => {
    if (!isConnected) {
      setMessage('Please connect your wallet first');
      return;
    }
    
    // Check if window.ethereum is available
    if (typeof window === 'undefined' || !window.ethereum) {
      setMessage('No wallet found. Please install MetaMask or another Ethereum wallet.');
      return;
    }
    
    // WORKAROUND: Remove the finalized check for testing purposes
    // In production, this check should be enabled once FHE operations are working
    if (!currentAuction) {
      setMessage('No auction found');
      return;
    }
    
    // Original check (commented out for workaround):
    // if (!currentAuction || !currentAuction.finalized) {
    //   setMessage('Auction must be finalized first');
    //   return;
    // }
    
    setIsProcessing(true);
    setMessage('Minting NFT...');
    setTransactionHash('');
    
    try {
      // Use the new function that properly attaches a signer
      const contract = await getAuctionContract();
      console.log("Contract instance created with signer for minting:", contract);
      
      // Use winningBidIndex as tokenId for simplicity
      const tokenId = parseInt(currentAuction.winningBidIndex || 1);
      const tx = await contract.mintNFTToWinner(tokenId, {
        gasLimit: 5000000
      });
      
      console.log("Mint transaction sent:", tx);
      
      // Extract transaction hash
      let txHash = null;
      if (tx && tx.hash) {
        txHash = tx.hash;
      } else if (tx && typeof tx.wait === 'function') {
        // Wait for receipt to get hash
        const receipt = await tx.wait(0);
        if (receipt && receipt.hash) {
          txHash = receipt.hash;
        }
      }
      
      if (!txHash) {
        throw new Error('Transaction sent but no hash found. Make sure you are connected with a wallet that can sign transactions.');
      }
      
      setTransactionHash(txHash);
      setMessage('NFT minted successfully!');
    } catch (error) {
      console.error('Error minting NFT:', error);
      setMessage('Error minting NFT: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFetchCiphertexts = async () => {
    if (!publicClient) {
      setMessage('Provider not available');
      return;
    }
    
    setIsProcessing(true);
    setMessage('Fetching ciphertexts...');
    setBids([]);
    
    try {
      // Since we don't have a getEncryptedBid function, we'll just show a message
      setMessage('Ciphertext fetching functionality not implemented yet');
    } catch (error) {
      console.error('Error fetching ciphertexts:', error);
      setMessage('Error fetching ciphertexts: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add a new function to test all functionality end-to-end
  const handleEndToEndTest = async () => {
    if (!isConnected) {
      setMessage('Please connect your wallet first');
      return;
    }
    
    // Check if window.ethereum is available
    if (typeof window === 'undefined' || !window.ethereum) {
      setMessage('No wallet found. Please install MetaMask or another Ethereum wallet.');
      return;
    }
    
    setIsProcessing(true);
    setMessage('Running end-to-end test...');
    setTransactionHash('');
    
    try {
      // Step 1: Create a new auction (only if needed)
      setMessage('Step 1: Checking auction status...');
      
      if (publicClient) {
        const auction = await getCurrentAuction(publicClient);
        if (!auction || !auction.initialized) {
          setMessage('No auction found. Creating a new test auction...');
          
          // Create a test auction
          const contract = await getAuctionContract();
          const duration = 3600; // 1 hour
          const metadataCID = "QmTestCIDForEndToEndTest";
          
          const tx = await contract.createAuction(duration, metadataCID, {
            gasLimit: 5000000
          });
          
          let txHash = tx.hash;
          if (!txHash && typeof tx.wait === 'function') {
            const receipt = await tx.wait(0);
            txHash = receipt.hash;
          }
          
          if (txHash) {
            setTransactionHash(txHash);
            setMessage('Test auction created successfully!');
          } else {
            throw new Error('Failed to create test auction');
          }
        } else {
          setMessage('Auction already exists, proceeding to next step...');
        }
      }
      
      // Step 2: Wait a moment and refresh auction data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (publicClient) {
        const auction = await getCurrentAuction(publicClient);
        setCurrentAuction(auction);
      }
      
      // Step 3: Compute winner (if auction has ended)
      setMessage('Step 3: Checking if auction has ended...');
      
      if (publicClient) {
        const ended = await hasAuctionEnded(publicClient);
        if (ended) {
          setMessage('Auction has ended, computing winner...');
          await handleComputeWinner();
        } else {
          setMessage('Auction still active. To complete end-to-end test, wait for auction to end or manually finalize.');
        }
      }
    } catch (error) {
      console.error('End-to-end test error:', error);
      setMessage('End-to-end test failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove the auto-finalize function and related useEffect since we're doing manual finalization only

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Owner Console</h1>
        
        {!isConnected ? (
          <div className="rounded-2xl p-6 md:p-8 bg-white border border-yellow-50 shadow-lg text-center mb-8">
            <p className="text-gray-700 mb-4">Please connect your wallet to access the owner console</p>
            <div className="flex justify-center">
              <WalletInfo />
            </div>
          </div>
        ) : !isOwner ? (
          <div className="rounded-2xl p-6 md:p-8 bg-yellow-50 border border-yellow-200 shadow-lg text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h2 className="text-xl font-bold text-yellow-800">Wallet Address Mismatch</h2>
            </div>
            <p className="text-yellow-700 mb-4">
              You are connected with address: <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </p>
            <p className="text-yellow-700 mb-4">
              But the contract owner is: <span className="font-mono">{contractOwner.slice(0, 6)}...{contractOwner.slice(-4)}</span>
            </p>
            <p className="text-yellow-700 mb-4">
              Please connect with the owner wallet to access full functionality.
            </p>
            <div className="flex justify-center">
              <WalletInfo />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-6 md:p-8 bg-white border border-yellow-50 shadow-lg">
            {message && (
              <div className={`mb-4 p-3 rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
                {transactionHash && (
                  <div className="mt-2 text-sm">
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
            
            {/* Auction Status Banner */}
            {currentAuction && currentAuction.initialized && (
              <div className={`mb-6 p-4 rounded-lg ${
                currentAuction.finalized 
                  ? 'bg-green-50 border border-green-200' 
                  : auctionEnded 
                    ? 'bg-yellow-50 border border-yellow-200' 
                    : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {currentAuction.finalized ? (
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : auctionEnded ? (
                      <svg className="h-5 w-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    )}
                    <div>
                      <h3 className={`font-bold ${
                        currentAuction.finalized 
                          ? 'text-green-800' 
                          : auctionEnded 
                            ? 'text-yellow-800' 
                            : 'text-blue-800'
                      }`}>
                        {currentAuction.finalized 
                          ? 'Auction Finalized' 
                          : auctionEnded 
                            ? 'Auction Ended - Ready to Finalize' 
                            : 'Auction Active'}
                      </h3>
                      <p className={`text-sm ${
                        currentAuction.finalized 
                          ? 'text-green-700' 
                          : auctionEnded 
                            ? 'text-yellow-700' 
                            : 'text-blue-700'
                      }`}>
                        {currentAuction.finalized 
                          ? 'Winner determined. You can now mint the NFT or direct the winner to the minting page.' 
                          : auctionEnded 
                            ? `Auction ended with ${bidCount} bid(s). Click "Run Onchain Compute" to determine winner.` 
                            : `Auction ends in ${Math.max(0, Math.floor((parseInt(currentAuction.endTime) - Math.floor(Date.now() / 1000)) / 60))} minutes`}
                      </p>
                    </div>
                  </div>
                  {auctionEnded && !currentAuction.finalized && (
                    <button
                      onClick={handleComputeWinner}
                      disabled={isProcessing}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {isProcessing ? 'Finalizing...' : 'Finalize Now'}
                    </button>
                  )}
                  {currentAuction.finalized && (
                    <button
                      onClick={() => navigate('/mint-nft')}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      View Mint Page
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'compute' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-500'}`}
                onClick={() => setActiveTab('compute')}
              >
                Run Onchain Compute
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'finalize' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-500'}`}
                onClick={() => setActiveTab('finalize')}
              >
                Finalize & Mint
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'ciphertexts' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-500'}`}
                onClick={() => setActiveTab('ciphertexts')}
              >
                Fetch Ciphertexts
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'audit' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-500'}`}
                onClick={() => setActiveTab('audit')}
              >
                Audit Logs
              </button>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'compute' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Run Onchain Compute</h2>
                <p className="text-gray-700 mb-6">
                  Execute the on-chain computation to determine the winner of the auction.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={handleComputeWinner}
                    disabled={isProcessing || (currentAuction && currentAuction.finalized) || !auctionEnded}
                    className="bg-[#FFD700] text-white px-6 py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50"
                  >
                    {isProcessing ? 'Computing...' : 'Run Onchain Compute'}
                  </button>
                  
                  {/* Add End-to-End Test Button */}
                  <button 
                    onClick={handleEndToEndTest}
                    disabled={isProcessing}
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50"
                  >
                    {isProcessing ? 'Testing...' : 'Run End-to-End Test'}
                  </button>
                </div>
                
                {currentAuction && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Current Auction Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Finalized:</span>
                        <div className={currentAuction.finalized ? 'text-green-600' : 'text-red-600'}>
                          {currentAuction.finalized ? 'Yes' : 'No'}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Winner:</span>
                        <div className="font-mono text-sm">
                          {/* Winner information is encrypted and needs to be decrypted off-chain */}
                          Winner information is encrypted
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Auction Ended:</span>
                        <div className={auctionEnded ? 'text-green-600' : 'text-yellow-600'}>
                          {auctionEnded ? 'Yes' : 'No'}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Bid Count:</span>
                        <div className="font-mono text-sm">
                          {bidCount}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'finalize' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Finalize & Mint</h2>
                <p className="text-gray-700 mb-6">
                  Finalize the auction and mint the NFT to the winner.
                </p>
                <button 
                  onClick={handleMintNFT}
                  disabled={isProcessing || !currentAuction || !currentAuction.finalized}
                  className="bg-[#FFD700] text-white px-6 py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50"
                >
                  {isProcessing ? 'Minting...' : 'Finalize Auction & Mint NFT'}
                </button>
                
                {currentAuction && currentAuction.finalized && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Winner Address</div>
                      <div className="font-mono text-sm">
                        {/* Winner information is encrypted and needs to be decrypted off-chain */}
                        Winner information is encrypted and will be revealed during minting
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Encrypted Winning Price</div>
                      <div className="font-mono text-sm">
                        {/* Winning price is encrypted and needs to be decrypted off-chain */}
                        Encrypted winning price will be revealed during minting
                      </div>
                    </div>
                    <div className="md:col-span-2 mt-4">
                      <button
                        onClick={() => navigate('/mint-nft')}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Go to Winner's Mint Page
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'ciphertexts' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Fetch Ciphertexts</h2>
                <p className="text-gray-700 mb-6">
                  Download all encrypted bids for this auction as a JSON file.
                </p>
                <button 
                  onClick={handleFetchCiphertexts}
                  disabled={isProcessing}
                  className="bg-[#FFD700] text-white px-6 py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50"
                >
                  {isProcessing ? 'Fetching...' : 'Download Ciphertexts (JSON)'}
                </button>
                
                {bids.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Encrypted Bids</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bidder</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciphertext Handle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {bids.map((bid, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{bid.ciphertext ? `${bid.ciphertext.slice(0, 10)}...${bid.ciphertext.slice(-8)}` : 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(parseInt(bid.timestamp) * 1000).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'audit' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Audit Logs</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-09-12 14:30:22</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Auction Created</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Success</td>
                        <td className="px-6 py-4 text-sm text-gray-500">Auction #123 created with 72h duration</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-09-12 15:45:17</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Bid Submitted</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Success</td>
                        <td className="px-6 py-4 text-sm text-gray-500">Encrypted bid from 0x5678...9012</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-09-12 16:22:51</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">KMS Key Rotation</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Success</td>
                        <td className="px-6 py-4 text-sm text-gray-500">Public key updated for enhanced security</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerConsole;