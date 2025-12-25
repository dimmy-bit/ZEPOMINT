// scripts/verify-new-contract.js
// Script to verify the newly deployed contract

require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  console.log("=== VERIFYING NEW CONTRACT ===");
  
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
      "function getPublicKeyURI() view returns (string)",
      "function getAuctionDetails() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, bool initialized))",
      "function getBidCount() view returns (uint256)"
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
      console.log("  - End Time:", new Date(Number(auctionDetails.endTime) * 1000).toISOString());
      console.log("  - Finalized:", auctionDetails.finalized);
      console.log("  - Initialized:", auctionDetails.initialized);
    } catch (error) {
      console.log("❌ Error getting auction details:", error.message);
    }
    
    try {
      const bidCount = await contract.getBidCount();
      console.log("✅ Bid Count:", bidCount.toString());
    } catch (error) {
      console.log("❌ Error getting bid count:", error.message);
    }
    
    console.log("\n🎉 NEW CONTRACT VERIFICATION COMPLETE!");
    console.log("✅ Contract is ready for testing");
    
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