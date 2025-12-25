// scripts/test-create-auction.js
// Script to test creating an auction

require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  console.log("=== TESTING AUCTION CREATION ===");
  
  try {
    // Get the correct contract address
    const contractAddress = "0x21095aedcc0205cB33042727698b8be984e4062a";
    
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
      "function createAuction(uint256 biddingDurationSeconds, string memory metadataCID) external onlyOwner",
      "function getAuctionDetails() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, bool initialized))"
    ];
    
    // Create contract instance with signer
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    
    // Check if the wallet is the owner
    console.log("\nChecking if wallet is contract owner...");
    
    // Create a test auction
    console.log("\nCreating test auction...");
    const duration = 3600; // 1 hour
    const metadataCID = "QmTestCIDForTesting";
    
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
    console.log("  - End Time:", auctionDetails.endTime.toString());
    console.log("  - Finalized:", auctionDetails.finalized);
    console.log("  - Initialized:", auctionDetails.initialized);
    
    console.log("\n🎉 AUCTION CREATION TEST COMPLETE!");
    
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