// Utility functions for debugging FHE operations
import { ethers } from 'ethers';
import ZepoMintFHEData from '../abi/ZepoMINTFHEAuction.json' with { type: 'json' };
import { getContractAddress } from './contract-interaction';

/**
 * Debug FHE operations in the contract
 * @param {ethers.Provider} provider - The ethers provider
 * @param {ethers.Signer} signer - The signer for transactions
 */
export async function debugFHEOperations(provider, signer) {
  try {
    const contractAddress = getContractAddress();
    console.log("Debugging FHE operations for contract:", contractAddress);
    
    // Create contract instances
    const readOnlyContract = new ethers.Contract(contractAddress, ZepoMintFHEData.abi, provider);
    const writableContract = new ethers.Contract(contractAddress, ZepoMintFHEData.abi, signer);
    
    // Get auction details
    console.log("Fetching auction details...");
    const auctionDetails = await readOnlyContract.getAuctionDetails();
    console.log("Auction details:", auctionDetails);
    
    // Check if auction has ended
    console.log("Checking if auction has ended...");
    const hasEnded = await readOnlyContract.hasAuctionEnded();
    console.log("Has auction ended?", hasEnded);
    
    // Get bid count
    console.log("Getting bid count...");
    const bidCount = await readOnlyContract.getBidCount();
    console.log("Bid count:", bidCount.toString());
    
    // Check if we can access individual bids
    if (bidCount > 0) {
      console.log("Fetching first bid...");
      try {
        const firstBid = await readOnlyContract.getBid(0);
        console.log("First bid:", firstBid);
      } catch (error) {
        console.error("Error fetching first bid:", error);
      }
    }
    
    // Check contract owner
    console.log("Getting contract owner...");
    const owner = await readOnlyContract.owner();
    console.log("Contract owner:", owner);
    
    // Return debug information
    return {
      success: true,
      auctionDetails,
      hasEnded,
      bidCount: bidCount.toString(),
      owner,
      timestamp: Math.floor(Date.now() / 1000),
      timestampFormatted: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in FHE debug:", error);
    return {
      success: false,
      error: error.message,
      timestamp: Math.floor(Date.now() / 1000),
      timestampFormatted: new Date().toISOString()
    };
  }
}

/**
 * Test FHE operations manually
 * @param {ethers.Signer} signer - The signer for transactions
 */
export async function testFHEFinalize(signer) {
  try {
    const contractAddress = getContractAddress();
    console.log("Testing FHE finalize for contract:", contractAddress);
    
    // Create contract instance with signer
    const contract = new ethers.Contract(contractAddress, ZepoMintFHEData.abi, signer);
    
    // Try to call computeWinnerOnChain
    console.log("Calling computeWinnerOnChain...");
    const tx = await contract.computeWinnerOnChain();
    console.log("Transaction sent:", tx.hash);
    
    // Wait for transaction to be mined
    console.log("Waiting for transaction to be mined...");
    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt);
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error("Error in FHE finalize test:", error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      reason: error.reason
    };
  }
}