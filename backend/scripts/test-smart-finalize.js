// scripts/test-smart-finalize.js
// Test script for smart finalization

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== TESTING SMART FINALIZATION ===");
  
  try {
    // Get deployment info
    const deploymentPath = path.join(__dirname, "..", "deployments", "your-private-key-deployment.json");
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    console.log("Using deployed contract:", deploymentInfo.contractAddress);
    
    // Get the contract instance
    const SmartFinalizeAuction = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalize");
    const auction = await SmartFinalizeAuction.attach(deploymentInfo.contractAddress);
    
    // Get contract details
    const auctionDetails = await auction.getAuctionDetails();
    const bidCount = await auction.getBidCount();
    
    console.log("\nAuction Details:");
    console.log("- Metadata CID:", auctionDetails.metadataCID);
    console.log("- End Time:", new Date(Number(auctionDetails.endTime) * 1000).toISOString());
    console.log("- Finalized:", auctionDetails.finalized);
    console.log("- Initialized:", auctionDetails.initialized);
    console.log("- Bid Count:", bidCount.toString());
    
    // Check if auction has ended
    const currentTime = Math.floor(Date.now() / 1000);
    const hasEnded = currentTime >= Number(auctionDetails.endTime);
    
    console.log("\nTime Check:");
    console.log("- Current Time:", new Date(currentTime * 1000).toISOString());
    console.log("- Auction Ended:", hasEnded);
    
    if (hasEnded && !auctionDetails.finalized) {
      console.log("\nAttempting smart finalization...");
      
      // Try to call smartFinalize
      const tx = await auction.smartFinalize();
      await tx.wait();
      
      console.log("✅ Smart finalization transaction submitted");
      
      // Check finalization status
      const updatedAuctionDetails = await auction.getAuctionDetails();
      console.log("\nUpdated Auction Status:");
      console.log("- Finalized:", updatedAuctionDetails.finalized);
      
    } else if (auctionDetails.finalized) {
      console.log("\nAuction is already finalized");
    } else {
      console.log("\nAuction has not ended yet or is already finalized");
    }
    
    console.log("\n🎉 SMART FINALIZATION TEST COMPLETE!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
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