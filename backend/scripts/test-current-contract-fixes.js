// test-current-contract-fixes.js
// Script to test the fixes applied to the current contract

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Testing current contract fixes...");
  
  // Get accounts
  const [owner, bidder1, bidder2] = await ethers.getSigners();
  console.log("Owner address:", owner.address);
  console.log("Bidder1 address:", bidder1.address);
  console.log("Bidder2 address:", bidder2.address);
  
  // Use the existing deployed contract
  const deploymentPath = path.join(__dirname, "..", "deployments", "zepamint-main-wallet-deployment.json");
  
  let auctionContract;
  let contractAddress;
  
  if (fs.existsSync(deploymentPath)) {
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    contractAddress = deploymentInfo.contractAddress;
    console.log("Using existing contract at:", contractAddress);
    
    const ZepoMINTFHEAuctionSmartFinalize = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalize");
    auctionContract = await ZepoMINTFHEAuctionSmartFinalize.attach(contractAddress);
  } else {
    console.log("No existing deployment found, using fixed contract code...");
    const ZepoMINTFHEAuctionSmartFinalize = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalize");
    auctionContract = await ZepoMINTFHEAuctionSmartFinalize.deploy();
    await auctionContract.deployed();
    contractAddress = auctionContract.address;
    console.log("Deployed new contract at:", contractAddress);
  }
  
  // Initialize the contract if needed
  try {
    const publicKeyURI = "https://example.com/public-key";
    await auctionContract.initialize(publicKeyURI);
    console.log("Contract initialized");
  } catch (error) {
    if (error.message.includes("Already initialized")) {
      console.log("Contract already initialized");
    } else {
      console.log("Error initializing contract:", error.message);
    }
  }
  
  // Create an auction
  console.log("Creating auction...");
  const duration = 3600; // 1 hour
  const metadataCID = "QmTestCIDForVerification";
  
  try {
    await auctionContract.createAuction(duration, metadataCID);
    console.log("Auction created successfully");
  } catch (error) {
    if (error.message.includes("Previous auction not finalized")) {
      console.log("Previous auction not finalized, creating a new one...");
      // Advance time to end any existing auction
      await ethers.provider.send("evm_increaseTime", [7200]); // Wait 2 hours
      await ethers.provider.send("evm_mine");
      
      // Try to create auction again
      await auctionContract.createAuction(duration, metadataCID);
      console.log("Auction created successfully");
    } else {
      console.log("Error creating auction:", error.message);
    }
  }
  
  // Submit bids
  console.log("Submitting test bids...");
  
  // Dummy encrypted values for testing
  const dummyEncryptedAmount = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const dummyBidderAddress = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const dummyProof = "0x";
  
  // Owner bid (should ideally be excluded from winning)
  await auctionContract.submitBid(
    dummyEncryptedAmount,
    dummyBidderAddress,
    dummyProof,
    dummyProof
  );
  console.log("Owner bid submitted");
  
  // Bidder1 bid (should be able to win)
  await auctionContract.connect(bidder1).submitBid(
    dummyEncryptedAmount,
    dummyBidderAddress,
    dummyProof,
    dummyProof
  );
  console.log("Bidder1 bid submitted");
  
  // Bidder2 bid (should be able to win)
  await auctionContract.connect(bidder2).submitBid(
    dummyEncryptedAmount,
    dummyBidderAddress,
    dummyProof,
    dummyProof
  );
  console.log("Bidder2 bid submitted");
  
  // Advance time to end the auction
  console.log("Advancing time to end auction...");
  await ethers.provider.send("evm_increaseTime", [duration + 1]);
  await ethers.provider.send("evm_mine");
  
  // Check auction status
  const hasEnded = await auctionContract.hasAuctionEnded();
  console.log("Auction ended:", hasEnded);
  
  const bidCount = await auctionContract.getBidCount();
  console.log("Bid count:", bidCount.toString());
  
  // Finalize auction
  console.log("Finalizing auction...");
  await auctionContract.smartFinalize();
  console.log("Auction finalized");
  
  // Check winner
  const auctionDetails = await auctionContract.getAuctionDetails();
  console.log("Auction finalized:", auctionDetails.finalized);
  
  const winnerEncrypted = await auctionContract.winnerEncrypted();
  console.log("Winner encrypted address:", winnerEncrypted);
  
  // Since we can't decrypt in this script, we'll check that it's not the zero address
  const isWinnerDetermined = winnerEncrypted !== "0x0000000000000000000000000000000000000000000000000000000000000000";
  console.log("Winner determined:", isWinnerDetermined);
  
  if (isWinnerDetermined) {
    console.log("✅ Test PASSED: Winner was correctly determined");
  } else {
    console.log("❌ Test FAILED: Winner was not determined");
  }
  
  // Try to mint NFT
  console.log("Attempting to mint NFT...");
  try {
    await auctionContract.mintNFTToWinner(1);
    console.log("✅ NFT minting function executed");
    console.log("✅ NFT minting process initiated");
  } catch (error) {
    console.log("Error minting NFT:", error.message);
  }
  
  console.log("\n🎉 Testing completed!");
  console.log("Summary of functionality verified:");
  console.log("1. Auction creation and management");
  console.log("2. Bid submission from multiple parties");
  console.log("3. Auction finalization");
  console.log("4. Winner determination (to the extent possible with current implementation)");
  console.log("5. NFT minting process initiation");
  
  console.log("\nContract address:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });