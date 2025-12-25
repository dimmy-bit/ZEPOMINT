// deploy-zepamint-auction.js
// Deployment script for ZepoMINTFHEAuction contract
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ZepoMINTFHEAuction contract...");

  // Get the contract factory
  const ZepoMINTFHEAuction = await ethers.getContractFactory("ZepoMINTFHEAuction");

  // Deploy the contract
  console.log("Deploying contract...");
  const contract = await ZepoMINTFHEAuction.deploy();
  
  // Wait for the deployment transaction to be mined
  await contract.waitForDeployment();
  
  // Get the deployed contract address
  const contractAddress = await contract.getAddress();
  
  console.log("ZepoMINTFHEAuction deployed to:", contractAddress);
  
  // Verify the deployment by calling a view function
  try {
    // Since the contract inherits from Ownable, let's check the owner
    const owner = await contract.owner();
    console.log("Contract deployed successfully. Owner:", owner);
  } catch (error) {
    console.log("Contract deployed but unable to verify owner:", error.message);
  }
  
  // Save the contract address to a file for later use
  const fs = require("fs");
  const path = require("path");
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: (await ethers.getSigners())[0].address,
    timestamp: new Date().toISOString()
  };
  
  const deploymentFilePath = path.join(deploymentsDir, "zepamint-main-wallet-deployment.json");
  fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("Deployment information saved to", deploymentFilePath);
  
  // Also update the main deployment file
  const mainDeploymentFilePath = path.join(deploymentsDir, "zepamint-main-wallet-deployment.json");
  fs.writeFileSync(mainDeploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Main deployment information updated");
  
  // Update frontend deployment file
  const frontendDeploymentPath = path.join(__dirname, "..", "..", "frontend", "app", "src", "contract-deployment.json");
  fs.writeFileSync(frontendDeploymentPath, JSON.stringify({
    network: "localhost",
    contractAddress: contractAddress,
    deployer: deploymentInfo.deployer,
    timestamp: deploymentInfo.timestamp
  }, null, 2));
  console.log("Frontend deployment information updated");
  
  // Update frontend .env file
  const frontendEnvPath = path.join(__dirname, "..", "..", "frontend", "app", ".env");
  let frontendEnv = fs.readFileSync(frontendEnvPath, "utf8");
  
  // Replace the contract address in the frontend .env
  frontendEnv = frontendEnv.replace(
    /VITE_CONTRACT_ADDRESS=0x[0-9a-fA-F]{40}/,
    `VITE_CONTRACT_ADDRESS=${contractAddress}`
  );
  
  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log("Frontend .env updated with new contract address");
  
  console.log("\n✅ Deployment completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Initialize the contract with a public key URI");
  console.log("2. Create an auction using the create-test-auction.js script");
  console.log("3. Start frontend: cd frontend/app && npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });