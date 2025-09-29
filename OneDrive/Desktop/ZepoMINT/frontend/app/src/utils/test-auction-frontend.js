// test-auction-frontend.js
// Script to test if the auction is properly displayed on the frontend
import { ethers } from 'ethers';
import ZepoMintFHEData from '../abi/ZepoMINTFHEAuction.json' with { type: 'json' };

async function testAuctionFrontend() {
  try {
    console.log("=== Testing Auction Frontend Display ===\n");
    
    // Use the same RPC URL as in the frontend
    const rpcUrl = "https://eth-sepolia.g.alchemy.com/v2/JkwlX2jl-1k1wTZQPFHuC-YYuLcoldZk";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Get contract address from environment
    const contractAddress = "0xf34d82595114409f8a68cA4C13e6Ae57D0EF1f6E";
    
    console.log("Contract Address:", contractAddress);
    console.log("RPC URL:", rpcUrl);
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, ZepoMintFHEData.abi, provider);
    
    console.log("\n1. Testing contract connection...");
    
    // Test basic contract functions
    try {
      const auctionInitialized = await contract.auctionInitialized();
      console.log("   ✓ auctionInitialized:", auctionInitialized);
    } catch (error) {
      console.log("   ○ auctionInitialized: Not available or error:", error.message);
    }
    
    console.log("\n2. Testing getAuctionDetails...");
    
    try {
      const auctionDetails = await contract.getAuctionDetails();
      console.log("   ✓ getAuctionDetails successful");
      console.log("   Raw auction details:", auctionDetails);
      
      // Check the structure
      console.log("   Structure check:");
      console.log("   - metadataCID:", typeof auctionDetails.metadataCID, auctionDetails.metadataCID);
      console.log("   - endTime:", typeof auctionDetails.endTime, auctionDetails.endTime.toString());
      console.log("   - finalized:", typeof auctionDetails.finalized, auctionDetails.finalized);
      console.log("   - initialized:", typeof auctionDetails.initialized, auctionDetails.initialized);
      
      // Check if we have a valid auction
      if (auctionDetails.metadataCID && auctionDetails.metadataCID !== "") {
        console.log("   ✓ Valid auction found!");
        console.log("   - Metadata CID:", auctionDetails.metadataCID);
        console.log("   - End time:", new Date(parseInt(auctionDetails.endTime.toString()) * 1000).toLocaleString());
        console.log("   - Finalized:", auctionDetails.finalized);
        console.log("   - Initialized:", auctionDetails.initialized);
      } else {
        console.log("   ○ No active auction (metadataCID is empty)");
      }
    } catch (error) {
      console.log("   ✗ getAuctionDetails failed:", error.message);
      console.log("   Error stack:", error.stack);
    }
    
    console.log("\n3. Testing getBidCount...");
    
    try {
      const bidCount = await contract.getBidCount();
      console.log("   ✓ getBidCount:", bidCount.toString());
    } catch (error) {
      console.log("   ○ getBidCount failed:", error.message);
    }
    
    console.log("\n=== Test Complete ===");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testAuctionFrontend();