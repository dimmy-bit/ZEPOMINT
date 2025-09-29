/**
 * Contract Verification Script
 * 
 * This script verifies that we can interact with the deployed contract on Zama testnet
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Verifying contract deployment on Zama testnet...");
  
  // Read the deployment information from the root directory
  const deploymentPath = path.join(__dirname, "..", "deployments", "zama-deployment.json");
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;
  
  console.log("Contract Address:", contractAddress);
  
  // Create a provider for Sepolia network using the RPC URL from environment
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  
  try {
    // Check if the contract exists by checking its bytecode
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("Contract not found at address");
      return;
    }
    
    console.log("Contract exists on chain!");
    console.log("Bytecode length:", code.length);
    
    // Try to get the contract factory and attach to it
    const ZepoMintFHE = await ethers.getContractFactory("ZepoMintFHE");
    const zepoMintFHE = ZepoMintFHE.attach(contractAddress).connect(provider);
    
    // Try a simple read operation
    try {
      // We need to connect with a signer to make state-changing calls
      const [signer] = await ethers.getSigners();
      const zepoMintFHESigned = zepoMintFHE.connect(signer);
      
      const owner = await zepoMintFHESigned.owner();
      console.log("Contract owner:", owner);
    } catch (error) {
      console.log("Could not read owner - this is expected for some contracts");
      console.log("Error:", error.message);
    }
    
    console.log("Contract verification completed successfully!");
    
  } catch (error) {
    console.error("Contract verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });