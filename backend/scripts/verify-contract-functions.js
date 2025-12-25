// scripts/verify-contract-functions.js
// Script to verify that the contract functions work correctly

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== VERIFYING CONTRACT FUNCTIONS ===");
  
  try {
    // Get the deployed contract address
    const deploymentFilePath = path.join(__dirname, "..", "deployments", "complete-contract-deployment.json");
    let contractAddress;
    
    if (fs.existsSync(deploymentFilePath)) {
      const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFilePath, 'utf8'));
      contractAddress = deploymentInfo.contractAddress;
      console.log("Using deployed contract at address:", contractAddress);
    } else {
      console.log("❌ Deployment file not found");
      process.exit(1);
    }
    
    // Get RPC URL and private keys
    const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
    const ownerPrivateKey = process.env.PRIVATE_KEY || "0xb57e1b6cbbed376ed8d61d93c4eb052c1aeb365023a429e093b14c9b033b4060";
    
    console.log("Using RPC URL:", rpcUrl);
    
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);
    
    console.log("Owner wallet address:", ownerWallet.address);
    
    // Get the ABI for the contract
    const contractArtifact = require('../artifacts/contracts/ZepoMINTFHEAuctionComplete.sol/ZepoMINTFHEAuctionComplete.json');
    const abi = contractArtifact.abi;
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, abi, ownerWallet);
    
    // Test 1: Check if contract is initialized
    console.log("\n=== TEST 1: Checking Contract Initialization ===");
    try {
      const publicKeyURI = await contract.getPublicKeyURI();
      console.log("✅ Contract is initialized");
      console.log("Public Key URI:", publicKeyURI);
    } catch (error) {
      console.error("❌ Failed to check contract initialization:", error.message);
    }
    
    // Test 2: Create an auction
    console.log("\n=== TEST 2: Creating Auction ===");
    try {
      const auctionDuration = 300; // 5 minutes
      const metadataCID = "QmTest1234567890abcdefghijklmnopqrstuvwxyz";
      
      const createTx = await contract.createAuction(auctionDuration, metadataCID);
      const createReceipt = await createTx.wait();
      console.log("✅ Auction created successfully");
      console.log("Transaction hash:", createReceipt.hash);
    } catch (error) {
      console.error("❌ Failed to create auction:", error.message);
      return;
    }
    
    // Wait a moment for the transaction to propagate
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 3: Check auction details
    console.log("\n=== TEST 3: Checking Auction Details ===");
    try {
      const auctionDetails = await contract.getAuctionDetails();
      console.log("✅ Got auction details");
      console.log("Metadata CID:", auctionDetails.metadataCID);
      console.log("End time:", auctionDetails.endTime.toString());
      console.log("Finalized:", auctionDetails.finalized);
      console.log("Initialized:", auctionDetails.initialized);
    } catch (error) {
      console.error("❌ Failed to get auction details:", error.message);
    }
    
    // Test 4: Check if auction has ended
    console.log("\n=== TEST 4: Checking Auction End Status ===");
    try {
      const hasEnded = await contract.hasAuctionEnded();
      console.log("✅ Checked auction end status");
      console.log("Auction has ended:", hasEnded);
    } catch (error) {
      console.error("❌ Failed to check auction end status:", error.message);
    }
    
    // Test 5: Check bid count (should be 0)
    console.log("\n=== TEST 5: Checking Bid Count ===");
    try {
      const bidCount = await contract.getBidCount();
      console.log("✅ Got bid count");
      console.log("Bid count:", bidCount.toString());
    } catch (error) {
      console.error("❌ Failed to get bid count:", error.message);
    }
    
    // Test 6: Try to finalize auction early (should fail)
    console.log("\n=== TEST 6: Trying to Finalize Auction Early ===");
    try {
      const finalizeTx = await contract.smartFinalize();
      await finalizeTx.wait();
      console.log("⚠️  Unexpectedly finalized auction early");
    } catch (error) {
      if (error.message.includes("Auction not ended")) {
        console.log("✅ Correctly prevented early finalization");
      } else {
        console.error("❌ Unexpected error when finalizing early:", error.message);
      }
    }
    
    console.log("\n🎉 CONTRACT FUNCTION VERIFICATION COMPLETE!");
    
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