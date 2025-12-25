// deploy-updated-smart-finalize.js
// Script to deploy the updated ZepoMINTFHEAuctionSmartFinalize contract

const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying updated ZepoMINTFHEAuctionSmartFinalize contract...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");
  
  // Deploy the contract
  const ZepoMINTFHEAuctionSmartFinalize = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalize");
  const auctionContract = await ZepoMINTFHEAuctionSmartFinalize.deploy();
  
  console.log("Contract deployed to:", auctionContract.address);
  
  // Wait for deployment
  await auctionContract.deployed();
  
  // Save deployment information
  const deploymentInfo = {
    contractAddress: auctionContract.address,
    deployerAddress: deployer.address,
    network: network.name,
    timestamp: new Date().toISOString()
  };
  
  // Save to a deployment file
  const deploymentPath = path.join(__dirname, "..", "deployments", "updated-smart-finalize-deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment information saved to:", deploymentPath);
  
  // Verify the contract on Etherscan (if on a live network)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await auctionContract.deployTransaction.wait(6);
    
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: auctionContract.address,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Error verifying contract:", error.message);
    }
  }
  
  console.log("Deployment completed successfully!");
  console.log("Contract address:", auctionContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });