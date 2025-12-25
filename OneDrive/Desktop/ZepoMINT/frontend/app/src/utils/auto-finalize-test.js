// Simple test script to verify automatic finalization works
import { hasAuctionEnded, getCurrentAuction, computeWinner } from './contract-interaction';

/**
 * Test automatic finalization
 * @param {Object} provider - The ethers provider
 * @param {Object} signer - The signer for transactions
 */
export async function testAutoFinalization(provider, signer) {
  try {
    console.log("Testing automatic finalization...");
    
    // Check if auction has ended
    const ended = await hasAuctionEnded(provider);
    console.log("Auction ended:", ended);
    
    if (ended) {
      // Get current auction details
      const auction = await getCurrentAuction(provider);
      console.log("Current auction:", auction);
      
      if (auction && !auction.finalized) {
        console.log("Auction has ended but not finalized. Attempting to finalize...");
        
        // Try to compute winner
        const result = await computeWinner(signer);
        console.log("Compute winner result:", result);
        
        return { success: true, message: "Auction finalized successfully", result };
      } else if (auction && auction.finalized) {
        return { success: true, message: "Auction already finalized" };
      } else {
        return { success: false, message: "No active auction found" };
      }
    } else {
      return { success: true, message: "Auction has not ended yet" };
    }
  } catch (error) {
    console.error("Error in auto-finalization test:", error);
    return { success: false, message: "Error: " + error.message };
  }
}