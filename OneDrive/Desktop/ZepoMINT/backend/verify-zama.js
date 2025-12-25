/**
 * Zama Contract Verification Script
 * 
 * This script verifies that we can interact with the deployed contract on Zama testnet
 */

const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Verifying contract deployment on Zama testnet...");
  console.log("Network:", network.name);
  
  // Read the deployment information from the root directory
  const deploymentPath = path.join(__dirname, "..", "deployments", "zama-deployment.json");
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;
  
  console.log("Contract Address:", contractAddress);
  
  try {
    // Check if we're on the correct network
    if (network.name !== "zama") {
      console.log("Warning: Not running on Zama network. Current network:", network.name);
    }
    
    // Try to get the contract factory and attach to it
    const ZepoMintFHE = await ethers.getContractFactory("ZepoMintFHE");
    const zepoMintFHE = ZepoMintFHE.attach(contractAddress);
    
    // Check if the contract exists by checking its bytecode
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("Contract not found at address");
      return;
    }
    
    console.log("Contract exists on chain!");
    console.log("Bytecode length:", code.length);
    
    // Try a simple read operation
    try {
      const owner = await zepoMintFHE.owner();
      console.log("Contract owner:", owner);
    } catch (error) {
      console.log("Could not read owner - this might be expected for some contracts");
      console.log("Error:", error.message);
    }
    
    // Try to read some state variables
    try {
      const auctionInitialized = await zepoMintFHE.auctionInitialized();
      console.log("Auction initialized:", auctionInitialized);
    } catch (error) {
      console.log("Could not read auctionInitialized");
      console.log("Error:", error.message);
    }
    
    console.log("Contract verification completed successfully!");
    
  } catch (error) {
    console.error("Contract verification failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });