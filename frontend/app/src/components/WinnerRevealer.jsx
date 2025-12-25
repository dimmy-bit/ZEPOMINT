import React, { useState } from 'react';
import { ethers } from 'ethers';
import { usePublicClient, useWalletClient, useAccount } from 'wagmi';
import { getFHEInstance } from '../utils/fhe-wrapper';
import ZepoMintFHEData from '../abi/ZepoMINTFHEAuctionComplete.json' with { type: 'json' };

const WinnerRevealer = ({ contractAddress, auctionData, onWinnerRevealed }) => {
  const [isRevealing, setIsRevealing] = useState(false);
  const [error, setError] = useState(null);
  const [winnerAddress, setWinnerAddress] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintTransactionHash, setMintTransactionHash] = useState(null);
  
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const handleRevealWinner = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!auctionData || !auctionData.finalized) {
      setError('Auction must be finalized first');
      return;
    }
    
    setIsRevealing(true);
    setError(null);
    setWinnerAddress(null);
    
    try {
      // Get FHE instance
      const fheInstance = await getFHEInstance();
      
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
        contractAddress,
        ZepoMintFHEData.abi,
        provider
      );
      
      // Get the encrypted winner address
      const winnerEncrypted = await contract.winnerEncrypted();
      console.log('Encrypted winner:', winnerEncrypted);
      
      // Decrypt the winner address
      console.log('Decrypting winner address...');
      const decryptedWinner = await fheInstance.decrypt(contractAddress, winnerEncrypted);
      console.log('Decrypted winner:', decryptedWinner);
      
      setWinnerAddress(decryptedWinner);
      
      // Notify parent component
      if (onWinnerRevealed) {
        onWinnerRevealed(decryptedWinner);
      }
      
    } catch (err) {
      console.error('Failed to reveal winner:', err);
      console.error('Error stack:', err.stack);
      
      if (err.message.includes('FHE initialization failed')) {
        setError('Failed to initialize FHE decryption. Please check your network connection and try again.');
      } else if (err.message.includes('decrypt')) {
        setError('Failed to decrypt winner address. This may be because you are not the winner or the data is not ready for decryption.');
      } else {
        setError(`Failed to reveal winner: ${err.message.substring(0, 100)}${err.message.length > 100 ? '...' : ''}`);
      }
    } finally {
      setIsRevealing(false);
    }
  };

  const handleMintNFT = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!walletClient) {
      setError('Wallet client not available. Please check your wallet connection.');
      return;
    }
    
    if (!winnerAddress) {
      setError('Winner address not revealed yet');
      return;
    }
    
    // Check if the connected wallet is the winner
    if (address.toLowerCase() !== winnerAddress.toLowerCase()) {
      setError('Only the winner can mint the NFT');
      return;
    }
    
    setIsMinting(true);
    setError(null);
    setMintSuccess(false);
    setMintTransactionHash(null);
    
    try {
      // Get contract instance with signer
      const contract = new ethers.Contract(
        contractAddress,
        ZepoMintFHEData.abi,
        walletClient
      );
      
      // Estimate gas
      let gasLimit;
      try {
        gasLimit = await contract.mintNFTToWinner.estimateGas();
        // Add 20% buffer to gas estimate
        gasLimit = (gasLimit * 120n) / 100n;
      } catch (gasError) {
        console.warn('Could not estimate gas, using default limit:', gasError);
        gasLimit = 500000n;
      }
      
      // Mint the NFT
      const tx = await contract.mintNFTToWinner({
        gasLimit: gasLimit
      });
      
      console.log('Mint transaction sent:', tx);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Mint transaction confirmed:', receipt);
      
      setMintTransactionHash(receipt.hash);
      setMintSuccess(true);
      
    } catch (err) {
      console.error('Failed to mint NFT:', err);
      console.error('Error stack:', err.stack);
      
      if (err.code === 'INSUFFICIENT_FUNDS') {
        setError('Insufficient funds for gas fees');
      } else if (err.code === 4001) {
        setError('Transaction rejected by wallet');
      } else if (err.message.includes('Only winner can mint NFT')) {
        setError('Only the auction winner can mint the NFT');
      } else if (err.message.includes('NFT already minted')) {
        setError('NFT has already been minted');
      } else if (err.message.includes('Auction not finalized')) {
        setError('Auction must be finalized before minting');
      } else {
        setError(`Failed to mint NFT: ${err.message.substring(0, 100)}${err.message.length > 100 ? '...' : ''}`);
      }
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Winner Reveal & NFT Minting</h3>
      
      {auctionData && !auctionData.finalized && (
        <div className="mb-4 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Auction Not Finalized</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>The auction must be finalized before the winner can be revealed and the NFT minted.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {auctionData && auctionData.finalized && (
        <div>
          {!winnerAddress ? (
            <div>
              <button
                onClick={handleRevealWinner}
                disabled={isRevealing || !isConnected}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-md transition-all ${
                  isRevealing 
                    ? 'bg-yellow-400 cursor-not-allowed' 
                    : !isConnected
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 hover:shadow-lg'
                }`}
              >
                {isRevealing ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Revealing Winner...
                  </div>
                ) : (
                  !isConnected ? 'Connect Wallet' : 'Reveal Winner'
                )}
              </button>
              
              <p className="mt-3 text-sm text-gray-600 text-center">
                After the auction is finalized, the winner's address can be decrypted securely.
              </p>
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
                  <h3 className="text-sm font-medium text-green-800">Winner Revealed</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p><strong>Winner Address:</strong> {winnerAddress}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={handleMintNFT}
                  disabled={isMinting || mintSuccess || !isConnected}
                  className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-md transition-all ${
                    isMinting 
                      ? 'bg-yellow-400 cursor-not-allowed' 
                      : mintSuccess
                        ? 'bg-green-500 cursor-not-allowed'
                        : !isConnected
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 hover:shadow-lg'
                  }`}
                >
                  {isMinting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Minting NFT...
                    </div>
                  ) : mintSuccess ? (
                    <div className="flex items-center justify-center">
                      <svg className="h-5 w-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      NFT Minted Successfully!
                    </div>
                  ) : (
                    !isConnected ? 'Connect Wallet' : 'Mint NFT to Winner'
                  )}
                </button>
                
                {mintTransactionHash && (
                  <div className="mt-3 rounded-lg bg-green-50 p-3 border border-green-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">NFT Minted Successfully</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <div className="mt-1">
                            <a 
                              href={`https://sepolia.etherscan.io/tx/${mintTransactionHash}`}
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
              </div>
            </div>
          )}
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
              <h3 className="text-sm font-medium text-red-800">Error</h3>
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

export default WinnerRevealer;