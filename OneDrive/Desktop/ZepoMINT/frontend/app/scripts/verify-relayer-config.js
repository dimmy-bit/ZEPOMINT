// Script to verify Zama relayer configuration
import dotenv from 'dotenv';
dotenv.config();

console.log("=== Zama Relayer Configuration Verification ===");

import { validateZamaRelayerConfig } from '../src/utils/env-validator.js';

async function main() {
  console.log("Verifying Zama Relayer Configuration...\n");
  
  // Validate environment variables
  const validation = validateZamaRelayerConfig();
  
  if (validation.isValid) {
    console.log("✅ Zama Relayer Configuration is valid!");
    console.log("Relayer URL:", validation.config.relayerUrl);
    console.log("KMS Contract Address:", validation.config.kmsContractAddress);
    
    // Test if we can access the relayer URL
    try {
      const response = await fetch(validation.config.relayerUrl);
      console.log("✅ Relayer URL is accessible - Status:", response.status);
    } catch (error) {
      console.log("❌ Error accessing relayer URL:", error.message);
    }
  } else {
    console.log("❌ Zama Relayer Configuration is invalid!");
    console.log("Error:", validation.error);
  }
  
  console.log("\n📝 Summary:");
  console.log("Make sure to restart your development server after any .env file changes.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
