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
    "function createAuction(uint256 biddingDurationSeconds, string metadataCID)",
    "function getAuctionDetails() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, bool initialized))",
    "function owner() view returns (address)",
    "event AuctionCreated(uint256 endTime, string metadataCID)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  try {
    console.log("Creating test auction...");
    
    // Check contract owner
    const owner = await contract.owner();
    console.log("Contract owner:", owner);
    console.log("Wallet address:", wallet.address);
    console.log("Is owner:", owner.toLowerCase() === wallet.address.toLowerCase());
    
    // Create a test auction with a very short duration (60 seconds)
    const duration = 60; // 1 minute
    const metadataCID = "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR"; // Test CID
    
    console.log("Creating auction with duration:", duration, "seconds");
    console.log("Metadata CID:", metadataCID);
    
    // Create the auction
    console.log("Sending transaction to create auction...");
    const tx = await contract.createAuction(duration, metadataCID);
    console.log("Transaction hash:", tx.hash);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Auction created successfully in block:", receipt.blockNumber);
    
    // Verify the auction was created
    const auctionDetails = await contract.getAuctionDetails();
    console.log("New Auction:", auctionDetails);
    
  } catch (error) {
    console.error("Error creating auction:", error.message);
    console.error("Error stack:", error.stack);
    
    // Try to get more details about the error
    if (error.transaction) {
      console.log("Failed transaction:", error.transaction);
    }
    if (error.receipt) {
      console.log("Transaction receipt:", error.receipt);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });