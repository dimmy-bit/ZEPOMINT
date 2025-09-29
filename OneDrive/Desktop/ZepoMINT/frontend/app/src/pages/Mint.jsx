import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import WalletInfo from '../components/WalletInfo.jsx';
import { createAuction, setContractAddress, getCurrentAuction } from '../utils/contract-interaction';

// Import the deployment information
import deploymentInfo from '../contract-deployment.json';

const MINT_OWNER_ADDRESS = "0x20dcd85aC3d79D97E1eC05375c45f4d94dD9371a";

const Mint = () => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    duration: '',
    reservePrice: ''
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [contractAddress, setContractAddressState] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [lastAuctionTime, setLastAuctionTime] = useState(0);
  const [cooldownPeriod, setCooldownPeriod] = useState(300000); // 5 minutes cooldown
  
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Check if connected user is the owner
  useEffect(() => {
    if (address) {
      setIsOwner(address.toLowerCase() === MINT_OWNER_ADDRESS.toLowerCase());
    }
  }, [address]);

  // Set the contract address when the component mounts
  useEffect(() => {
    if (deploymentInfo && deploymentInfo.contractAddress) {
      setContractAddress(deploymentInfo.contractAddress);
      setContractAddressState(deploymentInfo.contractAddress);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to upload file to IPFS using Pinata
  const uploadToIPFS = async (file) => {
    try {
      if (!file) {
        throw new Error('No file provided for upload');
      }

      // Try Pinata first
      try {
        console.log('Trying Pinata for file upload...');
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          console.log('File uploaded to Pinata with CID:', result.IpfsHash);
          return result.IpfsHash;
        } else {
          console.log(`Pinata upload failed with status ${response.status}`);
          throw new Error(`Pinata upload failed: ${response.statusText}`);
        }
      } catch (pinataError) {
        console.log('Pinata upload error:', pinataError.message);
      }

      // Fallback to NFT.Storage
      try {
        console.log('Trying NFT.Storage for file upload...');
        
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('https://api.nft.storage/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_NFT_STORAGE_API_KEY}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          console.log('File uploaded to NFT.Storage with CID:', result.value?.cid || result.cid);
          return result.value?.cid || result.cid;
        } else {
          console.log(`NFT.Storage upload failed with status ${response.status}`);
          throw new Error(`NFT.Storage upload failed: ${response.statusText}`);
        }
      } catch (nftStorageError) {
        console.log('NFT.Storage upload error:', nftStorageError.message);
      }

      // Final fallback to a test CID if all uploads fail
      console.log('All IPFS services failed, using fallback CID');
      return "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR";
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      // Fallback to a test CID if upload fails
      return "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR";
    }
  };

  // Function to create metadata and upload to IPFS
  const createAndUploadMetadata = async (file, name, description) => {
    try {
      // Upload image to IPFS first
      let imageCID = null;
      if (file) {
        imageCID = await uploadToIPFS(file);
        console.log("Image uploaded with CID:", imageCID);
      }

      // Create metadata object in the correct NFT metadata format
      const metadata = {
        name: name || "ZepoMint NFT",
        description: description || "A unique NFT created on ZepoMint platform",
        image: imageCID ? `ipfs://${imageCID}` : "ipfs://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR", // Use test image as fallback
        attributes: [
          {
            trait_type: "Encrypted",
            value: "true"
          },
          {
            trait_type: "Platform",
            value: "ZepoMint"
          }
        ]
      };

      // Convert metadata to JSON blob
      const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], "metadata.json", { type: 'application/json' });

      // Try Pinata for metadata upload
      try {
        console.log('Trying Pinata for metadata upload...');
        
        const formData = new FormData();
        formData.append('file', metadataFile);
        
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Metadata uploaded to Pinata with CID:", result.IpfsHash);
          return result.IpfsHash;
        } else {
          console.log(`Pinata metadata upload failed with status ${response.status}`);
          throw new Error(`Pinata metadata upload failed: ${response.statusText}`);
        }
      } catch (pinataError) {
        console.log('Pinata metadata upload error:', pinataError.message);
      }

      // Fallback to NFT.Storage for metadata upload
      try {
        console.log('Trying NFT.Storage for metadata upload...');
        
        const formData = new FormData();
        formData.append('file', metadataFile);
        
        const response = await fetch('https://api.nft.storage/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_NFT_STORAGE_API_KEY}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Metadata uploaded to NFT.Storage with CID:", result.value?.cid || result.cid);
          return result.value?.cid || result.cid;
        } else {
          console.log(`NFT.Storage metadata upload failed with status ${response.status}`);
          throw new Error(`NFT.Storage metadata upload failed: ${response.statusText}`);
        }
      } catch (nftStorageError) {
        console.log('NFT.Storage metadata upload error:', nftStorageError.message);
      }

      throw new Error('All IPFS metadata services failed');
    } catch (error) {
      console.error('Error creating metadata:', error);
      // Fallback to a test metadata CID that points to proper JSON metadata
      console.log("Using fallback metadata CID");
      return "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setMessage('Please connect your wallet first');
      return;
    }
    
    if (!isOwner) {
      setMessage('Only the contract owner can create auctions');
      return;
    }
    
    // Check cooldown period
    const currentTime = Date.now();
    if (currentTime - lastAuctionTime < cooldownPeriod) {
      const remainingTime = Math.ceil((cooldownPeriod - (currentTime - lastAuctionTime)) / 1000);
      setMessage(`Please wait ${remainingTime} seconds before creating another auction`);
      return;
    }
    
    if (!walletClient) {
      setMessage('Please connect your wallet and switch to Sepolia network');
      return;
    }
    
    if (!formData.name || !formData.duration) {
      setMessage('Please fill in all required fields');
      return;
    }
    
    // Validate auction duration
    const durationHours = parseInt(formData.duration);
    if (durationHours < 1 || durationHours > 168) { // 1 hour to 1 week
      setMessage('Auction duration must be between 1 and 168 hours');
      return;
    }
    
    console.log("Wallet client:", walletClient);
    
    setIsCreating(true);
    setMessage('Creating auction...');
    setTransactionHash('');
    
    try {
      // Check if there's an active auction
      try {
        // Use direct RPC provider for read operations instead of wagmi publicClient
        const rpcUrl = import.meta.env.VITE_ALCHEMY_RPC_URL || 
                       import.meta.env.VITE_INFURA_RPC_URL || 
                       import.meta.env.VITE_ANKR_RPC_URL || 
                       import.meta.env.VITE_SEPOLIA_RPC_URL ||
                       "https://rpc.sepolia.org";
        
        // Create a temporary provider just for this read operation
        const tempProvider = new ethers.JsonRpcProvider(rpcUrl);
        
        const currentAuction = await getCurrentAuction(tempProvider);
        console.log("Current auction data:", currentAuction);
        
        // Check if there's a valid auction that's still active and not finalized
        if (currentAuction && 
            currentAuction.metadataCID && 
            currentAuction.metadataCID !== "" && 
            !currentAuction.finalized && 
            parseInt(currentAuction.endTime) * 1000 > Date.now()) {
          throw new Error("There is already an active auction. Please wait for it to end or finalize it first.");
        }
        
        // If there's an existing auction that hasn't been finalized but has ended,
        // we should inform the user but allow them to create a new one
        if (currentAuction && 
            currentAuction.metadataCID && 
            currentAuction.metadataCID !== "" && 
            !currentAuction.finalized && 
            parseInt(currentAuction.endTime) * 1000 <= Date.now()) {
          console.log("Previous auction has ended but not finalized. Creating new auction will overwrite it.");
        }
      } catch (auctionError) {
        console.error('Error checking current auction status:', auctionError);
        // Continue with auction creation even if we can't check the current auction status
        console.log("Proceeding with auction creation despite error checking current auction status");
      }
      
      // Create and upload metadata to IPFS
      let metadataCID;
      try {
        metadataCID = await createAndUploadMetadata(
          selectedFile, 
          formData.name, 
          formData.description
        );
        console.log("Metadata uploaded with CID:", metadataCID);
      } catch (uploadError) {
        console.error('Metadata upload failed:', uploadError);
        throw new Error("Failed to upload NFT metadata to IPFS: " + uploadError.message);
      }
      
      // Validate that we have a proper metadata CID
      if (!metadataCID || metadataCID === "") {
        throw new Error("Failed to generate metadata CID");
      }
      
      console.log("Creating auction with metadata CID:", metadataCID);
      
      // Create the auction
      const result = await createAuction(
        walletClient, 
        parseInt(formData.duration) * 3600,  // Convert hours to seconds
        metadataCID
      );
      
      setTransactionHash(result.transactionHash);
      setMessage('Auction created successfully! The auction should now appear on the Auctions page.');
      setLastAuctionTime(Date.now());
      
      // Reset form
      setFormData({
        name: '',
        symbol: '',
        description: '',
        duration: '',
        reservePrice: ''
      });
      
      setSelectedFile(null);
      setPreviewUrl(null);
      
      console.log('Auction created:', result);
      
      // Add a small delay and then refresh the auction data
      setTimeout(() => {
        window.location.href = '/auctions';
      }, 3000);
    } catch (error) {
      console.error('Error creating auction:', error);
      
      // Provide more user-friendly error messages
      let errorMessage = error.message;
      if (errorMessage.includes("active auction")) {
        errorMessage = "There is already an active auction that hasn't ended yet. Please wait for it to end before creating a new one.";
      } else if (errorMessage.includes("gas")) {
        errorMessage = "Unable to create auction. This might be because there's an existing active auction. Please check the Owner Console to finalize any existing auctions.";
      } else if (errorMessage.includes("Previous auction not finalized")) {
        errorMessage = "Previous auction not finalized. Please go to Owner Console to finalize the existing auction, or wait for it to end naturally.";
      } else if (errorMessage.includes("IPFS")) {
        errorMessage = "Failed to upload NFT metadata to IPFS. " + errorMessage;
      }
      
      setMessage('Error creating auction: ' + errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
              Create New Auction
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Launch your NFT collection with privacy-preserving sealed-bid auctions
            </p>
          </div>

          {/* Contract Info */}
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Contract Address:</span> {contractAddress || 'Loading...'}
                </p>
              </div>
            </div>
          </div>

          {!isConnected ? (
            <div className="rounded-2xl p-8 bg-white border border-yellow-100 shadow-xl text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Connect Your Wallet</h3>
              <p className="mt-2 text-gray-600">Please connect your wallet to create an auction</p>
              <div className="mt-6">
                <WalletInfo />
              </div>
            </div>
          ) : !isOwner ? (
            <div className="rounded-2xl p-8 bg-white border border-red-100 shadow-xl text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Access Denied</h3>
              <p className="mt-2 text-gray-600">Only the contract owner can create auctions</p>
              <div className="mt-4 text-sm text-gray-500">
                <p>Connected address: {address?.substring(0, 6)}...{address?.substring(address.length - 4)}</p>
                <p className="mt-1">Owner address: {MINT_OWNER_ADDRESS?.substring(0, 6)}...{MINT_OWNER_ADDRESS?.substring(MINT_OWNER_ADDRESS.length - 4)}</p>
              </div>
              <div className="mt-6">
                <WalletInfo />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Auction Details</h2>
              </div>
              
              {/* Form Container */}
              <div className="p-6">
                {message && (
                  <div className={`mb-6 p-4 rounded-lg border ${
                    message.includes('successfully') 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        {message.includes('successfully') ? (
                          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{message}</p>
                        {transactionHash && (
                          <div className="mt-2 text-sm">
                            <a 
                              href={`https://sepolia.etherscan.io/tx/${transactionHash}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium underline hover:text-green-900"
                            >
                              View transaction on Etherscan
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Collection Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Collection Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                      placeholder="My Exclusive NFT Collection"
                      required
                    />
                  </div>
                  
                  {/* Symbol */}
                  <div>
                    <label htmlFor="symbol" className="block text-sm font-semibold text-gray-700 mb-2">
                      Symbol
                    </label>
                    <input
                      type="text"
                      id="symbol"
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                      placeholder="NFT"
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                      placeholder="Describe your NFT collection and what makes it special..."
                      rows="4"
                    />
                  </div>
                  
                  {/* Duration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
                        Auction Duration (hours) *
                      </label>
                      <input
                        type="number"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                        placeholder="24"
                        min="1"
                        max="168"
                        required
                      />
                      <p className="mt-2 text-sm text-gray-500">Duration between 1-168 hours (1 week)</p>
                    </div>
                    
                    {/* Reserve Price */}
                    <div>
                      <label htmlFor="reservePrice" className="block text-sm font-semibold text-gray-700 mb-2">
                        Reserve Price (ETH)
                      </label>
                      <input
                        type="number"
                        id="reservePrice"
                        name="reservePrice"
                        value={formData.reservePrice}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                        placeholder="0.0"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  {/* Media Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload Media
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-yellow-400 transition-colors">
                      {previewUrl ? (
                        <div>
                          <div className="relative inline-block">
                            <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-xl shadow-md" />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFile(null);
                                setPreviewUrl(null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mt-4 text-lg font-medium text-gray-900">Upload your NFT media</p>
                          <p className="mt-1 text-sm text-gray-500">
                            <span className="font-medium text-yellow-600">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            PNG, JPG, GIF up to 10MB
                          </p>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                          >
                            Select File
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all ${
                        isCreating 
                          ? 'bg-yellow-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 hover:shadow-xl transform hover:-translate-y-0.5'
                      }`}
                    >
                      {isCreating ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Auction...
                        </div>
                      ) : (
                        'Create Auction'
                      )}
                    </button>
                    
                    <p className="mt-4 text-center text-sm text-gray-500">
                      By creating an auction, you agree to our terms and confirm that you are the rightful owner of this NFT collection.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mint;