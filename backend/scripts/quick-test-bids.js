// scripts/quick-test-bids.js
// Quick script to test placing bids and finalizing auction

require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  console.log("=== QUICK AUCTION TEST ===");
  
  try {
    // Use the deployed contract address
    const contractAddress = "0xa302464338d513F4fe800B69d6C483ef981516f2";
    
    // Get RPC URL and private keys
    const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
    const ownerPrivateKey = process.env.PRIVATE_KEY || "0xb57e1b6cbbed376ed8d61d93c4eb052c1aeb365023a429e093b14c9b033b4060";
    
    console.log("Using RPC URL:", rpcUrl);
    console.log("Using contract address:", contractAddress);
    
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);
    
    console.log("Owner wallet address:", ownerWallet.address);
    
    // Get the ABI for the contract
    const contractArtifact = require('../artifacts/contracts/ZepoMINTFHEAuctionSmartFinalizeFixed.sol/ZepoMINTFHEAuctionSmartFinalizeFixed.json');
    const abi = contractArtifact.abi;
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, abi, ownerWallet);
    
    // Check if there's an active auction
    try {
      const auctionDetails = await contract.getAuctionDetails();
      console.log("Current auction details:");
      console.log("- Metadata CID:", auctionDetails.metadataCID);
      console.log("- End time:", new Date(auctionDetails.endTime * 1000).toString());
      console.log("- Finalized:", auctionDetails.finalized);
      console.log("- Initialized:", auctionDetails.initialized);
      
      if (!auctionDetails.initialized) {
        console.log("No auction found, creating one...");
        // Create an auction with 10 minutes duration
        const createTx = await contract.createAuction(600, "Qmeqz1z76iWZeFJugYiu1rNqbZUmFfV4wq6xkD63VFwma9");
        await createTx.wait();
        console.log("✅ Auction created successfully");
        return;
      }
      
      if (auctionDetails.finalized) {
        console.log("Auction already finalized");
        return;
      }
      
      const hasEnded = await contract.hasAuctionEnded();
      console.log("Auction has ended:", hasEnded);
      
      if (hasEnded) {
        console.log("Finalizing auction...");
        try {
          const finalizeTx = await contract.smartFinalize();
          const receipt = await finalizeTx.wait();
          console.log("✅ Auction finalized successfully");
          console.log("Transaction hash:", receipt.hash);
          
          // Check events
          const auctionFinalizedFilter = contract.filters.AuctionFinalized();
          const events = await contract.queryFilter(auctionFinalizedFilter, receipt.blockNumber, receipt.blockNumber);
          
          if (events.length > 0) {
            const event = events[0];
            console.log("Winner:", event.args.winner);
            console.log("Winning bid:", event.args.encryptedPrice);
          }
        } catch (error) {
          console.error("❌ Failed to finalize auction:", error.message);
          if (error.message.includes('revert')) {
            console.log("This might be due to FHE operations failing. The contract expects properly encrypted bid data.");
          }
        }
        return;
      }
      
      // Place a bid if auction is still active
      console.log("Placing a bid...");
      const dummyEncryptedAmount = ethers.hexlify(ethers.randomBytes(32));
      const dummyBidder = ethers.hexlify(ethers.randomBytes(32));
      const dummyAmountProof = ethers.hexlify(ethers.randomBytes(64));
      const dummyBidderProof = ethers.hexlify(ethers.randomBytes(64));
      
      const bidTx = await contract.submitBid(
        dummyEncryptedAmount,
        dummyBidder,
        dummyAmountProof,
        dummyBidderProof
      );
      const bidReceipt = await bidTx.wait();
      console.log("✅ Bid placed successfully");
      console.log("Transaction hash:", bidReceipt.hash);
      
    } catch (error) {
      console.error("❌ Error:", error.message);
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });