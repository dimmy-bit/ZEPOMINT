// scripts/deploy-final-fixed-contract.js
// Script to deploy the final fixed contract with improved FHE operations

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== DEPLOYING FINAL FIXED CONTRACT ===");
  
  try {
    // Get the contract factory
    const FinalFixedAuction = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalizeFixed");
    
    console.log("Deploying contract...");
    
    // Deploy the contract
    const auction = await FinalFixedAuction.deploy();
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
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }
    
    const deploymentFilePath = path.join(deploymentsDir, "final-fixed-contract-deployment.json");
    fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
    console.log("✅ Deployment info saved to:", deploymentFilePath);
    
    // Also update the frontend configuration files
    console.log("Updating frontend configuration files...");
    
    // Update contract-deployment.json in frontend
    const frontendDeploymentPath = path.join(__dirname, "..", "..", "frontend", "app", "src", "contract-deployment.json");
    if (fs.existsSync(frontendDeploymentPath)) {
      const frontendDeployment = JSON.parse(fs.readFileSync(frontendDeploymentPath, 'utf8'));
      frontendDeployment.contractAddress = contractAddress;
      frontendDeployment.timestamp = new Date().toISOString();
      fs.writeFileSync(frontendDeploymentPath, JSON.stringify(frontendDeployment, null, 2));
      console.log("✅ Frontend contract-deployment.json updated");
    }
    
    // Update zama-config.js in frontend
    const zamaConfigPath = path.join(__dirname, "..", "..", "frontend", "app", "src", "config", "zama-config.js");
    if (fs.existsSync(zamaConfigPath)) {
      let zamaConfigContent = fs.readFileSync(zamaConfigPath, 'utf8');
      // Replace the contract address
      zamaConfigContent = zamaConfigContent.replace(
        /contractAddress: "[0-9a-fA-Fx]+"/,
        `contractAddress: "${contractAddress}"`
      );
      fs.writeFileSync(zamaConfigPath, zamaConfigContent);
      console.log("✅ Frontend zama-config.js updated");
    }
    
    // Copy the ABI file to frontend
    const abiSourcePath = path.join(__dirname, "..", "artifacts", "contracts", "ZepoMINTFHEAuctionSmartFinalizeFixed.sol", "ZepoMINTFHEAuctionSmartFinalizeFixed.json");
    const abiDestPath = path.join(__dirname, "..", "..", "frontend", "app", "src", "abi", "ZepoMINTFHEAuctionSmartFinalizeFixed.json");
    
    if (fs.existsSync(abiSourcePath)) {
      // Create abi directory if it doesn't exist
      const abiDir = path.dirname(abiDestPath);
      if (!fs.existsSync(abiDir)) {
        fs.mkdirSync(abiDir, { recursive: true });
      }
      
      fs.copyFileSync(abiSourcePath, abiDestPath);
      console.log("✅ ABI file copied to frontend");
    }
    
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
    
    console.log("\n🎉 FINAL FIXED CONTRACT DEPLOYMENT COMPLETE!");
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