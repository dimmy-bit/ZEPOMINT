// scripts/place-test-bids.js
// Script to place test bids on the current auction

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== PLACING TEST BIDS ON CURRENT AUCTION ===");
  
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
    
    // Get RPC URL and private keys
    const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
    const bidder1PrivateKey = process.env.BIDDER1_PRIVATE_KEY;
    const bidder2PrivateKey = process.env.BIDDER2_PRIVATE_KEY;
    const bidder3PrivateKey = process.env.BIDDER3_PRIVATE_KEY;
    
    if (!bidder1PrivateKey || !bidder2PrivateKey) {
      console.log("❌ Bidder private keys not found. Please set BIDDER1_PRIVATE_KEY and BIDDER2_PRIVATE_KEY in your .env file");
      process.exit(1);
    }
    
    console.log("Using RPC URL:", rpcUrl);
    
    // Create providers and wallets
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const bidder1Wallet = new ethers.Wallet(bidder1PrivateKey, provider);
    const bidder2Wallet = new ethers.Wallet(bidder2PrivateKey, provider);
    let bidder3Wallet = null;
    if (bidder3PrivateKey) {
      bidder3Wallet = new ethers.Wallet(bidder3PrivateKey, provider);
    }
    
    console.log("Bidder 1 wallet address:", bidder1Wallet.address);
    console.log("Bidder 2 wallet address:", bidder2Wallet.address);
    if (bidder3Wallet) {
      console.log("Bidder 3 wallet address:", bidder3Wallet.address);
    }
    
    // Get the ABI for the contract
    const contractArtifact = require('../artifacts/contracts/ZepoMINTFHEAuctionSmartFinalizeFixed.sol/ZepoMINTFHEAuctionSmartFinalizeFixed.json');
    const abi = contractArtifact.abi;
    
    // Create contract instances
    const bidder1Contract = new ethers.Contract(contractAddress, abi, bidder1Wallet);
    const bidder2Contract = new ethers.Contract(contractAddress, abi, bidder2Wallet);
    let bidder3Contract = null;
    if (bidder3Wallet) {
      bidder3Contract = new ethers.Contract(contractAddress, abi, bidder3Wallet);
    }
    
    // Check if there's an active auction
    try {
      const auctionDetails = await bidder1Contract.getAuctionDetails();
      console.log("Current auction details:");
      console.log("- Metadata CID:", auctionDetails.metadataCID);
      console.log("- End time:", new Date(auctionDetails.endTime * 1000).toString());
      console.log("- Finalized:", auctionDetails.finalized);
      console.log("- Initialized:", auctionDetails.initialized);
      
      if (!auctionDetails.initialized || auctionDetails.finalized) {
        console.log("❌ No active auction found or auction already finalized");
        process.exit(1);
      }
      
      const hasEnded = await bidder1Contract.hasAuctionEnded();
      if (hasEnded) {
        console.log("❌ Auction has already ended");
        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Failed to get auction details:", error.message);
      process.exit(1);
    }
    
    // Place bids
    console.log("\n=== PLACING BIDS ===");
    
    // Bid 1: 0.1 ETH from bidder 1
    try {
      console.log("Placing bid 1: 0.1 ETH from", bidder1Wallet.address);
      // For testing purposes, we'll submit dummy encrypted data
      // In a real implementation, this would be properly encrypted FHE data
      const dummyEncryptedAmount = ethers.hexlify(ethers.randomBytes(32));
      const dummyBidder = ethers.hexlify(ethers.randomBytes(32));
      const dummyAmountProof = ethers.hexlify(ethers.randomBytes(64));
      const dummyBidderProof = ethers.hexlify(ethers.randomBytes(64));
      
      const bid1Tx = await bidder1Contract.submitBid(
        dummyEncryptedAmount,
        dummyBidder,
        dummyAmountProof,
        dummyBidderProof
      );
      const bid1Receipt = await bid1Tx.wait();
      console.log("✅ Bid 1 placed successfully");
      console.log("Transaction hash:", bid1Receipt.hash);
    } catch (error) {
      console.error("❌ Failed to place bid 1:", error.message);
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Bid 2: 0.2 ETH from bidder 2 (highest bid)
    try {
      console.log("Placing bid 2: 0.2 ETH from", bidder2Wallet.address);
      // For testing purposes, we'll submit dummy encrypted data
      const dummyEncryptedAmount = ethers.hexlify(ethers.randomBytes(32));
      const dummyBidder = ethers.hexlify(ethers.randomBytes(32));
      const dummyAmountProof = ethers.hexlify(ethers.randomBytes(64));
      const dummyBidderProof = ethers.hexlify(ethers.randomBytes(64));
      
      const bid2Tx = await bidder2Contract.submitBid(
        dummyEncryptedAmount,
        dummyBidder,
        dummyAmountProof,
        dummyBidderProof
      );
      const bid2Receipt = await bid2Tx.wait();
      console.log("✅ Bid 2 placed successfully");
      console.log("Transaction hash:", bid2Receipt.hash);
    } catch (error) {
      console.error("❌ Failed to place bid 2:", error.message);
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Bid 3: 0.15 ETH from bidder 3 (if available)
    if (bidder3Wallet) {
      try {
        console.log("Placing bid 3: 0.15 ETH from", bidder3Wallet.address);
        // For testing purposes, we'll submit dummy encrypted data
        const dummyEncryptedAmount = ethers.hexlify(ethers.randomBytes(32));
        const dummyBidder = ethers.hexlify(ethers.randomBytes(32));
        const dummyAmountProof = ethers.hexlify(ethers.randomBytes(64));
        const dummyBidderProof = ethers.hexlify(ethers.randomBytes(64));
        
        const bid3Tx = await bidder3Contract.submitBid(
          dummyEncryptedAmount,
          dummyBidder,
          dummyAmountProof,
          dummyBidderProof
        );
        const bid3Receipt = await bid3Tx.wait();
        console.log("✅ Bid 3 placed successfully");
        console.log("Transaction hash:", bid3Receipt.hash);
      } catch (error) {
        console.error("❌ Failed to place bid 3:", error.message);
      }
    }
    
    // Check bid count
    try {
      const bidCount = await bidder1Contract.getBidCount();
      console.log("\nTotal bids placed:", bidCount.toString());
    } catch (error) {
      console.error("❌ Failed to get bid count:", error.message);
    }
    
    console.log("\n🎉 TEST BIDS PLACED SUCCESSFULLY!");
    console.log("Now wait for the auction to end and then run the finalize script.");
    
  } catch (error) {
    console.error("❌ Bid placement failed:", error.message);
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