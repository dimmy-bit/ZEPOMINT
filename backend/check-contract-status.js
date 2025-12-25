const { ethers } = require('ethers');
const deploymentInfo = require('./deployments/zepamint-main-wallet-deployment.json');

async function main() {
  // Configuration
  const contractAddress = deploymentInfo.contractAddress;
  console.log("Contract Address:", contractAddress);
  
  // Using Sepolia RPC URL from .env
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org");
  const privateKey = "0xb57e1b6cbbed376ed8d61d93c4eb052c1aeb365023a429e093b14c9b033b4060"; // Using private key from .env
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Contract ABI - only include functions we need
  const abi = [
    "function owner() view returns (address)",
    "function getAuctionDetails() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, bool initialized))",
    "function getBidCount() view returns (uint256)",
    "function auctionInitialized() view returns (bool)",
    "function currentAuction() view returns (string metadataCID, uint256 endTime, bool finalized, bool initialized)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  try {
    console.log("Checking contract status...");
    
    // Check contract owner
    const owner = await contract.owner();
    console.log("Contract owner:", owner);
    console.log("Wallet address:", wallet.address);
    console.log("Is owner:", owner.toLowerCase() === wallet.address.toLowerCase());
    
    // Check if auction is initialized
    const isInitialized = await contract.auctionInitialized();
    console.log("Auction initialized:", isInitialized);
    
    // Get current auction details
    try {
      const auctionDetails = await contract.getAuctionDetails();
      console.log("Current Auction:", auctionDetails);
      console.log("Auction finalized:", auctionDetails.finalized);
      console.log("Auction initialized:", auctionDetails.initialized);
    } catch (error) {
      console.log("No auction details available yet");
    }
    
    // Try the old method
    try {
      const currentAuction = await contract.currentAuction();
      console.log("Current Auction (old method):", currentAuction);
    } catch (error) {
      console.log("Old method not available");
    }
    
  } catch (error) {
    console.error("Error checking contract status:", error.message);
    console.error("Error stack:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });