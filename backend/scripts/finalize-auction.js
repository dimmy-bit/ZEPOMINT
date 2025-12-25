// scripts/finalize-auction.js
// Script to finalize the current auction and determine the winner

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== FINALIZING CURRENT AUCTION ===");
  
  try {
    // Get the contract address from the deployment file
    const deploymentFilePath = path.join(__dirname, "..", "deployments", "updated-fixed-contract-deployment.json");
    let contractAddress;
    
    if (fs.existsSync(deploymentFilePath)) {
      const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFilePath, 'utf8'));
      contractAddress = deploymentInfo.contractAddress;
      console.log("Using deployed contract at address:", contractAddress);
    } else {
      // Fallback to the hardcoded address
      contractAddress = "0xa302464338d513F4fe800B69d6C483ef981516f2";
      console.log("Using hardcoded contract address:", contractAddress);
    }
    
    // Get RPC URL and owner private key
    const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
    const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY || process.env.PRIVATE_KEY;
    
    if (!ownerPrivateKey) {
      console.log("❌ No owner private key found. Please set OWNER_PRIVATE_KEY in your .env file");
      process.exit(1);
    }
    
    console.log("Using RPC URL:", rpcUrl);
    
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);
    
    console.log("Owner wallet address:", ownerWallet.address);
    
    // Get the ABI for the contract
    const contractArtifact = require('../artifacts/contracts/ZepoMINTFHEAuctionSmartFinalizeFixed.sol/ZepoMINTFHEAuctionSmartFinalizeFixed.json');
    const abi = contractArtifact.abi;
    
    // Create contract instance
    const ownerContract = new ethers.Contract(contractAddress, abi, ownerWallet);
    
    // Check auction details
    try {
      const auctionDetails = await ownerContract.getAuctionDetails();
      console.log("Current auction details:");
      console.log("- Metadata CID:", auctionDetails.metadataCID);
      console.log("- End time:", new Date(auctionDetails.endTime * 1000).toString());
      console.log("- Finalized:", auctionDetails.finalized);
      console.log("- Initialized:", auctionDetails.initialized);
      
      if (!auctionDetails.initialized) {
        console.log("❌ No auction found");
        process.exit(1);
      }
      
      if (auctionDetails.finalized) {
        console.log("❌ Auction already finalized");
        process.exit(1);
      }
      
      const hasEnded = await ownerContract.hasAuctionEnded();
      console.log("Auction has ended:", hasEnded);
      
      if (!hasEnded) {
        console.log("❌ Auction has not ended yet");
        const currentTime = Math.floor(Date.now() / 1000);
        const timeRemaining = auctionDetails.endTime - currentTime;
        console.log("Time remaining:", timeRemaining, "seconds");
        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Failed to get auction details:", error.message);
      process.exit(1);
    }
    
    // Get bid count before finalizing
    try {
      const bidCount = await ownerContract.getBidCount();
      console.log("Total bids:", bidCount.toString());
    } catch (error) {
      console.error("❌ Failed to get bid count:", error.message);
    }
    
    // Finalize the auction
    console.log("\n=== FINALIZING AUCTION ===");
    
    try {
      const finalizeTx = await ownerContract.smartFinalize();
      const finalizeReceipt = await finalizeTx.wait();
      console.log("✅ Auction finalized successfully");
      console.log("Transaction hash:", finalizeReceipt.hash);
      
      // Listen for events
      const auctionFinalizedFilter = ownerContract.filters.AuctionFinalized();
      const smartFinalizationFilter = ownerContract.filters.SmartFinalization();
      
      const auctionFinalizedEvents = await ownerContract.queryFilter(auctionFinalizedFilter, finalizeReceipt.blockNumber, finalizeReceipt.blockNumber);
      const smartFinalizationEvents = await ownerContract.queryFilter(smartFinalizationFilter, finalizeReceipt.blockNumber, finalizeReceipt.blockNumber);
      
      console.log("AuctionFinalized events:", auctionFinalizedEvents.length);
      console.log("SmartFinalization events:", smartFinalizationEvents.length);
      
      if (auctionFinalizedEvents.length > 0) {
        const event = auctionFinalizedEvents[0];
        console.log("Winner address:", event.args.winner);
        console.log("Winning bid encrypted:", event.args.encryptedPrice);
        console.log("Winner index:", event.args.winnerIndex.toString());
      }
      
      if (smartFinalizationEvents.length > 0) {
        const event = smartFinalizationEvents[0];
        console.log("Finalization reason:", event.args.reason);
        console.log("Bid count:", event.args.bidCount.toString());
      }
    } catch (error) {
      console.error("❌ Failed to finalize auction:", error.message);
      console.error("Error stack:", error.stack);
      
      // Check if it's a revert error and try to get more details
      if (error.message.includes('revert')) {
        console.log("This might be due to FHE operations failing in the contract.");
        console.log("The contract expects properly encrypted bid data.");
      }
      
      process.exit(1);
    }
    
    // Verify results
    console.log("\n=== VERIFYING RESULTS ===");
    
    try {
      const auctionDetails = await ownerContract.getAuctionDetails();
      console.log("Auction finalized:", auctionDetails.finalized);
      
      const bidCount = await ownerContract.getBidCount();
      console.log("Total bids:", bidCount.toString());
      
      // If auction was finalized, check winner information
      if (auctionDetails.finalized) {
        console.log("✅ Auction was successfully finalized");
        
        // Try to get winner information
        try {
          const winnerEncrypted = await ownerContract.winnerEncrypted();
          const winningBidEncrypted = await ownerContract.winningBidEncrypted();
          const winningBidIndex = await ownerContract.winningBidIndex();
          
          console.log("Winner encrypted:", winnerEncrypted);
          console.log("Winning bid encrypted:", winningBidEncrypted);
          console.log("Winning bid index:", winningBidIndex.toString());
        } catch (error) {
          console.error("❌ Failed to get winner information:", error.message);
        }
      } else {
        console.log("⚠️  Auction was not finalized");
      }
    } catch (error) {
      console.error("❌ Failed to verify results:", error.message);
    }
    
    console.log("\n🎉 AUCTION FINALIZATION COMPLETE!");
    
  } catch (error) {
    console.error("❌ Finalization failed:", error.message);
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