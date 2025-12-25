// scripts/check-auction-status.js
// Script to check the status of the current auction

require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  console.log("=== CHECKING AUCTION STATUS ===");
  
  try {
    // Get the new contract address
    const contractAddress = "0x1C9D5B1f795cbEc1dCe2c418B9F903e7DD07A510";
    
    console.log("Checking contract at address:", contractAddress);
    
    // Get RPC URL
    const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
    console.log("Using RPC URL:", rpcUrl);
    
    // Create provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Get the ABI for the functions we need to check
    const abi = [
      "function getAuctionDetails() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, bool initialized))",
      "function hasAuctionEnded() view returns (bool)"
    ];
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    // Check auction details
    console.log("\nChecking auction details...");
    const auctionDetails = await contract.getAuctionDetails();
    console.log("✅ Auction Details:");
    console.log("  - Metadata CID:", auctionDetails.metadataCID);
    console.log("  - End Time:", new Date(Number(auctionDetails.endTime) * 1000).toISOString());
    console.log("  - Finalized:", auctionDetails.finalized);
    console.log("  - Initialized:", auctionDetails.initialized);
    
    // Check if auction has ended
    const hasEnded = await contract.hasAuctionEnded();
    console.log("✅ Auction Has Ended:", hasEnded);
    
    // Calculate time remaining
    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = Number(auctionDetails.endTime);
    const timeRemaining = endTime - currentTime;
    
    if (timeRemaining > 0) {
      const hours = Math.floor(timeRemaining / 3600);
      const minutes = Math.floor((timeRemaining % 3600) / 60);
      const seconds = timeRemaining % 60;
      console.log(`⏰ Time remaining: ${hours}h ${minutes}m ${seconds}s`);
    } else {
      console.log("⏰ Auction has already ended");
    }
    
    console.log("\n🎉 AUCTION STATUS CHECK COMPLETE!");
    
  } catch (error) {
    console.error("❌ Check failed:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });