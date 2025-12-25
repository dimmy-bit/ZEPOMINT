// test-winner-determination-simple.js
// Simplified script to test the winner determination logic in the updated contract

const { ethers } = require("hardhat");

async function main() {
  console.log("Testing winner determination logic (simplified)...");
  
  // Get accounts
  const [owner, bidder1, bidder2] = await ethers.getSigners();
  console.log("Owner address:", owner.address);
  console.log("Bidder1 address:", bidder1.address);
  console.log("Bidder2 address:", bidder2.address);
  
  // Deploy the contract
  console.log("Deploying contract...");
  const ZepoMINTFHEAuctionSmartFinalize = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalize");
  const auctionContract = await ZepoMINTFHEAuctionSmartFinalize.deploy();
  await auctionContract.deployed();
  console.log("Contract deployed to:", auctionContract.address);
  
  // Initialize the contract
  console.log("Initializing contract...");
  const publicKeyURI = "https://example.com/public-key";
  await auctionContract.initialize(publicKeyURI);
  console.log("Contract initialized");
  
  // Create an auction
  console.log("Creating auction...");
  const duration = 3600; // 1 hour
  const metadataCID = "QmTestCIDForTesting";
  await auctionContract.createAuction(duration, metadataCID);
  console.log("Auction created");
  
  // Test Case 1: No bids
  console.log("\n=== Test Case 1: No bids ===");
  // Advance time to end the auction
  await ethers.provider.send("evm_increaseTime", [duration + 1]);
  await ethers.provider.send("evm_mine");
  
  // Finalize auction
  console.log("Finalizing auction with no bids...");
  await auctionContract.smartFinalize();
  console.log("Auction finalized");
  
  // Check that auction is finalized but no winner
  const auctionDetails1 = await auctionContract.getAuctionDetails();
  console.log("Auction finalized:", auctionDetails1.finalized);
  
  const winnerEncrypted1 = await auctionContract.winnerEncrypted();
  const isNoWinner = winnerEncrypted1 === "0x0000000000000000000000000000000000000000000000000000000000000000";
  console.log("No winner case:", isNoWinner ? "✅ PASSED" : "❌ FAILED");
  
  // Create a new auction for next test
  console.log("\nCreating new auction for next test...");
  await ethers.provider.send("evm_increaseTime", [3600]); // Wait 1 hour
  await ethers.provider.send("evm_mine");
  await auctionContract.createAuction(duration, metadataCID + "2");
  
  // Test Case 2: Single non-owner bid
  console.log("\n=== Test Case 2: Single non-owner bid ===");
  // Submit one bid from bidder1
  // We'll use dummy values since we're not testing encryption here
  const dummyEncryptedAmount = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const dummyBidderAddress = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const dummyProof = "0x";
  
  await auctionContract.connect(bidder1).submitBid(
    dummyEncryptedAmount,
    dummyBidderAddress,
    dummyProof,
    dummyProof
  );
  console.log("Bidder1 bid submitted");
  
  // Advance time to end the auction
  await ethers.provider.send("evm_increaseTime", [duration + 1]);
  await ethers.provider.send("evm_mine");
  
  // Finalize auction
  console.log("Finalizing auction with single non-owner bid...");
  await auctionContract.smartFinalize();
  console.log("Auction finalized");
  
  // Check that auction is finalized and winner is determined
  const auctionDetails2 = await auctionContract.getAuctionDetails();
  console.log("Auction finalized:", auctionDetails2.finalized);
  
  const winnerEncrypted2 = await auctionContract.winnerEncrypted();
  const isWinnerDetermined = winnerEncrypted2 !== "0x0000000000000000000000000000000000000000000000000000000000000000";
  console.log("Single non-owner bid case:", isWinnerDetermined ? "✅ PASSED" : "❌ FAILED");
  
  // Create a new auction for next test
  console.log("\nCreating new auction for next test...");
  await ethers.provider.send("evm_increaseTime", [3600]); // Wait 1 hour
  await ethers.provider.send("evm_mine");
  await auctionContract.createAuction(duration, metadataCID + "3");
  
  // Test Case 3: Single owner bid
  console.log("\n=== Test Case 3: Single owner bid ===");
  // Submit one bid from owner
  await auctionContract.submitBid(
    dummyEncryptedAmount,
    dummyBidderAddress,
    dummyProof,
    dummyProof
  );
  console.log("Owner bid submitted");
  
  // Advance time to end the auction
  await ethers.provider.send("evm_increaseTime", [duration + 1]);
  await ethers.provider.send("evm_mine");
  
  // Finalize auction
  console.log("Finalizing auction with single owner bid...");
  await auctionContract.smartFinalize();
  console.log("Auction finalized");
  
  // Check that auction is finalized but no winner
  const auctionDetails3 = await auctionContract.getAuctionDetails();
  console.log("Auction finalized:", auctionDetails3.finalized);
  
  const winnerEncrypted3 = await auctionContract.winnerEncrypted();
  const isNoWinnerOwnerBid = winnerEncrypted3 === "0x0000000000000000000000000000000000000000000000000000000000000000";
  console.log("Single owner bid case:", isNoWinnerOwnerBid ? "✅ PASSED" : "❌ FAILED");
  
  console.log("\n🎉 All tests completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });