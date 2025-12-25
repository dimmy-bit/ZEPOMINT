// test-auction-display.js
import { ethers } from 'ethers';
import ZepoMintFHEData from '../abi/ZepoMINTFHEAuctionSmartFinalizeFixed.json' with { type: 'json' };
import { getCurrentAuction, getBidCount, hasAuctionEnded } from './contract-interaction.js';

async function testAuctionDisplay() {
  try {
    // Use the same RPC URL as in the frontend
    const rpcUrl = import.meta.env.VITE_NETWORK_URL || "https://rpc.sepolia.org";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    console.log("Testing auction display with provider:", provider);
    
    // Test getting current auction
    const auction = await getCurrentAuction(provider);
    console.log("Current auction:", auction);
    
    // Test getting bid count
    const bidCount = await getBidCount(provider);
    console.log("Bid count:", bidCount);
    
    // Test checking if auction has ended
    const hasEnded = await hasAuctionEnded(provider);
    console.log("Has ended:", hasEnded);
    
  } catch (error) {
    console.error("Error in test:", error);
  }
}

// Run the test
testAuctionDisplay();