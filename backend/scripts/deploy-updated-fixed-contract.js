// scripts/deploy-updated-fixed-contract.js
// Script to deploy the updated fixed contract

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== DEPLOYING UPDATED FIXED CONTRACT ===");
  
  try {
    // Get the contract factory
    const UpdatedFixedAuction = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalizeFixed");
    
    console.log("Deploying contract...");
    
    // Deploy the contract
    const auction = await UpdatedFixedAuction.deploy();
    await auction.waitForDeployment();
    
    const contractAddress = await auction.getAddress();
    console.log("✅ Contract deployed at address:", contractAddress);
    
    // Get the deployer address
    const [deployer] = await ethers.getSigners();
    console.log("Deployed by:", deployer.address);
    
    // Initialize the contract with public key URI
    const publicKeyURI = "https://relayer.testnet.zama.cloud/public_key";
    console.log("Initializing contract with public key URI:", publicKeyURI);
    
    const initTx = await auction.initialize(publicKeyURI);
    await initTx.wait();
    
    console.log("✅ Contract initialized");
    
    // Save deployment information
    const deploymentInfo = {
      contractAddress: contractAddress,
      owner: deployer.address,
      network: "sepolia",
      timestamp: new Date().toISOString(),
      publicKeyURI: publicKeyURI
    };
    
    const deploymentFilePath = path.join(__dirname, "..", "deployments", "updated-fixed-contract-deployment.json");
    fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
    console.log("✅ Deployment info saved to:", deploymentFilePath);
    
    // Verify the contract (optional)
    try {
      console.log("Verifying contract on Etherscan...");
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("⚠️  Contract verification failed (this is OK):", error.message);
    }
    
    console.log("\n🎉 UPDATED FIXED CONTRACT DEPLOYMENT COMPLETE!");
    console.log("Contract Address:", contractAddress);
    console.log("Owner Address:", deployer.address);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });