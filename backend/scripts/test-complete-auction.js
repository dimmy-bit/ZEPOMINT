const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  // Configuration
  const contractAddress = "0xB9451B1fdD5CaBe38C1de2C64136ae47bb930725";
  console.log("=== Testing ZepoMINTFHEAuctionComplete Contract ===");
  console.log("Contract Address:", contractAddress);
  
  // Using Sepolia RPC URL from .env
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org");
  
  // Use the owner private key from .env
  const privateKey = process.env.PRIVATE_KEY || "0xb57e1b6cbbed376ed8d61d93c4eb052c1aeb365023a429e093b14c9b033b4060";
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Contract ABI - only include functions we need
  const abi = [
    "function createAuction(uint256 biddingDurationSeconds, string metadataCID)",
    "function getAuctionDetails() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, bool initialized))",
    "function owner() view returns (address)",
    "function smartFinalize()",
    "function getBidCount() view returns (uint256)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  try {
    console.log("Testing auction functionality...");
    
    // Check contract owner
    const owner = await contract.owner();
    console.log("Contract owner:", owner);
    console.log("Wallet address:", wallet.address);
    console.log("Is owner:", owner.toLowerCase() === wallet.address.toLowerCase());
    
    // Get current auction details
    const auctionDetails = await contract.getAuctionDetails();
    console.log("Current Auction:", {
      metadataCID: auctionDetails.metadataCID,
      endTime: new Date(parseInt(auctionDetails.endTime.toString()) * 1000).toLocaleString(),
      finalized: auctionDetails.finalized,
      initialized: auctionDetails.initialized
    });
    
    // Check if there's an existing auction that needs to be finalized
    if (auctionDetails.initialized && !auctionDetails.finalized) {
      const currentTime = Math.floor(Date.now() / 1000);
      const endTime = parseInt(auctionDetails.endTime.toString());
      
      console.log("Auction end time:", new Date(endTime * 1000).toLocaleString());
      console.log("Current time:", new Date(currentTime * 1000).toLocaleString());
      console.log("Auction ended:", endTime <= currentTime);
      
      if (endTime <= currentTime) {
        console.log("Auction has ended but not finalized. Attempting to finalize...");
        try {
          const tx = await contract.smartFinalize({
            gasLimit: 10000000
          });
          console.log("Finalization transaction sent:", tx.hash);
          await tx.wait();
          console.log("Auction finalized successfully!");
        } catch (finalizeError) {
          console.log("Could not finalize existing auction:", finalizeError.message);
        }
      } else {
        console.log("Cannot create new auction - existing auction still active");
        return;
      }
    }
    
    // Create a new auction if no active auction exists
    console.log("Creating a new test auction...");
    
    const duration = 3600; // 1 hour in seconds
    const metadataCID = "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR"; // Test CID
    
    const tx = await contract.createAuction(duration, metadataCID, {
      gasLimit: 10000000
    });
    
    console.log("Create auction transaction sent:", tx.hash);
    await tx.wait();
    console.log("Auction created successfully!");
    
    // Verify the auction was created
    const newAuctionDetails = await contract.getAuctionDetails();
    console.log("New Auction Details:", {
      metadataCID: newAuctionDetails.metadataCID,
      endTime: new Date(parseInt(newAuctionDetails.endTime.toString()) * 1000).toLocaleString(),
      finalized: newAuctionDetails.finalized,
      initialized: newAuctionDetails.initialized
    });
    
    console.log("✅ Complete auction functionality test completed successfully!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    // Try to decode revert reasons
    if (error.data) {
      try {
        const decodedError = ethers.AbiCoder.defaultAbiCoder().decode(['string'], `0x${error.data.slice(10)}`);
        console.log("Revert reason:", decodedError[0]);
      } catch (decodeError) {
        console.log("Could not decode revert reason");
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });