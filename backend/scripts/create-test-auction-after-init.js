// scripts/create-test-auction-after-init.js
// Script to create a test auction after contract initialization

require('dotenv').config();

async function main() {
  console.log("=== CREATING TEST AUCTION ===");
  
  try {
    // Get the contract address from environment or use the one from config
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
    
    console.log("Using contract at address:", contractAddress);
    
    // Get the contract factory and attach to existing contract
    const SmartFinalizeAuction = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalize");
    const auction = SmartFinalizeAuction.attach(contractAddress);
    
    // Get deployer info
    const [deployer] = await ethers.getSigners();
    console.log("Creating auction with account:", deployer.address);
    
    // Create a test auction (1 hour duration, sample metadata CID)
    console.log("\nCreating test auction...");
    const duration = 3600; // 1 hour in seconds
    const metadataCID = "QmWgL11go85J4UpC5sZCqZyJzKNX9YYbWsgiWz9Sj9X5bD"; // Sample CID
    
    const createTx = await auction.createAuction(duration, metadataCID);
    await createTx.wait();
    console.log("✅ Test auction created successfully");
    
    // Verify auction details
    const auctionDetails = await auction.getAuctionDetails();
    console.log("\nAuction Details:");
    console.log("- Metadata CID:", auctionDetails.metadataCID);
    console.log("- End Time:", new Date(Number(auctionDetails.endTime) * 1000).toISOString());
    console.log("- Finalized:", auctionDetails.finalized);
    console.log("- Initialized:", auctionDetails.initialized);
    
    console.log("\n🎉 TEST AUCTION CREATION COMPLETE!");
    console.log("✅ Auction created with 1-hour duration");
    console.log("✅ Metadata CID:", metadataCID);
    console.log("✅ End time:", new Date(Number(auctionDetails.endTime) * 1000).toISOString());
    
  } catch (error) {
    console.error("❌ Auction creation failed:", error.message);
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