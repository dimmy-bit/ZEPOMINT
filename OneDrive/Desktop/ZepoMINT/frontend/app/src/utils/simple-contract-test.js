// simple-contract-test.js
// Simple test to verify contract interaction works
import { ethers } from 'ethers';
import ZepoMintFHEData from '../abi/ZepoMINTFHEAuction.json' with { type: 'json' };

async function simpleContractTest() {
  try {
    console.log("=== Simple Contract Test ===\n");
    
    // Use the same RPC URL as in the frontend
    const rpcUrl = import.meta.env.VITE_NETWORK_URL || "https://rpc.sepolia.org";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Get contract address from environment
    const contractAddress = "0xf34d82595114409f8a68cA4C13e6Ae57D0EF1f6E";
    
    console.log("Contract Address:", contractAddress);
    console.log("RPC URL:", rpcUrl);
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, ZepoMintFHEData.abi, provider);
    
    console.log("\n1. Testing getAuctionDetails...");
    
    try {
      const auctionDetails = await contract.getAuctionDetails();
      console.log("   Raw auction details:", auctionDetails);
      
      // Process the auction details like in our fixed functions
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
      
      // Test creating auction object like in our fixed function
      const auction = {
        endTime: processedAuctionDetails.endTime?.toString ? processedAuctionDetails.endTime.toString() : processedAuctionDetails.endTime,
        metadataCID: processedAuctionDetails.metadataCID?.toString ? processedAuctionDetails.metadataCID.toString() : processedAuctionDetails.metadataCID,
        finalized: !!processedAuctionDetails.finalized,
        initialized: !!processedAuctionDetails.initialized
      };
      
      console.log("   Final auction object:", auction);
      
      // Test specific field access that was failing
      console.log("\n2. Testing specific field access...");
      console.log("   metadataCID:", auction.metadataCID);
      console.log("   endTime:", auction.endTime);
      console.log("   finalized:", auction.finalized);
      console.log("   initialized:", auction.initialized);
      
      if (auction.metadataCID && auction.metadataCID !== "") {
        console.log("   ✅ Valid auction found!");
      } else {
        console.log("   ⚠️ No active auction");
      }
      
    } catch (error) {
      console.log("   ❌ Error calling getAuctionDetails:", error.message);
      console.log("   Error stack:", error.stack);
    }
    
    console.log("\n=== Test Complete ===");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
simpleContractTest();