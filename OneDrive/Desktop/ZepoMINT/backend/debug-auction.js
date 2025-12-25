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
    "function computeWinnerOnChain()",
    "function getAuctionDetails() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, bool initialized))",
    "function getBidCount() view returns (uint256)",
    "function owner() view returns (address)",
    "event AuctionFinalized(bytes32 winner, bytes32 encryptedPrice, uint256 winnerIndex)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  try {
    console.log("Debugging auction status...");
    
    // Check contract owner
    const owner = await contract.owner();
    console.log("Contract owner:", owner);
    console.log("Wallet address:", wallet.address);
    console.log("Is owner:", owner.toLowerCase() === wallet.address.toLowerCase());
    
    // Get current auction details
    const auctionDetails = await contract.getAuctionDetails();
    console.log("Current Auction:", auctionDetails);
    console.log("Auction finalized:", auctionDetails.finalized);
    console.log("Auction initialized:", auctionDetails.initialized);
    
    // Check if auction has ended
    const endTime = parseInt(auctionDetails.endTime.toString());
    const currentTime = Math.floor(Date.now() / 1000);
    
    console.log("Auction end time:", new Date(endTime * 1000).toLocaleString());
    console.log("Current time:", new Date(currentTime * 1000).toLocaleString());
    console.log("Auction ended:", endTime <= currentTime);
    
    // Get bid count
    const bidCount = await contract.getBidCount();
    console.log("Bid count:", bidCount.toString());
    
    if (bidCount.toString() === "0") {
      console.log("No bids submitted, cannot finalize auction");
      return;
    }
    
  } catch (error) {
    console.error("Error debugging auction:", error.message);
    console.error("Error stack:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });