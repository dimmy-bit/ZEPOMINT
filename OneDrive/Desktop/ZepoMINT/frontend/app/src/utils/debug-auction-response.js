// debug-auction-response.js
// Script to debug the auction response format
import { ethers } from 'ethers';
import ZepoMintFHEData from '../abi/ZepoMINTFHEAuction.json' with { type: 'json' };

async function debugAuctionResponse() {
  try {
    console.log("=== Debugging Auction Response Format ===\n");
    
    // Use the same RPC URL as in the frontend
    const rpcUrl = "https://eth-sepolia.g.alchemy.com/v2/kEl3NhorDcbSNncThw3-PbyCrtJcFsKe";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Get contract address from environment
    const contractAddress = "0xf34d82595114409f8a68cA4C13e6Ae57D0EF1f6E";
    
    console.log("Contract Address:", contractAddress);
    console.log("RPC URL:", rpcUrl);
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, ZepoMintFHEData.abi, provider);
    
    console.log("\n1. Testing getAuctionDetails response format...");
    
    try {
      const auctionDetails = await contract.getAuctionDetails();
      console.log("   Raw auction details:", auctionDetails);
      console.log("   Type of auctionDetails:", typeof auctionDetails);
      console.log("   Is array:", Array.isArray(auctionDetails));
      
      if (Array.isArray(auctionDetails)) {
        console.log("   Array length:", auctionDetails.length);
        auctionDetails.forEach((item, index) => {
          console.log(`   Index ${index}:`, item, `(type: ${typeof item})`);
        });
      } else if (typeof auctionDetails === 'object' && auctionDetails !== null) {
        console.log("   Object keys:", Object.keys(auctionDetails));
        Object.keys(auctionDetails).forEach(key => {
          console.log(`   Key '${key}':`, auctionDetails[key], `(type: ${typeof auctionDetails[key]})`);
        });
      }
      
      // Try to access the properties directly
      console.log("\n2. Testing direct property access...");
      try {
        console.log("   metadataCID:", auctionDetails.metadataCID);
        console.log("   endTime:", auctionDetails.endTime);
        console.log("   finalized:", auctionDetails.finalized);
        console.log("   initialized:", auctionDetails.initialized);
      } catch (e) {
        console.log("   Direct property access failed:", e.message);
      }
      
      // Try indexed access
      console.log("\n3. Testing indexed access...");
      try {
        console.log("   Index 0:", auctionDetails[0]);
        console.log("   Index 1:", auctionDetails[1]);
        console.log("   Index 2:", auctionDetails[2]);
        console.log("   Index 3:", auctionDetails[3]);
      } catch (e) {
        console.log("   Indexed access failed:", e.message);
      }
      
    } catch (error) {
      console.log("   ✗ getAuctionDetails failed:", error.message);
      console.log("   Error stack:", error.stack);
    }
    
    console.log("\n=== Debug Complete ===");
    
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

// Run the debug
debugAuctionResponse();