// update-frontend-with-new-contract.js
// Script to update the frontend with the new contract address and ABI

const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Updating frontend with new contract address...");
  
  // Read deployment information
  const deploymentPath = path.join(__dirname, "..", "deployments", "updated-smart-finalize-deployment.json");
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("Deployment file not found. Please deploy the contract first.");
    process.exit(1);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  console.log("Using contract address:", deploymentInfo.contractAddress);
  
  // Read the ABI
  const abiPath = path.join(__dirname, "..", "artifacts", "contracts", "ZepoMINTFHEAuctionSmartFinalize.sol", "ZepoMINTFHEAuctionSmartFinalize.json");
  
  if (!fs.existsSync(abiPath)) {
    console.error("ABI file not found. Please compile the contracts first.");
    process.exit(1);
  }
  
  const abiData = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  const abi = abiData.abi;
  
  // Update frontend ABI file
  const frontendAbiPath = path.join(__dirname, "..", "..", "frontend", "app", "src", "abi", "ZepoMINTFHEAuctionSmartFinalize.json");
  fs.writeFileSync(frontendAbiPath, JSON.stringify(abi, null, 2));
  console.log("Frontend ABI updated successfully!");
  
  // Update frontend contract address in the contract-deployment.json file
  const contractDeploymentPath = path.join(__dirname, "..", "..", "frontend", "app", "src", "contract-deployment.json");
  
  let contractDeployment = {
    contractAddress: deploymentInfo.contractAddress,
    network: deploymentInfo.network,
    deployer: deploymentInfo.deployerAddress,
    timestamp: deploymentInfo.timestamp
  };
  
  // If file exists, merge with existing data
  if (fs.existsSync(contractDeploymentPath)) {
    const existingData = JSON.parse(fs.readFileSync(contractDeploymentPath, "utf8"));
    contractDeployment = { ...existingData, ...contractDeployment };
  }
  
  fs.writeFileSync(contractDeploymentPath, JSON.stringify(contractDeployment, null, 2));
  console.log("Frontend contract deployment file updated successfully!");
  
  // Also update the .env file in frontend
  const envPath = path.join(__dirname, "..", "..", "frontend", "app", ".env");
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Update or add the contract address
    if (envContent.includes("VITE_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /VITE_CONTRACT_ADDRESS=.*/,
        `VITE_CONTRACT_ADDRESS=${deploymentInfo.contractAddress}`
      );
    } else {
      envContent += `\nVITE_CONTRACT_ADDRESS=${deploymentInfo.contractAddress}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("Frontend .env file updated successfully!");
  } else {
    console.log("Frontend .env file not found, creating new one...");
    const envContent = `VITE_CONTRACT_ADDRESS=${deploymentInfo.contractAddress}\n`;
    fs.writeFileSync(envPath, envContent);
    console.log("Frontend .env file created successfully!");
  }
  
  console.log("Frontend update completed successfully!");
  console.log("New contract address:", deploymentInfo.contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });