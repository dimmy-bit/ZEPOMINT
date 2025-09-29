import { ethers } from 'ethers';
import ZepoMintFHEData from '../abi/ZepoMINTFHEAuction.json' with { type: 'json' };
import { getEthersProviderFromWagmi } from './wagmi-provider-helper';

// Contract address - will be set by main.jsx
let CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0xCDeF6cf1a31Dd656C3904dBE0534B2452172f672";

/**
 * Set the contract address
 * @param {string} address - The contract address
 */
export function setContractAddress(address) {
  console.log("Contract address set to:", address);
  CONTRACT_ADDRESS = address;
}

/**
 * Get the contract address
 * @returns {string} - The contract address
 */
export function getContractAddress() {
  return CONTRACT_ADDRESS;
}

/**
 * Get contract instance with proper signer
 * @param {ethers.Provider|Object} provider - The provider (ethers or wagmi)
 * @param {ethers.Signer} signer - Optional signer for write operations
 * @returns {ethers.Contract} - The contract instance
 */
export function getContract(provider, signer = null) {
  // If we have a signer, use it directly
  if (signer) {
    return new ethers.Contract(
      CONTRACT_ADDRESS,
      ZepoMintFHEData.abi,
      signer
    );
  }
  
  // Create a proper provider from environment variables
  const rpcUrl = import.meta.env.VITE_ALCHEMY_RPC_URL || 
                 import.meta.env.VITE_INFURA_RPC_URL || 
                 import.meta.env.VITE_ANKR_RPC_URL || 
                 import.meta.env.VITE_SEPOLIA_RPC_URL ||
                 "https://rpc.sepolia.org";
  
  const ethersProvider = new ethers.JsonRpcProvider(rpcUrl);
  
  // Create contract with provider (read-only)
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    ZepoMintFHEData.abi,
    ethersProvider
  );
  
  return contract;
}

/**
 * Get auction contract with proper signer for write operations
 * @returns {Promise<ethers.Contract>} - The contract instance with signer
 */
export async function getAuctionContract() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("No wallet found");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner(); // ✅ signer for tx

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    ZepoMintFHEData.abi,
    signer // ✅ must be signer, not provider
  );
}

// Function to check if auction is initialized
export async function isAuctionInitialized(provider) {
  try {
    console.log("Checking if auction is initialized with provider:", provider);
    
    // Get contract with provider for read operations
    const contract = getContract(provider);
    
    // Try to get auction details to check if auction exists
    try {
      const auctionDetails = await contract.getAuctionDetails();
      
      // Handle different response formats
      let processedAuctionDetails;
      
      // Check if auctionDetails is an array (indexed access) or object (named access)
      if (Array.isArray(auctionDetails)) {
        // Array format: [metadataCID, endTime, finalized, initialized]
        processedAuctionDetails = {
          metadataCID: auctionDetails[0],
          endTime: auctionDetails[1],
          finalized: auctionDetails[2],
          initialized: auctionDetails[3]
        };
      } else if (typeof auctionDetails === 'object' && auctionDetails !== null) {
        // Object format: { metadataCID, endTime, finalized, initialized }
        processedAuctionDetails = auctionDetails;
      } else {
        // Unexpected format
        console.error("Unexpected auction details format in isAuctionInitialized:", auctionDetails);
        return false;
      }
      
      // If we can get auction details and they have metadata, auction is initialized
      const isInitialized = !!(processedAuctionDetails.metadataCID && processedAuctionDetails.metadataCID !== "");
      console.log("Auction initialized result:", isInitialized);
      return isInitialized;
    } catch (detailsError) {
      // If we can't get auction details, auction is not initialized
      console.log("Error getting auction details, assuming auction not initialized:", detailsError);
      return false;
    }
  } catch (error) {
    console.error("Error checking auction initialization:", error);
    console.error("Error stack:", error.stack);
    // If we can't read the state, assume it's not initialized
    return false;
  }
}

// Function to get bid count
export async function getBidCount(provider) {
  try {
    console.log("Getting bid count with provider:", provider);
    
    // Get contract with provider for read operations
    const contract = getContract(provider);
    
    const count = await contract.getBidCount();
    console.log("Bid count result:", count.toString());
    
    // Handle different possible return types properly
    if (typeof count === 'bigint') {
      // Check if the BigInt value is within safe integer range
      if (count <= Number.MAX_SAFE_INTEGER) {
        return Number(count);
      } else {
        // For very large numbers, return as string to avoid precision loss
        return count.toString();
      }
    }
    
    // Handle ethers BigNumber
    if (count && typeof count === 'object' && typeof count.toString === 'function') {
      try {
        // Convert to BigInt first, then to Number if safe
        const bigNumberValue = BigInt(count.toString());
        if (bigNumberValue <= Number.MAX_SAFE_INTEGER) {
          return Number(bigNumberValue);
        } else {
          return bigNumberValue.toString();
        }
      } catch (conversionError) {
        console.error("Error converting BigNumber to BigInt:", conversionError);
        // Fallback to string representation
        return count.toString();
      }
    }
    
    // Handle regular numbers
    if (typeof count === 'number') {
      return count;
    }
    
    // Fallback for any other type
    return count;
  } catch (error) {
    console.error("Error getting bid count:", error);
    // Return 0 as fallback
    return 0;
  }
}

// Function to check if auction has ended
export async function hasAuctionEnded(provider) {
  try {
    console.log("Checking if auction has ended with provider:", provider);
    
    // Get contract with provider for read operations
    const contract = getContract(provider);
    
    // Get auction details to determine if it has ended
    const auctionDetails = await contract.getAuctionDetails();
    
    // Handle different response formats
    let processedAuctionDetails;
    
    // Check if auctionDetails is an array (indexed access) or object (named access)
    if (Array.isArray(auctionDetails)) {
      // Array format: [metadataCID, endTime, finalized, initialized]
      processedAuctionDetails = {
        metadataCID: auctionDetails[0],
        endTime: auctionDetails[1],
        finalized: auctionDetails[2],
        initialized: auctionDetails[3]
      };
    } else if (typeof auctionDetails === 'object' && auctionDetails !== null) {
      // Object format: { metadataCID, endTime, finalized, initialized }
      processedAuctionDetails = auctionDetails;
    } else {
      // Unexpected format
      console.error("Unexpected auction details format in hasAuctionEnded:", auctionDetails);
      return false;
    }
    
    // Check if we have valid auction data
    if (!processedAuctionDetails.metadataCID || processedAuctionDetails.metadataCID === "") {
      return false; // No auction exists
    }
    
    // Compare end time with current time
    const endTime = parseInt(processedAuctionDetails.endTime);
    const currentTime = Math.floor(Date.now() / 1000);
    
    console.log("Debug - Current time:", currentTime, new Date(currentTime * 1000).toISOString());
    console.log("Debug - End time:", endTime, new Date(endTime * 1000).toISOString());
    console.log("Debug - Current time >= End time:", currentTime >= endTime);
    
    const ended = currentTime >= endTime;
    
    console.log("Auction ended result:", ended);
    return ended;
  } catch (error) {
    console.error("Error checking auction status:", error);
    // Return false as fallback
    return false;
  }
}

// Get the current auction details
export async function getCurrentAuction(provider) {
  if (!provider) {
    console.log("No provider available, returning null");
    return null;
  }
  
  try {
    // Get the contract instance with provider for read operations
    const contract = getContract(provider);
    
    console.log("Contract instance created for address:", CONTRACT_ADDRESS);
    
    // Try to get auction details (only non-FHE fields for frontend display)
    // If this fails, it likely means no auction exists
    try {
      const auctionDetails = await contract.getAuctionDetails();
      console.log("Raw auction details from contract:", auctionDetails);
      
      // Handle different response formats
      let processedAuctionDetails;
      
      // Check if auctionDetails is an array (indexed access) or object (named access)
      if (Array.isArray(auctionDetails)) {
        // Array format: [metadataCID, endTime, finalized, initialized]
        processedAuctionDetails = {
          metadataCID: auctionDetails[0],
          endTime: auctionDetails[1],
          finalized: auctionDetails[2],
          initialized: auctionDetails[3]
        };
      } else if (typeof auctionDetails === 'object' && auctionDetails !== null) {
        // Object format: { metadataCID, endTime, finalized, initialized }
        processedAuctionDetails = auctionDetails;
      } else {
        // Unexpected format
        console.error("Unexpected auction details format:", auctionDetails);
        return null;
      }
      
      // Check if we have valid auction data
      // If metadataCID is empty, it means no auction has been created
      if (!processedAuctionDetails.metadataCID || processedAuctionDetails.metadataCID === "") {
        console.log("Auction details received but metadataCID is empty");
        return null;
      }
      
      // Convert the auction data to a standard format
      const auction = {
        endTime: processedAuctionDetails.endTime?.toString ? processedAuctionDetails.endTime.toString() : processedAuctionDetails.endTime,
        metadataCID: processedAuctionDetails.metadataCID?.toString ? processedAuctionDetails.metadataCID.toString() : processedAuctionDetails.metadataCID,
        finalized: !!processedAuctionDetails.finalized,
        initialized: !!processedAuctionDetails.initialized
      };
      
      console.log("Processed auction data:", auction);
      return auction;
    } catch (detailsError) {
      // If we can't get auction details, it means no auction exists
      console.log("Error getting auction details:", detailsError);
      console.log("Error stack:", detailsError.stack);
      return null;
    }
  } catch (error) {
    console.error('Error getting current auction:', error);
    // Return null as fallback
    return null;
  }
}

// Function to create a new auction
export async function createAuction(signer, duration, metadataCID) {
  try {
    if (!signer) {
      throw new Error('No signer available');
    }
    
    // Create contract with proper signer
    const contract = getContract(null, signer);
    
    // Create the auction
    const tx = await contract.createAuction(duration, metadataCID, {
      gasLimit: 5000000
    });
    console.log("Create auction transaction sent:", tx);
    
    // Check if tx is valid
    if (!tx) {
      throw new Error('Transaction failed to send - no transaction object returned');
    }
    
    // Extract transaction hash from the response
    let txHash = null;
    
    // Different ways the transaction hash might be available
    if (tx.hash) {
      txHash = tx.hash;
    } else if (tx.transactionHash) {
      txHash = tx.transactionHash;
    } else if (tx.tx && tx.tx.hash) {
      txHash = tx.tx.hash;
    } else if (typeof tx === 'object') {
      // Try to find any property that looks like a hash
      for (const key in tx) {
        if (typeof tx[key] === 'string' && tx[key].startsWith('0x') && tx[key].length === 66) {
          txHash = tx[key];
          break;
        }
      }
    }
    
    // If we still don't have a hash, try to get it from the provider
    if (!txHash && signer && typeof signer.provider !== 'undefined') {
      try {
        // If this is an ethers contract transaction response, it might have a wait method
        if (typeof tx.wait === 'function') {
          // Call wait with 0 confirmations to get the receipt quickly
          const receipt = await tx.wait(0);
          if (receipt && receipt.hash) {
            txHash = receipt.hash;
          }
        }
      } catch (providerError) {
        console.log('Could not get transaction hash from provider:', providerError);
      }
    }
    
    // If we still don't have a hash, throw an error
    if (!txHash) {
      throw new Error('Transaction failed - no transaction hash found');
    }
    
    console.log("Auction created with transaction hash:", txHash);
    
    // Try to wait for the transaction to be mined
    let receipt;
    try {
      if (typeof tx.wait === 'function') {
        receipt = await tx.wait();
        console.log("Auction created successfully in block:", receipt.blockNumber);
      }
    } catch (waitError) {
      console.log("Warning: Could not wait for transaction receipt, but transaction may have succeeded:", waitError);
    }
    
    return { success: true, transactionHash: txHash, receipt };
  } catch (error) {
    console.error("Error creating auction:", error);
    return { success: false, error: error.message };
  }
}

// Function to submit an encrypted bid
export async function submitEncryptedBid(signer, encryptedBid, inputProof) {
  try {
    if (!signer) {
      throw new Error('No signer available');
    }
    
    const contract = getContract(null, signer);
    
    // Submit the encrypted bid
    const tx = await contract.submitBid(encryptedBid, inputProof, {
      gasLimit: 5000000
    });
    console.log("Submit encrypted bid transaction sent:", tx.hash);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Encrypted bid submitted successfully in block:", receipt.blockNumber);
    
    return { success: true, transactionHash: tx.hash, receipt };
  } catch (error) {
    console.error("Error submitting encrypted bid:", error);
    return { success: false, error: error.message };
  }
}

// Function to compute the winner
export async function computeWinner(signer) {
  try {
    if (!signer) {
      throw new Error('No signer available - please connect your wallet');
    }
    
    console.log("Creating contract with signer:", signer);
    
    // Create contract with proper signer
    const contract = getContract(null, signer);
    
    // Use the correct function name: smartFinalize instead of computeWinnerOnChain
    console.log("Sending smart finalize transaction with fixed gas limit...");
    
    const tx = await contract.smartFinalize({
      gasLimit: 5000000 // High gas limit to ensure the transaction has enough gas
    });
    
    console.log("Raw transaction response:", tx);
    
    // Check if tx is valid
    if (!tx) {
      throw new Error('Transaction failed to send - no transaction object returned. Make sure you are using a signer, not a provider.');
    }
    
    // For wagmi wallet clients, the transaction might be returned differently
    // Let's handle various possible response formats
    
    // Handle case where tx might be a promise that needs to be resolved
    let resolvedTx = tx;
    if (tx instanceof Promise) {
      try {
        resolvedTx = await tx;
        console.log("Resolved transaction:", resolvedTx);
      } catch (resolveError) {
        console.log("Error resolving transaction promise:", resolveError);
        throw new Error('Failed to resolve transaction: ' + resolveError.message);
      }
    }
    
    // Extract transaction hash from the response
    let txHash = null;
    
    // Different ways the transaction hash might be available
    if (resolvedTx && resolvedTx.hash) {
      txHash = resolvedTx.hash;
    } else if (resolvedTx && resolvedTx.transactionHash) {
      txHash = resolvedTx.transactionHash;
    } else if (resolvedTx && resolvedTx.tx && resolvedTx.tx.hash) {
      txHash = resolvedTx.tx.hash;
    } else if (resolvedTx && typeof resolvedTx === 'string' && resolvedTx.startsWith('0x') && resolvedTx.length === 66) {
      // If the function directly returns the transaction hash
      txHash = resolvedTx;
    } else if (resolvedTx && typeof resolvedTx === 'object') {
      // Try to find any property that looks like a hash
      for (const key in resolvedTx) {
        if (typeof resolvedTx[key] === 'string' && resolvedTx[key].startsWith('0x') && resolvedTx[key].length === 66) {
          txHash = resolvedTx[key];
          break;
        }
      }
    }
    
    // Special handling for wagmi - the transaction might be sent but we need to wait for it
    if (!txHash) {
      console.log("No immediate transaction hash found. This can happen with wagmi wallet clients.");
      console.log("Will try to get transaction hash by waiting for receipt...");
      
      // Try to get receipt
      try {
        if (resolvedTx && typeof resolvedTx.wait === 'function') {
          // Wait for 0 confirmations to get the receipt quickly
          const receipt = await resolvedTx.wait(0);
          console.log("Transaction receipt:", receipt);
          if (receipt && (receipt.hash || receipt.transactionHash)) {
            txHash = receipt.hash || receipt.transactionHash;
            console.log("Got transaction hash from receipt:", txHash);
          }
        }
      } catch (waitError) {
        console.log("Error waiting for transaction receipt:", waitError);
        // If we get an error waiting for the receipt, it might be a revert
        if (waitError.message && waitError.message.includes('reverted')) {
          throw new Error('Transaction reverted: ' + (waitError.reason || 'Check contract conditions'));
        } else {
          throw new Error('Failed to get transaction receipt: ' + waitError.message);
        }
      }
    }
    
    // If we still don't have a hash, throw an error
    if (!txHash) {
      console.log("Transaction sent but no hash found. Check if you're using the correct signer.");
      throw new Error('Transaction sent but no hash found. Make sure you are connected with a wallet that can sign transactions.');
    }
    
    console.log("Smart finalize transaction sent:", txHash);
    
    // Wait for the transaction to be mined and check for success
    let receipt;
    try {
      if (typeof resolvedTx.wait === 'function') {
        receipt = await resolvedTx.wait();
        console.log("Transaction receipt:", receipt);
        
        // Check if transaction was successful
        if (receipt && receipt.status === 0) {
          throw new Error('Transaction failed on-chain');
        }
      }
    } catch (waitError) {
      console.log("Error waiting for transaction confirmation:", waitError);
      // Check if it's a reverted transaction
      if (waitError.message && waitError.message.includes('reverted')) {
        throw new Error('Transaction reverted: ' + (waitError.reason || 'Unknown error'));
      } else {
        throw new Error('Transaction failed: ' + waitError.message);
      }
    }
    
    return { success: true, transactionHash: txHash, receipt };
  } catch (error) {
    console.error("Error computing winner:", error);
    console.error("Error stack:", error.stack);
    
    // Try to get more details about the error
    if (error.transaction) {
      console.log("Failed transaction:", error.transaction);
    }
    if (error.receipt) {
      console.log("Transaction receipt:", error.receipt);
    }
    
    // Check if it's a gas estimation issue
    if (error.message.includes("gas") || error.message.includes("estimate")) {
      console.log("This error might be due to gas estimation issues. Try increasing the gas limit.");
    }
    
    // Check if it's a signer issue
    if (error.message.includes("signer") || error.message.includes("provider")) {
      console.log("This error might be due to using a provider instead of a signer. Make sure you are connected with a wallet.");
    }
    
    // Return detailed error information
    return { success: false, error: error.message, fullError: error };
  }
}

// Function to mint NFT
export async function mintNFT(signer, tokenId) {
  try {
    if (!signer) {
      throw new Error('No signer available');
    }
    
    const contract = getContract(null, signer);
    
    // Mint the NFT
    const tx = await contract.mintNFTToWinner(tokenId, {
      gasLimit: 5000000
    });
    console.log("Mint NFT transaction sent:", tx.hash);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("NFT minted successfully in block:", receipt.blockNumber);
    
    return { success: true, transactionHash: tx.hash, receipt };
  } catch (error) {
    console.error("Error minting NFT:", error);
    return { success: false, error: error.message };
  }
}
