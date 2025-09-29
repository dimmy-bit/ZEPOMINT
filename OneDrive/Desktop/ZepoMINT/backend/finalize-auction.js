const { ethers } = require('ethers');
const deploymentInfo = require('./deployments/zepamint-main-wallet-deployment.json');

async function main() {
  // Configuration
  const contractAddress = deploymentInfo.contractAddress;
  console.log("=== ZepoMINT FHE Auction Finalization ===");
  console.log("Contract Address:", contractAddress);
  
  // Using Sepolia RPC URL from .env
  const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/nik8koBXVHXoYthLsBz7ttQ6F27wkwj-");
  const privateKey = "0xb57e1b6cbbed376ed8d61d93c4eb052c1aeb365023a429e093b14c9b033b4060"; // Using private key from .env
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Contract ABI - only include functions we need
  const abi = [
    "function computeWinnerOnChain()",
    "function getAuctionDetails() view returns (tuple(string metadataCID, uint256 endTime, bool finalized, bool initialized))",
    "function getBidCount() view returns (uint256)",
    "event AuctionFinalized(bytes32 winner, bytes32 encryptedPrice, uint256 winnerIndex)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  try {
    console.log("Checking current auction status...");
    
    // Get current auction details
    const auctionDetails = await contract.getAuctionDetails();
    console.log("Current Auction:", auctionDetails);
    console.log("Auction finalized:", auctionDetails.finalized);
    console.log("Auction initialized:", auctionDetails.initialized);
    
    if (!auctionDetails.initialized) {
      console.log("No auction is initialized");
      return;
    }
    
    if (auctionDetails.finalized) {
      console.log("Auction is already finalized");
      return;
    }
    
    // Check if auction has ended
    const endTime = parseInt(auctionDetails.endTime.toString());
    const currentTime = Math.floor(Date.now() / 1000);
    
    console.log("Auction end time:", new Date(endTime * 1000).toLocaleString());
    console.log("Current time:", new Date(currentTime * 1000).toLocaleString());
    
    if (endTime >= currentTime) {
      console.log("Auction has not ended yet. Cannot finalize.");
      return;
    }
    
    console.log("Auction has ended. Finalizing...");
    
    // Get bid count
    const bidCount = await contract.getBidCount();
    console.log("Bid count:", bidCount.toString());
    
    if (bidCount.toString() === "0") {
      console.log("No bids submitted. Cannot finalize.");
      return;
    }
    
    // Finalize the auction with a fixed gas limit to bypass gas estimation issues
    console.log("Sending transaction to finalize auction with fixed gas limit...");
    const tx = await contract.computeWinnerOnChain({
      gasLimit: 5000000 // High gas limit to ensure the transaction has enough gas
    });
    
    console.log("Raw transaction response:", tx);
    
    // Handle various possible transaction response formats for FHE contracts
    let txHash = null;
    
    // Different ways the transaction hash might be available
    if (tx && tx.hash) {
      txHash = tx.hash;
    } else if (tx && tx.transactionHash) {
      txHash = tx.transactionHash;
    } else if (tx && typeof tx === 'string' && tx.startsWith('0x') && tx.length === 66) {
      // If the function directly returns the transaction hash
      txHash = tx;
    } else if (tx && typeof tx === 'object') {
      // Try to find any property that looks like a hash
      for (const key in tx) {
        if (typeof tx[key] === 'string' && tx[key].startsWith('0x') && tx[key].length === 66) {
          txHash = tx[key];
          break;
        }
      }
    }
    
    // Special handling for FHE contracts
    if (!txHash) {
      console.log("No immediate transaction hash found. This is common with FHE contracts.");
      console.log("Will try to get transaction hash by waiting for receipt...");
      
      // Try to get receipt
      try {
        if (tx && typeof tx.wait === 'function') {
          // Wait for 1 confirmation
          const receipt = await tx.wait(1);
          console.log("Transaction receipt:", receipt);
          if (receipt && (receipt.hash || receipt.transactionHash)) {
            txHash = receipt.hash || receipt.transactionHash;
            console.log("Got transaction hash from receipt:", txHash);
          }
        }
      } catch (waitError) {
        console.log("Error waiting for transaction receipt:", waitError);
      }
    }
    
    // If we still don't have a hash, it's possible the transaction was sent
    if (!txHash) {
      console.log("Transaction sent but no hash found. This is normal for FHE contracts.");
      console.log("Check the blockchain for the transaction using your wallet address:");
      console.log("Wallet address:", wallet.address);
      console.log("Visit: https://sepolia.etherscan.io/address/" + wallet.address);
      console.log("Look for recent transactions calling computeWinnerOnChain");
      return;
    }
    
    console.log("Transaction hash:", txHash);
    
    // Wait for the transaction to be mined
    try {
      const receipt = await tx.wait();
      console.log("Auction finalized successfully in block:", receipt.blockNumber);
    } catch (waitError) {
      console.log("Transaction sent successfully, but error waiting for confirmation:", waitError);
      console.log("Check Etherscan to verify the transaction was processed:");
      console.log("https://sepolia.etherscan.io/tx/" + txHash);
    }
    
    // Verify finalization
    const updatedAuction = await contract.getAuctionDetails();
    console.log("Updated Auction:", updatedAuction);
    console.log("Auction finalized:", updatedAuction.finalized);
    
    if (updatedAuction.finalized) {
      console.log("✅ Auction successfully finalized!");
    } else {
      console.log("⚠️  Auction may not be finalized. Check Etherscan for transaction status.");
    }
    
  } catch (error) {
    console.error("Error finalizing auction:", error.message);
    console.error("Error stack:", error.stack);
    
    // Try to get more details about the error
    if (error.transaction) {
      console.log("Failed transaction:", error.transaction);
    }
    if (error.receipt) {
      console.log("Transaction receipt:", error.receipt);
    }
    
    // Check if it's a gas estimation issue
    if (error.message.includes("gas") || error.message.includes("estimate")) {
      console.log("This error might be due to gas estimation issues. Try increasing the gas limit.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });