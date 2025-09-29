const { ethers } = require('ethers');
const deploymentInfo = require('../deployments/zepamint-proper-improved-deployment.json');

async function main() {
  // Configuration
  const contractAddress = deploymentInfo.contractAddress;
  console.log("Contract Address:", contractAddress);
  
  // Using Sepolia RPC URL from your .env file
  const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/JkwlX2jl-1k1wTZQPFHuC-YYuLcoldZk");
  const privateKey = "0xad9a3abc0f3b6414711d2b4e874ebe5b256f3dda66a2b47bf4818094a53d35a5"; // Using your actual private key
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Contract ABI - only include functions we need
  const abi = [
    "function computeWinnerOnChain() returns (bool)",
    "function currentAuction() view returns (string metadataCID, uint256 endTime, bool finalized, uint256 encryptedWinningPrice, uint256 winnerIndex, address winner)",
    "event AuctionFinalized(address winner, uint256 encryptedPrice, uint256 winnerIndex)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  try {
    console.log("Checking current auction status...");
    
    // Get current auction details
    const currentAuction = await contract.currentAuction();
    console.log("Current Auction:", currentAuction);
    console.log("Auction finalized:", currentAuction.finalized);
    
    if (currentAuction.finalized) {
      console.log("Auction is already finalized");
      return;
    }
    
    // Check if auction has ended
    const endTime = parseInt(currentAuction.endTime.toString());
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (endTime >= currentTime) {
      console.log("Auction has not ended yet. Cannot finalize.");
      console.log("End time:", new Date(endTime * 1000).toLocaleString());
      console.log("Current time:", new Date(currentTime * 1000).toLocaleString());
      return;
    }
    
    console.log("Auction has ended. Finalizing...");
    
    // Finalize the auction
    const tx = await contract.computeWinnerOnChain();
    console.log("Transaction hash:", tx.hash);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Auction finalized successfully in block:", receipt.blockNumber);
    
    // Verify finalization
    const updatedAuction = await contract.currentAuction();
    console.log("Updated Auction:", updatedAuction);
    console.log("Auction finalized:", updatedAuction.finalized);
    
  } catch (error) {
    console.error("Error finalizing auction:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });