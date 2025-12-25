// scripts/create-test-auction-new.js
// Script to create a test auction on the new contract

require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  console.log("=== CREATING TEST AUCTION ON NEW CONTRACT ===");
  
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
    
    // Get the ABI for the createAuction function
    const abi = [
      "function createAuction(uint256 biddingDurationSeconds, string metadataCID) external",
      "function getAuctionDetails() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, bool initialized))",
      "function getBidCount() view returns (uint256)"
    ];
    
    // Create contract instance with signer
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    
    // Create a test auction
    console.log("\nCreating test auction...");
    const duration = 3600; // 1 hour
    const metadataCID = "QmTestCIDForNewContractTesting";
    
    const tx = await contract.createAuction(duration, metadataCID, {
      gasLimit: 10000000
    });
    
    console.log("✅ Transaction sent:", tx.hash);
    
    // Wait for the transaction to be mined
    console.log("Waiting for transaction to be mined...");
    const receipt = await tx.wait();
    console.log("✅ Transaction mined in block:", receipt.blockNumber);
    
    // Check the auction details
    console.log("\nChecking auction details...");
    const auctionDetails = await contract.getAuctionDetails();
    console.log("✅ Auction Details:");
    console.log("  - Metadata CID:", auctionDetails.metadataCID);
    console.log("  - End Time:", new Date(Number(auctionDetails.endTime) * 1000).toISOString());
    console.log("  - Finalized:", auctionDetails.finalized);
    console.log("  - Initialized:", auctionDetails.initialized);
    
    const bidCount = await contract.getBidCount();
    console.log("✅ Bid Count:", bidCount.toString());
    
    console.log("\n🎉 TEST AUCTION CREATION COMPLETE!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
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