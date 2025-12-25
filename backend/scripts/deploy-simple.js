// deploy-simple.js
// Simple deployment script for the fixed contract

const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ZepoMINTFHEAuctionSmartFinalize contract...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Deploy the contract
  const ZepoMINTFHEAuctionSmartFinalize = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalize");
  const auctionContract = await ZepoMINTFHEAuctionSmartFinalize.deploy();
  
  console.log("Contract deployed to:", auctionContract.address);
  
  // Wait for deployment
  await auctionContract.waitForDeployment();
  
  console.log("Deployment completed successfully!");
  console.log("Contract address:", await auctionContract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
