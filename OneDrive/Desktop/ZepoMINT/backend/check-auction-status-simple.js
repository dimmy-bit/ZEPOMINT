// check-auction-status-simple.js
const { ethers } = require('ethers');

async function main() {
  // Configuration
  const contractAddress = "0x7317A3152B16D1d2d5A9f0856233c739B5aA111e";
  const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/JkwlX2jl-1k1wTZQPFHuC-YYuLcoldZk");
  
  // Contract ABI - simplified version
  const abi = [
    "function currentAuction() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, uint256 winnerIndex, address winner))",
    "function auctionInitialized() view returns (bool)",
    "function getBidCount() view returns (uint256)",
    "function hasAuctionEnded() view returns (bool)",
    "function getAuctionDetails() view returns (string metadataCID, uint256 endTime, bool finalized, uint256 winnerIndex, address winner)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, provider);
  
  try {
    console.log("Checking auction status for contract:", contractAddress);
    
    // Check if auction is initialized
    try {
      const isInitialized = await contract.auctionInitialized();
      console.log("Auction initialized:", isInitialized);
    } catch (error) {
      console.log("Could not check auction initialization:", error.message);
    }
    
    // Check if auction has ended
    try {
      const hasEnded = await contract.hasAuctionEnded();
      console.log("Auction has ended:", hasEnded);
    } catch (error) {
      console.log("Could not check if auction has ended:", error.message);
    }
    
    // Get bid count
    try {
      const bidCount = await contract.getBidCount();
      console.log("Bid count:", bidCount.toString());
    } catch (error) {
      console.log("Could not get bid count:", error.message);
    }
    
    // Try to get auction details
    try {
      console.log("Attempting to fetch auction details...");
      const auction = await contract.getAuctionDetails();
      console.log("Auction details:", auction);
      
      if (auction && auction.metadataCID) {
        console.log("Auction metadata CID:", auction.metadataCID);
        console.log("Auction end time:", new Date(parseInt(auction.endTime.toString()) * 1000).toLocaleString());
        console.log("Auction finalized:", auction.finalized);
      } else {
        console.log("No active auction found");
      }
    } catch (error) {
      console.log("Could not fetch auction details:", error.message);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main().catch(console.error);