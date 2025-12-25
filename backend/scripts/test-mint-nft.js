// scripts/test-mint-nft.js
// Script to test minting an NFT after auction finalization

require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  console.log("=== TESTING NFT MINTING ===");
  
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
    
    // Get the ABI for the mintNFTToWinner function
    const abi = [
      "function mintNFTToWinner(uint256) external",
      "function getAuctionDetails() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, bool initialized))"
    ];
    
    // Create contract instance with signer
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    
    // Check if auction is finalized
    console.log("\nChecking if auction is finalized...");
    const auctionDetails = await contract.getAuctionDetails();
    
    if (!auctionDetails.finalized) {
      console.log("❌ Auction is not finalized yet. Please finalize the auction first.");
      return;
    }
    
    // Mint the NFT
    console.log("\nMinting NFT...");
    const tokenId = 1; // Use 1 as the token ID for testing
    const tx = await contract.mintNFTToWinner(tokenId, {
      gasLimit: 10000000
    });
    
    console.log("✅ Mint transaction sent:", tx.hash);
    
    // Wait for the transaction to be mined
    console.log("Waiting for transaction to be mined...");
    const receipt = await tx.wait();
    console.log("✅ Transaction mined in block:", receipt.blockNumber);
    
    console.log("\n🎉 NFT MINTING TEST COMPLETE!");
    console.log("✅ NFT minted successfully");
    
  } catch (error) {
    console.error("❌ Minting test failed:", error.message);
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