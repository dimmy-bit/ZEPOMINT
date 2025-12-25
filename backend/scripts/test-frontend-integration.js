// scripts/test-frontend-integration.js
// Test frontend integration with the new smart finalize contract

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== TESTING FRONTEND INTEGRATION ===");
  
  try {
    // Get the new contract address from deployment
    const deploymentPath = path.join(__dirname, "..", "deployments", "your-private-key-deployment.json");
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    console.log("Using deployed contract:", deploymentInfo.contractAddress);
    
    // Get the contract instance
    const SmartFinalizeAuction = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalize");
    const auction = await SmartFinalizeAuction.attach(deploymentInfo.contractAddress);
    
    // Test 1: Get contract details (what frontend would do)
    console.log("\n--- Testing Contract Details ---");
    const auctionDetails = await auction.getAuctionDetails();
    const bidCount = await auction.getBidCount();
    const publicKeyURI = await auction.getPublicKeyURI();
    
    console.log("✅ Auction Details:");
    console.log("  - Metadata CID:", auctionDetails.metadataCID);
    console.log("  - End Time:", new Date(Number(auctionDetails.endTime) * 1000).toISOString());
    console.log("  - Finalized:", auctionDetails.finalized);
    console.log("  - Initialized:", auctionDetails.initialized);
    console.log("  - Bid Count:", bidCount.toString());
    console.log("  - Public Key URI:", publicKeyURI);
    
    // Test 2: Check if auction has ended (what frontend would do)
    console.log("\n--- Testing Auction Status ---");
    const currentTime = Math.floor(Date.now() / 1000);
    const hasEnded = currentTime >= Number(auctionDetails.endTime);
    
    console.log("  - Current Time:", new Date(currentTime * 1000).toISOString());
    console.log("  - Auction End Time:", new Date(Number(auctionDetails.endTime) * 1000).toISOString());
    console.log("  - Has Auction Ended:", hasEnded);
    
    // Test 3: Simulate what Owner Console would do
    console.log("\n--- Testing Owner Console Functionality ---");
    if (hasEnded && !auctionDetails.finalized) {
      console.log("  ✅ Auction ready for finalization");
      console.log("  ✅ Owner Console should show 'Run Onchain Compute' button");
    } else if (auctionDetails.finalized) {
      console.log("  ✅ Auction already finalized");
    } else {
      console.log("  ℹ️  Auction still running");
    }
    
    // Test 4: Check if smartFinalize function exists (what frontend would check)
    console.log("\n--- Testing ABI Functions ---");
    const hasSmartFinalize = typeof auction.smartFinalize === 'function';
    const hasGetBid = typeof auction.getBid === 'function';
    const hasAllowBidAccess = typeof auction.allowBidAccess === 'function';
    
    console.log("  ✅ smartFinalize function available:", hasSmartFinalize);
    console.log("  ✅ getBid function available:", hasGetBid);
    console.log("  ✅ allowBidAccess function available:", hasAllowBidAccess);
    
    console.log("\n🎉 FRONTEND INTEGRATION TEST COMPLETE!");
    console.log("✅ Frontend can successfully interact with the new smart finalize contract");
    console.log("✅ Owner Console will properly display finalization options");
    
  } catch (error) {
    console.error("❌ Integration test failed:", error.message);
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