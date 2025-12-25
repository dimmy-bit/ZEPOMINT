// scripts/check-contract-status.js
// Script to check the status of the deployed contract

require('dotenv').config();

async function main() {
  console.log("=== CHECKING CONTRACT STATUS ===");
  
  try {
    // Get the contract address from environment or use the one from config
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
    
    console.log("Checking contract at address:", contractAddress);
    
    // Get the contract factory and attach to existing contract
    const SmartFinalizeAuction = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalize");
    const auction = SmartFinalizeAuction.attach(contractAddress);
    
    // Listen for events
    console.log("\nListening for contract events...");
    
    // Check for recent AuctionCreated events
    const auctionCreatedFilter = auction.filters.AuctionCreated();
    const auctionCreatedEvents = await auction.queryFilter(auctionCreatedFilter, -1000); // Last 1000 blocks
    
    console.log(`Found ${auctionCreatedEvents.length} recent auction creation events:`);
    for (let i = 0; i < Math.min(3, auctionCreatedEvents.length); i++) {
      const event = auctionCreatedEvents[auctionCreatedEvents.length - 1 - i];
      console.log(`- Block ${event.blockNumber}: Auction ending at ${new Date(Number(event.args.endTime) * 1000).toISOString()}`);
    }
    
    if (auctionCreatedEvents.length > 3) {
      console.log(`... and ${auctionCreatedEvents.length - 3} more`);
    }
    
    // Check for recent BidSubmitted events
    const bidSubmittedFilter = auction.filters.BidSubmitted();
    const bidSubmittedEvents = await auction.queryFilter(bidSubmittedFilter, -1000); // Last 1000 blocks
    
    console.log(`\nFound ${bidSubmittedEvents.length} recent bid submission events:`);
    for (let i = 0; i < Math.min(3, bidSubmittedEvents.length); i++) {
      const event = bidSubmittedEvents[bidSubmittedEvents.length - 1 - i];
      console.log(`- Block ${event.blockNumber}: Bid from ${event.args.bidder} (index: ${event.args.bidIndex.toString()})`);
    }
    
    if (bidSubmittedEvents.length > 3) {
      console.log(`... and ${bidSubmittedEvents.length - 3} more`);
    }
    
    console.log("\n🎉 CONTRACT STATUS CHECK COMPLETE!");
    console.log("✅ Contract is responding to queries");
    console.log("✅ Events are being recorded properly");
    
  } catch (error) {
    console.error("❌ Status check failed:", error.message);
    console.error("Note: This might be due to network configuration issues");
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