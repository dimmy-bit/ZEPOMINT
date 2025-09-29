// simple-contract-check.js
// Simple script to check if the contract is working
import { ethers } from 'ethers';
import ZepoMintFHEData from '../abi/ZepoMINTFHEAuction.json' with { type: 'json' };

async function checkContract() {
  try {
    console.log("=== Checking Contract Status ===\n");
    
    // Use the same RPC URL as in the frontend
    const rpcUrl = "https://eth-sepolia.g.alchemy.com/v2/JkwlX2jl-1k1wTZQPFHuC-YYuLcoldZk";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Use the NEW contract address that was just deployed
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    console.log("Contract Address:", contractAddress);
    console.log("RPC URL:", rpcUrl);
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, ZepoMintFHEData.abi, provider);
    
    console.log("\n1. Checking auction initialization...");
    
    try {
      const isInitialized = await contract.auctionInitialized();
      console.log("   Auction initialized:", isInitialized);
    } catch (error) {
      console.log("   Error checking auction initialization:", error.message);
    }
    
    console.log("\n2. Checking public key URI...");
    
    try {
      const publicKeyURI = await contract.getPublicKeyURI();
      console.log("   Public key URI:", publicKeyURI);
    } catch (error) {
      console.log("   Error getting public key URI:", error.message);
    }
    
    console.log("\n3. Checking auction details...");
    
    try {
      const auctionDetails = await contract.getAuctionDetails();
      console.log("   Raw auction details:", auctionDetails);
      
      // Process the auction details
      let processedAuctionDetails;
      
      if (Array.isArray(auctionDetails)) {
        console.log("   Using array format");
        processedAuctionDetails = {
          metadataCID: auctionDetails[0],
          endTime: auctionDetails[1],
          finalized: auctionDetails[2],
          initialized: auctionDetails[3]
        };
      } else if (typeof auctionDetails === 'object' && auctionDetails !== null) {
        console.log("   Using object format");
        processedAuctionDetails = auctionDetails;
      } else {
        console.error("   Unexpected auction details format:", auctionDetails);
        return;
      }
      
      console.log("   Processed auction details:", processedAuctionDetails);
      
      // Check if auction has ended
      const endTime = parseInt(processedAuctionDetails.endTime);
      const currentTime = Math.floor(Date.now() / 1000);
      
      console.log("   Current time:", currentTime, new Date(currentTime * 1000).toISOString());
      console.log("   End time:", endTime, new Date(endTime * 1000).toISOString());
      console.log("   Auction ended:", currentTime >= endTime);
      
    } catch (error) {
      console.log("   Error getting auction details:", error.message);
      console.log("   Error stack:", error.stack);
    }
    
    console.log("\n4. Checking bid count...");
    
    try {
      const bidCount = await contract.getBidCount();
      console.log("   Bid count:", bidCount.toString());
    } catch (error) {
      console.log("   Error getting bid count:", error.message);
    }
    
    console.log("\n=== Check Complete ===");
    
  } catch (error) {
    console.error("❌ Check failed:", error);
  }
}

// Run the check
checkContract();