// scripts/deploy-fixed-contract.js
// Deployment script for the fixed smart finalize contract

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== DEPLOYING FIXED SMART FINALIZE CONTRACT ===");
  
  try {
    // Get the contract factory
    const SmartFinalizeAuction = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalizeFixed");
    
    console.log("Deploying fixed smart finalize auction contract...");
    
    // Deploy the contract
    const auction = await SmartFinalizeAuction.deploy();
    await auction.waitForDeployment();
    
    const contractAddress = await auction.getAddress();
    console.log("✅ Contract deployed at:", contractAddress);
    
    // Get deployer info
    const [deployer] = await ethers.getSigners();
    console.log("Deployed by:", deployer.address);
    
    // Initialize the contract
    console.log("\nInitializing contract...");
    const initTx = await auction.initialize("https://relayer.testnet.zama.cloud/public_key");
    await initTx.wait();
    console.log("✅ Contract initialized");
    
    // Verify deployment
    const auctionDetails = await auction.getAuctionDetails();
    console.log("\nAuction Details:");
    console.log("- Metadata CID:", auctionDetails.metadataCID);
    console.log("- End Time:", new Date(Number(auctionDetails.endTime) * 1000).toISOString());
    console.log("- Finalized:", auctionDetails.finalized);
    console.log("- Initialized:", auctionDetails.initialized);
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress: contractAddress,
      owner: deployer.address,
      network: "sepolia",
      timestamp: new Date().toISOString(),
      auctionDetails: {
        metadataCID: auctionDetails.metadataCID,
        endTime: auctionDetails.endTime.toString(),
        finalized: auctionDetails.finalized,
        initialized: auctionDetails.initialized
      }
    };
    
    const deploymentFilePath = path.join(__dirname, "..", "deployments", "fixed-contract-deployment.json");
    fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to:", deploymentFilePath);
    
    // Update frontend configuration
    updateFrontendConfig(contractAddress);
    
    console.log("\n🎉 FIXED CONTRACT DEPLOYMENT COMPLETE!");
    console.log("✅ Contract deployed with your private key");
    console.log("✅ Contract address:", contractAddress);
    console.log("✅ Owner address:", deployer.address);
    console.log("✅ Frontend automatically updated");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

function updateFrontendConfig(contractAddress) {
  try {
    const frontendConfigPath = path.join(__dirname, "..", "..", "frontend", "app", "src", "config", "zama-config.js");
    
    // Read the current config file
    let configContent = fs.readFileSync(frontendConfigPath, 'utf8');
    
    // Replace the contract address
    const updatedConfigContent = configContent.replace(
      /contractAddress: "[^"]*"/,
      `contractAddress: "${contractAddress}"`
    );
    
    // Write the updated config file
    fs.writeFileSync(frontendConfigPath, updatedConfigContent);
    
    console.log("✅ Frontend configuration updated successfully");
    
    // Also update the contract deployment file
    const deploymentFilePath = path.join(__dirname, "..", "..", "frontend", "app", "src", "contract-deployment.json");
    const deploymentInfo = {
      contractAddress: contractAddress,
      network: "sepolia",
      deployer: "0x20dcd85aC3d79D97E1eC05375c45f4d94dD9371a",
      timestamp: new Date().toISOString()
    };
    fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
    console.log("✅ Frontend deployment file updated successfully");
    
    // Also update the .env file
    const envFilePath = path.join(__dirname, "..", "..", "frontend", "app", ".env");
    let envContent = fs.readFileSync(envFilePath, 'utf8');
    const updatedEnvContent = envContent.replace(
      /VITE_CONTRACT_ADDRESS=[^\n]*/,
      `VITE_CONTRACT_ADDRESS=${contractAddress}`
    );
    fs.writeFileSync(envFilePath, updatedEnvContent);
    console.log("✅ Frontend .env file updated successfully");
    
  } catch (error) {
    console.error("❌ Failed to update frontend configuration:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });