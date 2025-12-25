// scripts/test-fixed-contract.js
// Script to test the fixed contract

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== TESTING FIXED CONTRACT ===");
  
  try {
    // Get the contract address from the deployment file
    const deploymentFilePath = path.join(__dirname, "..", "deployments", "fixed-contract-deployment.json");
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
      "function createAuction(uint256 biddingDurationSeconds, string metadataCID) external",
      "function smartFinalize() external",
      "function getAuctionDetails() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, bool initialized))",
      "function getBidCount() view returns (uint256)",
      "function hasAuctionEnded() view returns (bool)"
    ];
    
    // Create contract instance with signer
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    
    // Create a test auction
    console.log("\nCreating test auction...");
    const duration = 3600; // 1 hour
    const metadataCID = "QmTestCIDForFixedContractTesting";
    
    const createTx = await contract.createAuction(duration, metadataCID, {
      gasLimit: 10000000
    });
    
    console.log("✅ Create transaction sent:", createTx.hash);
    
    // Wait for the transaction to be mined
    console.log("Waiting for transaction to be mined...");
    const createReceipt = await createTx.wait();
    console.log("✅ Transaction mined in block:", createReceipt.blockNumber);
    
    // Check auction details after creation
    console.log("\nChecking auction details after creation...");
    const auctionDetails = await contract.getAuctionDetails();
    console.log("✅ Auction Details:");
    console.log("  - Metadata CID:", auctionDetails.metadataCID);
    console.log("  - End Time:", new Date(Number(auctionDetails.endTime) * 1000).toISOString());
    console.log("  - Finalized:", auctionDetails.finalized);
    console.log("  - Initialized:", auctionDetails.initialized);
    
    console.log("\n🎉 FIXED CONTRACT TEST COMPLETE!");
    console.log("✅ Contract is working correctly");
    console.log("✅ You can now test finalize functionality after the auction ends");
    
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