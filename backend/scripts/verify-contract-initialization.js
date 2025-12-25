// scripts/verify-contract-initialization.js
// Script to verify that the contract is properly initialized

require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  console.log("=== VERIFYING CONTRACT INITIALIZATION ===");
  
  try {
    // Get the contract address from the error logs
    const contractAddress = "0x21095aedcc0205cB33042727698b8be984e4062a";
    
    console.log("Checking contract at address:", contractAddress);
    
    // Get RPC URL
    const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
    console.log("Using RPC URL:", rpcUrl);
    
    // Create provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Get the ABI (we'll use a minimal ABI for the functions we need to check)
    const abi = [
      "function getPublicKeyURI() view returns (string)",
      "function getAuctionDetails() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, bool initialized))",
      "function auctionInitialized() view returns (bool)"
    ];
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    // Check if contract is responding
    console.log("\nChecking contract status...");
    
    try {
      const publicKeyURI = await contract.getPublicKeyURI();
      console.log("✅ Public Key URI:", publicKeyURI);
    } catch (error) {
      console.log("❌ Error getting public key URI:", error.message);
    }
    
    try {
      const auctionDetails = await contract.getAuctionDetails();
      console.log("✅ Auction Details:");
      console.log("  - Metadata CID:", auctionDetails.metadataCID);
      console.log("  - End Time:", auctionDetails.endTime.toString());
      console.log("  - Finalized:", auctionDetails.finalized);
      console.log("  - Initialized:", auctionDetails.initialized);
    } catch (error) {
      console.log("❌ Error getting auction details:", error.message);
    }
    
    try {
      const isAuctionInitialized = await contract.auctionInitialized();
      console.log("✅ Auction Initialized:", isAuctionInitialized);
    } catch (error) {
      console.log("❌ Error checking auction initialization:", error.message);
    }
    
    console.log("\n🎉 CONTRACT VERIFICATION COMPLETE!");
    
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
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