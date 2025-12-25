// scripts/initialize-contract.js
// Script to initialize an existing contract with public key URI

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== INITIALIZING CONTRACT ===");
  
  try {
    // Get the contract address from environment or use the one from config
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
    
    console.log("Initializing contract at address:", contractAddress);
    
    // Get the contract factory and attach to existing contract
    const SmartFinalizeAuction = await ethers.getContractFactory("ZepoMINTFHEAuctionSmartFinalize");
    const auction = SmartFinalizeAuction.attach(contractAddress);
    
    // Get deployer info
    const [deployer] = await ethers.getSigners();
    console.log("Initializing with account:", deployer.address);
    
    // Check if contract is already initialized
    const publicKeyURI = await auction.getPublicKeyURI();
    if (publicKeyURI && publicKeyURI.length > 0) {
      console.log("⚠️  Contract already initialized with public key URI:", publicKeyURI);
      return;
    }
    
    // Initialize the contract
    console.log("\nInitializing contract with public key URI...");
    const initTx = await auction.initialize("https://gateway.sepolia.zama.ai/public_key");
    await initTx.wait();
    console.log("✅ Contract initialized successfully");
    
    // Verify initialization
    const updatedPublicKeyURI = await auction.getPublicKeyURI();
    console.log("Public Key URI set to:", updatedPublicKeyURI);
    
    console.log("\n🎉 CONTRACT INITIALIZATION COMPLETE!");
    console.log("✅ Contract address:", contractAddress);
    console.log("✅ Public key URI configured");
    console.log("✅ Ready for auction creation");
    
  } catch (error) {
    console.error("❌ Initialization failed:", error.message);
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