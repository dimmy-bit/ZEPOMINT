/**
 * Network Test Script
 * 
 * This script tests the connection to the Sepolia network
 */

const { ethers } = require("hardhat");

async function main() {
  console.log("Testing network connection...");
  
  try {
    // Get the provider
    const provider = ethers.provider;
    
    // Get network information
    const network = await provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId.toString());
    
    // Get latest block
    const block = await provider.getBlock("latest");
    console.log("Latest block number:", block.number.toString());
    console.log("Latest block timestamp:", new Date(block.timestamp * 1000).toString());
    
    // Get balance of deployer account
    const [deployer] = await ethers.getSigners();
    const balance = await provider.getBalance(deployer.address);
    console.log("Deployer address:", deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
    
    console.log("Network connection test completed successfully!");
    
  } catch (error) {
    console.error("Network connection test failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });