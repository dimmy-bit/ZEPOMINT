// create-test-auction.js
// Script to create a test auction
const { ethers } = require("hardhat");

async function main() {
  // Get the deployed contract address
  const fs = require("fs");
  const path = require("path");
  
  const deploymentFilePath = path.join(__dirname, "..", "deployments", "your-private-key-deployment.json");
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFilePath, "utf8"));
  
  const contractAddress = deploymentInfo.contractAddress;
  console.log("Creating auction on contract at address:", contractAddress);
  
  // Get the contract factory and attach to deployed contract
  const ZepoMINTFHEAuction = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalize");
  const contract = await ZepoMINTFHEAuction.attach(contractAddress);
  
  // Get the owner account (first account)
  const [owner] = await ethers.getSigners();
  console.log("Owner account:", owner.address);
  
  // Create a test auction
  const duration = 3600; // 1 hour in seconds
  const metadataCID = "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR"; // Test CID
  
  console.log("Creating auction with:");
  console.log("  Duration:", duration, "seconds");
  console.log("  Metadata CID:", metadataCID);
  
  try {
    const tx = await contract.connect(owner).createAuction(duration, metadataCID);
    await tx.wait();
    console.log("Auction created successfully!");
    
    // Verify auction details
    const auctionDetails = await contract.getAuctionDetails();
    console.log("Auction details:");
    console.log("  Metadata CID:", auctionDetails.metadataCID);
    console.log("  End time:", auctionDetails.endTime.toString());
    console.log("  Finalized:", auctionDetails.finalized);
    console.log("  Initialized:", auctionDetails.initialized);
  } catch (error) {
    console.error("Error creating auction:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });