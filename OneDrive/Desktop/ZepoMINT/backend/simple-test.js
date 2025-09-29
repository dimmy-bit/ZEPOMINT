/**
 * Simple Test Script
 * 
 * This script tests basic contract functionality on Zama testnet
 */

const { ethers } = require("hardhat");

async function main() {
  console.log("Running simple test on Zama testnet...");
  
  try {
    // Get signers
    const [owner] = await ethers.getSigners();
    console.log("Owner address:", owner.address);
    
    // Deploy the contract
    const ZepoMintFHE = await ethers.getContractFactory("ZepoMintFHE");
    const zepoMintFHE = await ZepoMintFHE.deploy();
    await zepoMintFHE.waitForDeployment();
    const contractAddress = await zepoMintFHE.getAddress();
    console.log("Contract deployed to:", contractAddress);
    
    // Initialize the contract
    console.log("Initializing contract...");
    const initTx = await zepoMintFHE.initialize();
    await initTx.wait();
    console.log("Contract initialized");
    
    // Check if initialized
    const isInitialized = await zepoMintFHE.auctionInitialized();
    console.log("Auction initialized:", isInitialized);
    
    // Try to create an auction
    console.log("Creating auction...");
    const duration = 3600; // 1 hour
    const metadataCID = "QmSimpleTestCID";
    
    const createTx = await zepoMintFHE.createAuction(duration, metadataCID);
    await createTx.wait();
    console.log("Auction created successfully");
    
    console.log("Simple test completed successfully!");
    
  } catch (error) {
    console.error("Simple test failed:", error.message);
    console.error("Error stack:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });