// scripts/deploy-smart-finalize-local.js
// Deployment script for smart finalize contract on local network

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== DEPLOYING SMART FINALIZE CONTRACT ON LOCAL NETWORK ===");
  
  try {
    // Get the contract factory
    const SmartFinalizeAuction = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalize");
    
    console.log("Deploying smart finalize auction contract...");
    
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
    const initTx = await auction.initialize("http://127.0.0.1:3000/public_key");
    await initTx.wait();
    console.log("✅ Contract initialized");
    
    // Create first auction
    console.log("\nCreating first auction...");
    const createTx = await auction.createAuction(3600, "QmWgL11go85J4UpC5sZCqZyJzKNX9YYbWsgiWz9Sj9X5bD");
    await createTx.wait();
    console.log("✅ First auction created");
    
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
      network: "localhost",
      timestamp: new Date().toISOString(),
      auctionDetails: {
        metadataCID: auctionDetails.metadataCID,
        endTime: auctionDetails.endTime.toString(),
        finalized: auctionDetails.finalized,
        initialized: auctionDetails.initialized
      }
    };
    
    const deploymentFilePath = path.join(__dirname, "..", "deployments", "zepamint-smart-finalize-local-deployment.json");
    fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to:", deploymentFilePath);
    
    // Update frontend configuration
    updateFrontendConfig(contractAddress);
    
    console.log("\n🎉 SMART FINALIZE CONTRACT DEPLOYMENT COMPLETE!");
    console.log("✅ Contract deployed on local network");
    console.log("✅ Contract address:", contractAddress);
    console.log("✅ Owner address:", deployer.address);
    console.log("✅ Frontend automatically updated");
    console.log("✅ First auction created");
    
    console.log("\nSmart Finalization Features:");
    console.log("- 0 bids: Finalize without winner");
    console.log("- 1 bid: Automatic winner (owner bids excluded)");
    console.log("- 2+ bids: FHE-based winner determination (owner bids excluded)");
    
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
    
    // Also update the .env file in frontend to use your private key
    const frontendEnvPath = path.join(__dirname, "..", "..", "frontend", "app", ".env");
    let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    
    // Replace the private key in the frontend .env
    frontendEnv = frontendEnv.replace(
      /VITE_PRIVATE_KEY=0x[0-9a-fA-F]{64}/,
      `VITE_PRIVATE_KEY=0xb57e1b6cbbed376ed8d61d93c4eb052c1aeb365023a429e093b14c9b033b4060`
    );
    
    fs.writeFileSync(frontendEnvPath, frontendEnv);
    console.log("✅ Frontend .env updated with your private key");
    
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