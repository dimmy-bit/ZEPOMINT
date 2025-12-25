const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== Deploying ZepoMINTFHEAuctionComplete Contract ===");
  
  // Get the contract factory
  const AuctionContract = await ethers.getContractFactory("ZepoMINTFHEAuctionComplete");
  
  console.log("Deploying contract...");
  
  // Deploy the contract
  const auction = await AuctionContract.deploy();
  
  await auction.deploymentTransaction().wait(); // Wait for deployment
  
  console.log("Contract deployed to:", await auction.getAddress());
  
  // Get the deployer address
  const [deployer] = await ethers.getSigners();
  console.log("Deployed by:", await deployer.getAddress());
  
  // Initialize the contract with the public key URI
  console.log("Initializing contract with public key URI...");
  try {
    const tx = await auction.initialize("https://relayer.testnet.zama.cloud/public_key");
    await tx.wait();
    console.log("Contract initialized successfully");
  } catch (initError) {
    console.log("Initialization might already be done or contract doesn't have initialize function:", initError.message);
  }
  
  // Prepare deployment information
  const deploymentInfo = {
    contractAddress: await auction.getAddress(),
    deployer: await deployer.getAddress(),
    network: "sepolia",
    timestamp: new Date().toISOString(),
    publicKeyURI: "https://relayer.testnet.zama.cloud/public_key"
  };
  
  // Write deployment info to file
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFilePath = path.join(deploymentsDir, 'complete-contract-deployment.json');
  fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("Deployment information saved to:", deploymentFilePath);
  
  // Also update the frontend configuration
  const frontendConfigPath = path.join(__dirname, '..', '..', 'frontend', 'app', 'src', 'contract-deployment.json');
  if (fs.existsSync(frontendConfigPath)) {
    const frontendConfig = {
      contractAddress: await auction.getAddress(),
      network: "sepolia",
      deployer: await deployer.getAddress(),
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(frontendConfigPath, JSON.stringify(frontendConfig, null, 2));
    console.log("Frontend configuration updated:", frontendConfigPath);
  } else {
    console.log("Frontend config file not found, skipping update");
  }
  
  console.log("\n=== Deployment Complete ===");
  console.log("Contract Address:", await auction.getAddress());
  console.log("Deployer Address:", await deployer.getAddress());
  console.log("Network: Sepolia Testnet");
  console.log("Timestamp:", new Date().toISOString());
  
  // Verify that the contract is working
  console.log("\n=== Verifying Contract ===");
  try {
    const publicKey = await auction.getPublicKeyURI();
    console.log("Public Key URI:", publicKey);
    console.log("Contract is responding correctly!");
  } catch (error) {
    console.log("Contract verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });