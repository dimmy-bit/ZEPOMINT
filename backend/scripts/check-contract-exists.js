// scripts/check-contract-exists.js
// Simple script to check if a contract exists at the given address

require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  console.log("=== CHECKING CONTRACT EXISTENCE ===");
  
  try {
    // Get the contract address that's showing in the error logs
    const contractAddress = "0x21095aedcc0205cB33042727698b8be984e4062a";
    
    console.log("Checking contract at address:", contractAddress);
    
    // Get RPC URL
    const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
    console.log("Using RPC URL:", rpcUrl);
    
    // Create provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Check if there's code at the address
    const code = await provider.getCode(contractAddress);
    
    if (code === '0x') {
      console.log("❌ No contract found at address");
      console.log("This means either:");
      console.log("1. The contract was not deployed correctly");
      console.log("2. The contract was deployed to a different address");
      console.log("3. The contract was self-destructed");
    } else {
      console.log("✅ Contract code found at address");
      console.log("Code length:", code.length, "characters");
      
      // Try to get the contract's balance
      const balance = await provider.getBalance(contractAddress);
      console.log("Contract balance:", ethers.formatEther(balance), "ETH");
    }
    
    console.log("\n🎉 CONTRACT EXISTENCE CHECK COMPLETE!");
    
  } catch (error) {
    console.error("❌ Check failed:", error.message);
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