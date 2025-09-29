// check-current-auction.js
const { ethers } = require("hardhat");

async function main() {
  // Configuration
  const contractAddress = "0x7317A3152B16D1d2d5A9f0856233c739B5aA111e";
  const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/JkwlX2jl-1k1wTZQPFHuC-YYuLcoldZk");
  
  // Contract ABI - simplified version with only the functions we need
  const abi = [
    "function auctionInitialized() view returns (bool)",
    "function getBidCount() view returns (uint256)",
    "function hasAuctionEnded() view returns (bool)",
    "function getAuctionDetails() view returns (string metadataCID, uint256 endTime, bool finalized, uint256 winnerIndex, address winner)",
    "function currentAuction() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, uint256 winnerIndex, address winner))"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, provider);
  
  try {
    console.log("Checking contract state for address:", contractAddress);
    
    // Check if auction is initialized
    const isInitialized = await contract.auctionInitialized();
    console.log("Auction initialized:", isInitialized);
    
    // Check if auction has ended
    const hasEnded = await contract.hasAuctionEnded();
    console.log("Auction has ended:", hasEnded);
    
    // Get bid count
    const bidCount = await contract.getBidCount();
    console.log("Bid count:", bidCount.toString());
    
    // Try to get current auction data
    console.log("\n=== Getting auction details ===");
    try {
      const auctionDetails = await contract.getAuctionDetails();
      console.log("Auction details:");
      console.log("  Metadata CID:", auctionDetails.metadataCID);
      console.log("  End time:", auctionDetails.endTime.toString());
      console.log("  Finalized:", auctionDetails.finalized);
      console.log("  Winner index:", auctionDetails.winnerIndex.toString());
      console.log("  Winner address:", auctionDetails.winner);
      
      // Check if metadata CID is empty
      if (!auctionDetails.metadataCID || auctionDetails.metadataCID === "") {
        console.log("WARNING: Metadata CID is empty - this indicates no auction has been created");
      }
    } catch (error) {
      console.log("Could not get auction details:", error.message);
    }
    
    // Try to get current auction data directly
    console.log("\n=== Getting current auction struct ===");
    try {
      const currentAuction = await contract.currentAuction();
      console.log("Current auction struct:");
      console.log("  Metadata CID:", currentAuction.metadataCID);
      console.log("  End time:", currentAuction.endTime.toString());
      console.log("  Finalized:", currentAuction.finalized);
      console.log("  Winner index:", currentAuction.winnerIndex.toString());
      console.log("  Winner address:", currentAuction.winner);
      
      // Check if metadata CID is empty
      if (!currentAuction.metadataCID || currentAuction.metadataCID === "") {
        console.log("WARNING: Metadata CID is empty in currentAuction struct");
      }
    } catch (error) {
      console.log("Could not get current auction struct:", error.message);
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });