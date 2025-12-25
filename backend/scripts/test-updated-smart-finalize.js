// scripts/test-updated-smart-finalize.js
// Script to test the smartFinalize function on the updated fixed contract

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== TESTING UPDATED SMART FINALIZE FUNCTION ===");
  
  try {
    // Get the contract address from the deployment file
    const deploymentFilePath = path.join(__dirname, "..", "deployments", "updated-fixed-contract-deployment.json");
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFilePath, 'utf8'));
    const contractAddress = deploymentInfo.contractAddress;
    
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
      "function smartFinalize() external",
      "function getAuctionDetails() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, bool initialized))",
      "function getBidCount() view returns (uint256)",
      "function hasAuctionEnded() view returns (bool)"
    ];
    
    // Create contract instance with signer
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    
    // Check auction status before finalizing
    console.log("\nChecking auction status before finalizing...");
    const auctionDetails = await contract.getAuctionDetails();
    console.log("✅ Auction Details:");
    console.log("  - Metadata CID:", auctionDetails.metadataCID);
    console.log("  - End Time:", new Date(Number(auctionDetails.endTime) * 1000).toISOString());
    console.log("  - Finalized:", auctionDetails.finalized);
    console.log("  - Initialized:", auctionDetails.initialized);
    
    const hasEnded = await contract.hasAuctionEnded();
    console.log("✅ Auction Has Ended:", hasEnded);
    
    const bidCount = await contract.getBidCount();
    console.log("✅ Bid Count:", bidCount.toString());
    
    // Check preconditions for smartFinalize
    console.log("\nChecking preconditions for smartFinalize...");
    if (!auctionDetails.initialized) {
      console.log("❌ Auction not initialized");
      return;
    }
    
    if (auctionDetails.finalized) {
      console.log("❌ Auction already finalized");
      return;
    }
    
    if (!hasEnded) {
      console.log("❌ Auction not ended yet");
      console.log("  Current time:", new Date().toISOString());
      console.log("  Auction end time:", new Date(Number(auctionDetails.endTime) * 1000).toISOString());
      return;
    }
    
    console.log("✅ All preconditions met for smartFinalize");
    
    // Try to call smartFinalize
    console.log("\nCalling smartFinalize...");
    const tx = await contract.smartFinalize({
      gasLimit: 10000000
    });
    
    console.log("✅ Transaction sent:", tx.hash);
    
    // Wait for the transaction to be mined
    console.log("Waiting for transaction to be mined...");
    const receipt = await tx.wait();
    console.log("✅ Transaction mined in block:", receipt.blockNumber);
    console.log("✅ Transaction status:", receipt.status);
    
    // Check auction status after finalizing
    console.log("\nChecking auction status after finalizing...");
    const updatedAuctionDetails = await contract.getAuctionDetails();
    console.log("✅ Updated Auction Details:");
    console.log("  - Finalized:", updatedAuctionDetails.finalized);
    
    console.log("\n🎉 UPDATED SMART FINALIZE TEST COMPLETE!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Error code:", error.code);
    console.error("Error data:", error.data);
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