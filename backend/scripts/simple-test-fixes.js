// simple-test-fixes.js
// Simple script to test the fixed contract functionality

const { ethers } = require("hardhat");

async function main() {
  console.log("Testing fixed contract functionality...");
  
  // Get accounts
  const [owner, bidder1, bidder2] = await ethers.getSigners();
  console.log("Owner address:", owner.address);
  console.log("Bidder1 address:", bidder1.address);
  console.log("Bidder2 address:", bidder2.address);
  
  // Deploy the fixed contract
  console.log("Deploying fixed contract...");
  const ZepoMINTFHEAuctionSmartFinalize = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalize");
  const auctionContract = await ZepoMINTFHEAuctionSmartFinalize.deploy();
  await auctionContract.deployed();
  console.log("Contract deployed at:", auctionContract.address);
  
  // Initialize the contract
  console.log("Initializing contract...");
  const publicKeyURI = "https://example.com/public-key";
  await auctionContract.initialize(publicKeyURI);
  console.log("Contract initialized");
  
  // Create an auction
  console.log("Creating auction...");
  const duration = 3600; // 1 hour
  const metadataCID = "QmTestCIDForSimpleTest";
  await auctionContract.createAuction(duration, metadataCID);
  console.log("Auction created");
  
  // Submit bids
  console.log("Submitting test bids...");
  
  // Dummy encrypted values for testing
  const dummyEncryptedAmount = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const dummyBidderAddress = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const dummyProof = "0x";
  
  // Owner bid
  await auctionContract.submitBid(
    dummyEncryptedAmount,
    dummyBidderAddress,
    dummyProof,
    dummyProof
  );
  console.log("Owner bid submitted");
  
  // Bidder1 bid
  await auctionContract.connect(bidder1).submitBid(
    dummyEncryptedAmount,
    dummyBidderAddress,
    dummyProof,
    dummyProof
  );
  console.log("Bidder1 bid submitted");
  
  // Bidder2 bid
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
  
  // Get bid count
  const bidCount = await auctionContract.getBidCount();
  console.log("Bid count:", bidCount.toString());
  
  // Finalize auction
  console.log("Finalizing auction...");
  const tx = await auctionContract.smartFinalize();
  const receipt = await tx.wait();
  console.log("Auction finalized in transaction:", receipt.transactionHash);
  
  // Check auction details
  const auctionDetails = await auctionContract.getAuctionDetails();
  console.log("Auction finalized:", auctionDetails.finalized);
  
  // Check winner
  const winnerEncrypted = await auctionContract.winnerEncrypted();
  console.log("Winner encrypted address:", winnerEncrypted);
  
  // Try to mint NFT
  console.log("Attempting to mint NFT...");
  try {
    const mintTx = await auctionContract.mintNFTToWinner(1);
    const mintReceipt = await mintTx.wait();
    console.log("NFT minted in transaction:", mintReceipt.transactionHash);
    console.log("✅ NFT minting successful");
  } catch (error) {
    console.log("Error minting NFT:", error.message);
  }
  
  console.log("\n🎉 Simple test completed!");
  console.log("Contract address:", auctionContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });