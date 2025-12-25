// scripts/test-auction-workflow.js
// Script to test the complete auction workflow

require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  console.log("=== TESTING COMPLETE AUCTION WORKFLOW ===");
  
  try {
    // Get the correct contract address
    const contractAddress = "0x21095aedcc0205cB33042727698b8be984e4062a";
    
    console.log("Using contract at address:", contractAddress);
    
    // Get RPC URL and private key
    const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      console.log("❌ No private key found. Please set PRIVATE_KEY in your .env file");
      process.exit(1);
    }
    
    console.log("Using RPC URL:", rpcUrl);
    
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log("Using wallet address:", wallet.address);
    
    // Get the ABI for the functions we need
    const abi = [
      "function getAuctionDetails() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, bool initialized))",
      "function getBidCount() view returns (uint256)",
      "function hasAuctionEnded() view returns (bool)",
      "function smartFinalize() external onlyOwner",
      "function mintNFTToWinner(uint256) external"
    ];
    
    // Create contract instance with signer
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    
    // Check current auction status
    console.log("\nChecking current auction status...");
    const auctionDetails = await contract.getAuctionDetails();
    console.log("✅ Auction Details:");
    console.log("  - Metadata CID:", auctionDetails.metadataCID);
    console.log("  - End Time:", new Date(Number(auctionDetails.endTime) * 1000).toISOString());
    console.log("  - Finalized:", auctionDetails.finalized);
    console.log("  - Initialized:", auctionDetails.initialized);
    
    const hasEnded = await contract.hasAuctionEnded();
    console.log("  - Has Ended:", hasEnded);
    
    const bidCount = await contract.getBidCount();
    console.log("  - Bid Count:", bidCount.toString());
    
    // If auction has ended and is not finalized, finalize it
    if (hasEnded && !auctionDetails.finalized) {
      console.log("\nFinalizing auction...");
      const tx = await contract.smartFinalize({
        gasLimit: 10000000
      });
      console.log("✅ Finalize transaction sent:", tx.hash);
      
      // Wait for the transaction to be mined
      console.log("Waiting for transaction to be mined...");
      const receipt = await tx.wait();
      console.log("✅ Transaction mined in block:", receipt.blockNumber);
      
      // Check auction details again
      console.log("\nChecking auction status after finalization...");
      const updatedAuctionDetails = await contract.getAuctionDetails();
      console.log("✅ Updated Auction Details:");
      console.log("  - Finalized:", updatedAuctionDetails.finalized);
    } else if (auctionDetails.finalized) {
      console.log("\nAuction is already finalized");
    } else {
      console.log("\nAuction is still active and not ready for finalization");
    }
    
    console.log("\n🎉 AUCTION WORKFLOW TEST COMPLETE!");
    
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