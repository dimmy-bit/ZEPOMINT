// scripts/deploy-with-your-private-key.js
// Deployment script using your actual private key

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== DEPLOYING CONTRACT WITH YOUR PRIVATE KEY ===");
  console.log("Network: Sepolia Testnet");
  
  try {
    // Get the contract factory
    const SmartFinalizeAuction = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalize");
    
    console.log("Deploying smart finalize auction contract...");
    
    // Deploy the contract using your private key (configured in hardhat.config.js)
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
      network: "sepolia",
      timestamp: new Date().toISOString(),
      auctionDetails: {
        metadataCID: auctionDetails.metadataCID,
        endTime: auctionDetails.endTime.toString(),
        finalized: auctionDetails.finalized,
        initialized: auctionDetails.initialized
      }
    };
    
    const deploymentFilePath = path.join(__dirname, "..", "deployments", "your-private-key-deployment.json");
    fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to:", deploymentFilePath);
    
    // Update frontend configuration
    updateFrontendConfig(contractAddress);
    
    console.log("\n🎉 CONTRACT DEPLOYMENT COMPLETE!");
    console.log("✅ Contract deployed with your private key");
    console.log("✅ Contract address:", contractAddress);
    console.log("✅ Owner address:", deployer.address);
    console.log("✅ Frontend automatically updated");
    console.log("✅ First auction created");
    
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