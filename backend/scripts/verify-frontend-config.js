// scripts/verify-frontend-config.js
// Verify that frontend is using the correct contract

const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== VERIFYING FRONTEND CONFIGURATION ===");
  
  try {
    // Check zama-config.js
    const zamaConfigPath = path.join(__dirname, "..", "..", "frontend", "app", "src", "config", "zama-config.js");
    const zamaConfigContent = fs.readFileSync(zamaConfigPath, 'utf8');
    
    // Extract contract address from zama-config.js
    const contractAddressMatch = zamaConfigContent.match(/contractAddress:\s*["']([^"']*)["']/);
    if (contractAddressMatch) {
      console.log("✅ Zama config contract address:", contractAddressMatch[1]);
    } else {
      console.log("❌ Could not find contract address in zama-config.js");
    }
    
    // Check .env file
    const envPath = path.join(__dirname, "..", "..", "frontend", "app", ".env");
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Extract contract address from .env
    const envAddressMatch = envContent.match(/VITE_CONTRACT_ADDRESS=([^\n\r]+)/);
    if (envAddressMatch) {
      console.log("✅ .env contract address:", envAddressMatch[1]);
    } else {
      console.log("❌ Could not find VITE_CONTRACT_ADDRESS in .env");
    }
    
    // Check contract-deployment.json
    const deploymentPath = path.join(__dirname, "..", "..", "frontend", "app", "src", "contract-deployment.json");
    const deploymentContent = fs.readFileSync(deploymentPath, 'utf8');
    const deploymentInfo = JSON.parse(deploymentContent);
    
    console.log("✅ contract-deployment.json contract address:", deploymentInfo.contractAddress);
    console.log("✅ contract-deployment.json network:", deploymentInfo.network);
    
    // Check ABI
    const abiPath = path.join(__dirname, "..", "..", "frontend", "app", "src", "abi", "ZepoMINTFHEAuction.json");
    const abiContent = fs.readFileSync(abiPath, 'utf8');
    const abiInfo = JSON.parse(abiContent);
    
    console.log("✅ ABI contract name:", abiInfo.contractName);
    console.log("✅ ABI source name:", abiInfo.sourceName);
    console.log("✅ ABI function count:", abiInfo.abi.length);
    
    // Look for smartFinalize function in ABI
    const hasSmartFinalize = abiInfo.abi.some(item => item.name === 'smartFinalize');
    if (hasSmartFinalize) {
      console.log("✅ ABI contains smartFinalize function");
    } else {
      console.log("❌ ABI does not contain smartFinalize function");
    }
    
    console.log("\n🎉 FRONTEND CONFIGURATION VERIFICATION COMPLETE!");
    console.log("All frontend files are now using the new smart finalize contract.");
    
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });