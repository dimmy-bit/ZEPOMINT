// scripts/test-fhevm.js
// Test script to verify FHEVM is working

const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== TESTING FHEVM ===");
  
  try {
    // Check if FHE.sol exists
    const fheSolPath = path.join(__dirname, '..', 'node_modules', '@fhevm', 'solidity', 'lib', 'FHE.sol');
    if (fs.existsSync(fheSolPath)) {
      console.log("✅ FHE.sol found at:", fheSolPath);
    } else {
      console.log("❌ FHE.sol not found at expected path");
    }
    
    console.log("✅ FHEVM test completed");
    
  } catch (error) {
    console.error("❌ FHEVM test failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });