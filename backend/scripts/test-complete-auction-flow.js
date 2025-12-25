// scripts/test-complete-auction-flow.js
// Script to test the complete auction flow with multiple bids and proper finalization

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== TESTING COMPLETE AUCTION FLOW ===");
  
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
    const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY || process.env.PRIVATE_KEY;
    const bidder1PrivateKey = process.env.BIDDER1_PRIVATE_KEY;
    const bidder2PrivateKey = process.env.BIDDER2_PRIVATE_KEY;
    
    if (!ownerPrivateKey) {
      console.log("❌ No owner private key found. Please set OWNER_PRIVATE_KEY in your .env file");
      process.exit(1);
    }
    
    if (!bidder1PrivateKey || !bidder2PrivateKey) {
      console.log("❌ Bidder private keys not found. Please set BIDDER1_PRIVATE_KEY and BIDDER2_PRIVATE_KEY in your .env file");
      process.exit(1);
    }
    
    console.log("Using RPC URL:", rpcUrl);
    
    // Create providers and wallets
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);
    const bidder1Wallet = new ethers.Wallet(bidder1PrivateKey, provider);
    const bidder2Wallet = new ethers.Wallet(bidder2PrivateKey, provider);
    
    console.log("Owner wallet address:", ownerWallet.address);
    console.log("Bidder 1 wallet address:", bidder1Wallet.address);
    console.log("Bidder 2 wallet address:", bidder2Wallet.address);
    
    // Get the ABI for the contract
    const contractArtifact = require('../artifacts/contracts/ZepoMINTFHEAuctionSmartFinalizeFixed.sol/ZepoMINTFHEAuctionSmartFinalizeFixed.json');
    const abi = contractArtifact.abi;
    
    // Create contract instances
    const ownerContract = new ethers.Contract(contractAddress, abi, ownerWallet);
    const bidder1Contract = new ethers.Contract(contractAddress, abi, bidder1Wallet);
    const bidder2Contract = new ethers.Contract(contractAddress, abi, bidder2Wallet);
    
    // Step 1: Create an auction (5 minutes duration)
    console.log("\n=== STEP 1: Creating Auction ===");
    const auctionDuration = 300; // 5 minutes
    const metadataCID = "Qmeqz1z76iWZeFJugYiu1rNqbZUmFfV4wq6xkD63VFwma9";
    
    try {
      const createTx = await ownerContract.createAuction(auctionDuration, metadataCID);
      const createReceipt = await createTx.wait();
      console.log("✅ Auction created successfully");
      console.log("Transaction hash:", createReceipt.hash);
    } catch (error) {
      console.error("❌ Failed to create auction:", error.message);
      process.exit(1);
    }
    
    // Wait a moment for the transaction to propagate
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 2: Place bids from different wallets
    console.log("\n=== STEP 2: Placing Bids ===");
    
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
    
    // Bid 3: 0.15 ETH from owner (to test multiple bids)
    try {
      console.log("Placing bid 3: 0.15 ETH from", ownerWallet.address);
      // For testing purposes, we'll submit dummy encrypted data
      const dummyEncryptedAmount = ethers.hexlify(ethers.randomBytes(32));
      const dummyBidder = ethers.hexlify(ethers.randomBytes(32));
      const dummyAmountProof = ethers.hexlify(ethers.randomBytes(64));
      const dummyBidderProof = ethers.hexlify(ethers.randomBytes(64));
      
      const bid3Tx = await ownerContract.submitBid(
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
    
    // Step 3: Wait for auction to end
    console.log("\n=== STEP 3: Waiting for Auction to End ===");
    console.log("Waiting for 5 minutes for auction to end...");
    
    // Check auction details
    try {
      const auctionDetails = await ownerContract.getAuctionDetails();
      console.log("Auction end time:", new Date(auctionDetails.endTime * 1000).toString());
      console.log("Current time:", new Date().toString());
      
      // Get bid count
      const bidCount = await ownerContract.getBidCount();
      console.log("Total bids placed:", bidCount.toString());
    } catch (error) {
      console.error("❌ Failed to get auction details:", error.message);
    }
    
    // Wait for auction to end (5 minutes + buffer)
    await new Promise(resolve => setTimeout(resolve, 330000)); // 5.5 minutes
    
    // Step 4: Finalize the auction
    console.log("\n=== STEP 4: Finalizing Auction ===");
    
    try {
      // Check if auction has ended
      const hasEnded = await ownerContract.hasAuctionEnded();
      console.log("Auction has ended:", hasEnded);
      
      if (hasEnded) {
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
      } else {
        console.log("❌ Auction has not ended yet, cannot finalize");
      }
    } catch (error) {
      console.error("❌ Failed to finalize auction:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // Step 5: Verify results
    console.log("\n=== STEP 5: Verifying Results ===");
    
    try {
      const auctionDetails = await ownerContract.getAuctionDetails();
      console.log("Auction finalized:", auctionDetails.finalized);
      
      const bidCount = await ownerContract.getBidCount();
      console.log("Total bids:", bidCount.toString());
      
      // Check if we have the expected number of bids
      if (bidCount.toString() === "3") {
        console.log("✅ All 3 bids were recorded correctly");
      } else {
        console.log("⚠️  Expected 3 bids, got", bidCount.toString());
      }
      
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
    
    console.log("\n🎉 COMPLETE AUCTION FLOW TEST FINISHED!");
    
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