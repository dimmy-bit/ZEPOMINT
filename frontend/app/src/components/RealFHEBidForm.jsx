import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { usePublicClient, useWalletClient, useAccount } from 'wagmi';
import { getFHEInstance } from '../utils/fhe-wrapper';
import ZepoMintFHEData from '../abi/ZepoMINTFHEAuctionComplete.json' with { type: 'json' };

const RealFHEBidForm = ({ contractAddress, onBidPlaced }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [error, setError] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fheInstance, setFheInstance] = useState(null);
  
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Initialize FHE instance
  useEffect(() => {
    const initFHE = async () => {
      try {
        console.log('Initializing FHE instance...');
        const instance = await getFHEInstance();
        setFheInstance(instance);
        console.log('FHE instance initialized successfully');
      } catch (err) {
        console.error('Failed to initialize FHE:', err);
        setError(`FHE initialization failed: ${err.message}`);
      }
    };

    if (isConnected) {
      initFHE();
    }
  }, [isConnected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bidAmount || isNaN(bidAmount) || bidAmount <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!fheInstance) {
      setError('FHE instance not initialized. Please wait or refresh the page.');
      return;
    }
    
    if (!walletClient) {
      setError('Wallet client not available. Please check your wallet connection.');
      return;
    }
    
    setIsBidding(true);
    setError(null);
    setTransactionHash(null);
    setSuccess(false);
    
    try {
      // Get user address
      const userAddress = address;
      
      if (!userAddress) {
        throw new Error('Unable to get user address from signer or provider. Please make sure your wallet is connected and unlocked.');
      }
      
      console.log('User address:', userAddress);
      
      // Encrypt the bid using real FHE
      console.log(`Encrypting bid value: ${bidAmount}`);
      
      // Create encrypted input for the bid amount
      const amountInput = fheInstance.createEncryptedInput(contractAddress, userAddress);
      amountInput.add128(BigInt(Math.floor(bidAmount * 1e18))); // Convert to smallest unit
      const amountData = await amountInput.encrypt();
      
      // Create encrypted input for the bidder address
      const bidderInput = fheInstance.createEncryptedInput(contractAddress, userAddress);
      bidderInput.addAddress(userAddress);
      const bidderData = await bidderInput.encrypt();
      
      console.log('Encryption completed successfully');
      
      const encryptedAmount = amountData.handles[0];
      const bidder = bidderData.handles[0];
      const amountProof = amountData.inputProof;
      const bidderProof = bidderData.inputProof;
      
      // Get contract instance
      const contract = new ethers.Contract(
        contractAddress,
        ZepoMintFHEData.abi,
        walletClient
      );
      
      // Estimate gas
      let gasLimit;
      try {
        gasLimit = await contract.submitBid.estimateGas(
          encryptedAmount,
          bidder,
          amountProof,
          bidderProof
        );
        // Add 20% buffer to gas estimate
        gasLimit = (gasLimit * 120n) / 100n;
      } catch (gasError) {
        console.warn('Could not estimate gas, using default limit:', gasError);
        gasLimit = 500000n;
      }
      
      // Submit the encrypted bid
      const tx = await contract.submitBid(
        encryptedAmount,
        bidder,
        amountProof,
        bidderProof,
        {
          gasLimit: gasLimit
        }
      );
      
      console.log('Transaction sent:', tx);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      setTransactionHash(receipt.hash);
      setSuccess(true);
      
      // Notify parent component
      if (onBidPlaced) {
        onBidPlaced();
      }
      
      // Clear form
      setBidAmount('');
      
    } catch (err) {
      console.error('Bid submission failed:', err);
      console.error('Error stack:', err.stack);
      
      // Handle specific error cases
      if (err.code === 'INSUFFICIENT_FUNDS') {
        setError('Insufficient funds for this bid plus gas fees');
      } else if (err.code === 4001) {
        setError('Transaction rejected by wallet');
      } else if (err.message.includes('FHE initialization failed')) {
        setError('Failed to initialize FHE encryption. Please check your network connection and try again.');
      } else if (err.message.includes('Bid encryption failed')) {
        setError('Failed to encrypt bid. Please try again.');
      } else {
        setError(`Failed to submit bid: ${err.message.substring(0, 100)}${err.message.length > 100 ? '...' : ''}`);
      }
    } finally {
      setIsBidding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="bidAmount" className="block text-sm font-bold text-gray-900 mb-2">
          Your Bid Amount
        </label>
        <div className="relative rounded-xl shadow-sm">
          <input
            type="number"
            id="bidAmount"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            step="0.001"
            min="0.001"
            required
            disabled={isBidding || !fheInstance}
            className="focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 block w-full pl-4 pr-16 py-4 text-lg border-gray-300 rounded-xl border focus:outline-none transition"
            placeholder="0.00"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-gray-700 font-bold">ETH</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Enter your bid amount. Your bid will be encrypted using Zama's Fully Homomorphic Encryption and remain completely private.
        </p>
      </div>
      
      {!fheInstance && isConnected && (
        <div className="rounded-xl bg-blue-50 p-4 border border-blue-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Initializing FHE</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Setting up secure encryption... This may take a few moments.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <button
        type="submit"
        disabled={isBidding || success || !fheInstance || !isConnected}
        className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all ${
          isBidding 
            ? 'bg-yellow-400 cursor-not-allowed' 
            : success 
              ? 'bg-green-500 cursor-not-allowed'
              : !fheInstance || !isConnected
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 hover:shadow-xl transform hover:-translate-y-0.5'
        }`}
      >
        {isBidding ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Encrypted Bid...
          </div>
        ) : success ? (
          <div className="flex items-center justify-center">
            <svg className="h-5 w-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Bid Placed Successfully!
          </div>
        ) : !fheInstance || !isConnected ? (
          <div className="flex items-center justify-center">
            <svg className="h-5 w-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isConnected ? 'Initializing FHE...' : 'Connect Wallet'}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg className="h-5 w-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Place Encrypted Bid
          </div>
        )}
      </button>
      
      {error && (
        <div className="rounded-xl bg-red-50 p-5 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-bold text-red-800">Error Placing Bid</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {transactionHash && (
        <div className="rounded-xl bg-green-50 p-5 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-bold text-green-800">Bid Placed Successfully</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your encrypted bid has been submitted to the blockchain.</p>
                <div className="mt-3">
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-green-900 underline hover:text-green-800"
                  >
                    View transaction on Etherscan
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* FHE Security Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="ml-4">
            <h4 className="text-sm font-bold text-gray-900">Privacy-Preserving Technology</h4>
            <p className="mt-1 text-sm text-gray-700">
              Your bid is encrypted using Zama's Fully Homomorphic Encryption technology. 
              No one—not even the auction creator—can see your bid amount until the auction concludes and the winner is determined through secure computation.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};

export default RealFHEBidForm;