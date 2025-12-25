// scripts/deploy-simple.js
// Simple deployment script for smart finalize contract

async function main() {
  console.log("=== DEPLOYING SMART FINALIZE CONTRACT ===");
  
  try {
    // Get the contract factory
    const SmartFinalizeAuction = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalize");
    
    console.log("Deploying smart finalize auction contract...");
    
    // Deploy the contract
    const auction = await SmartFinalizeAuction.deploy();
    await auction.waitForDeployment();
    
    const contractAddress = await auction.getAddress();
    console.log("✅ Contract deployed at:", contractAddress);
    
    // Get deployer info
    const [deployer] = await ethers.getSigners();
    console.log("Deployed by:", deployer.address);
    
    // Initialize the contract
    console.log("\nInitializing contract...");
    const initTx = await auction.initialize("http://127.0.0.1:3000/public_key");
    await initTx.wait();
    console.log("✅ Contract initialized");
    
    // Create first auction
    console.log("\nCreating first auction...");
    const createTx = await auction.createAuction(3600, "QmWgL11go85J4UpC5sZCqZyJzKNX9YYbWsgiWz9Sj9X5bD");
    await createTx.wait();
    console.log("✅ First auction created");
    
    // Verify deployment
    const auctionDetails = await auction.getAuctionDetails();
    console.log("\nAuction Details:");
    console.log("- Metadata CID:", auctionDetails.metadataCID);
    console.log("- End Time:", new Date(Number(auctionDetails.endTime) * 1000).toISOString());
    console.log("- Finalized:", auctionDetails.finalized);
    console.log("- Initialized:", auctionDetails.initialized);
    
    console.log("\n🎉 SMART FINALIZE CONTRACT DEPLOYMENT COMPLETE!");
    console.log("✅ Contract deployed at:", contractAddress);
    console.log("✅ Owner address:", deployer.address);
    
    console.log("\nSmart Finalization Features:");
    console.log("- 0 bids: Finalize without winner");
    console.log("- 1 bid: Automatic winner (owner bids excluded)");
    console.log("- 2+ bids: FHE-based winner determination (owner bids excluded)");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
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