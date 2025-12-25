// scripts/finalize-auction-new.js
// Script to finalize the auction on the new contract

require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  console.log("=== FINALIZING AUCTION ON NEW CONTRACT ===");
  
  try {
    // Get the new contract address
    const contractAddress = "0x1C9D5B1f795cbEc1dCe2c418B9F903e7DD07A510";
    
    console.log("Using contract at address:", contractAddress);
    
    // Get RPC URL and private key
    const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      console.log("❌ No private key found. Please set PRIVATE_KEY in your .env file");
      process.exit(1);
    }
    
    console.log("Using RPC URL:", rpcUrl);
    
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log("Using wallet address:", wallet.address);
    
    // Get the ABI for the smartFinalize function
    const abi = [
      "function smartFinalize() external",
      "function getAuctionDetails() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, bool initialized))"
    ];
    
    // Create contract instance with signer
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    
    // Check if auction has ended
    console.log("\nChecking if auction has ended...");
    const auctionDetails = await contract.getAuctionDetails();
    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = Number(auctionDetails.endTime);
    
    if (currentTime < endTime) {
      const timeRemaining = endTime - currentTime;
      const hours = Math.floor(timeRemaining / 3600);
      const minutes = Math.floor((timeRemaining % 3600) / 60);
      console.log(`⏰ Auction has not ended yet. Time remaining: ${hours}h ${minutes}m`);
      console.log("Please wait for the auction to end before finalizing.");
      return;
    }
    
    // Finalize the auction
    console.log("\nFinalizing auction...");
    const tx = await contract.smartFinalize({
      gasLimit: 10000000
    });
    
    console.log("✅ Finalize transaction sent:", tx.hash);
    
    // Wait for the transaction to be mined
    console.log("Waiting for transaction to be mined...");
    const receipt = await tx.wait();
    console.log("✅ Transaction mined in block:", receipt.blockNumber);
    
    // Check the auction details after finalization
    console.log("\nChecking auction details after finalization...");
    const updatedAuctionDetails = await contract.getAuctionDetails();
    console.log("✅ Updated Auction Details:");
    console.log("  - Finalized:", updatedAuctionDetails.finalized);
    
    console.log("\n🎉 AUCTION FINALIZATION COMPLETE!");
    
  } catch (error) {
    console.error("❌ Finalization failed:", error.message);
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