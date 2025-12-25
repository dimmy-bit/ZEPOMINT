// test-wagmi-integration.js
// Script to test contract interaction with wagmi provider conversion
import { ethers } from 'ethers';
import ZepoMintFHEData from '../abi/ZepoMINTFHEAuctionSmartFinalizeFixed.json' with { type: 'json' };
import { getEthersProviderFromWagmi } from './wagmi-provider-helper.js';

// Mock wagmi provider for testing
const mockWagmiProvider = {
  request: async (params) => {
    console.log("Mock wagmi provider request:", params);
    // For testing, we'll create a real provider and forward the request
    const rpcUrl = import.meta.env.VITE_NETWORK_URL || "https://rpc.sepolia.org";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    try {
      const result = await provider.send(params.method, params.params || []);
      console.log("Request result:", result);
      return result;
    } catch (error) {
      console.log("Request error:", error.message);
      throw error;
    }
  }
};

async function testWagmiIntegration() {
  try {
    console.log("=== Testing Wagmi Integration ===\n");
    
    // Test provider conversion
    console.log("1. Testing provider conversion...");
    const ethersProvider = getEthersProviderFromWagmi(mockWagmiProvider);
    console.log("   Converted provider type:", typeof ethersProvider);
    console.log("   Is ethers provider:", ethersProvider._isProvider);
    
    // Test contract interaction
    console.log("\n2. Testing contract interaction...");
    const contractAddress = "0xf34d82595114409f8a68cA4C13e6Ae57D0EF1f6E";
    
    try {
      const contract = new ethers.Contract(contractAddress, ZepoMintFHEData.abi, ethersProvider);
      console.log("   Contract created successfully");
      
      const auctionDetails = await contract.getAuctionDetails();
      console.log("   Auction details:", auctionDetails);
      
      // Process the auction details like in our fixed functions
      let processedAuctionDetails;
      
      if (Array.isArray(auctionDetails)) {
        processedAuctionDetails = {
          metadataCID: auctionDetails[0],
          endTime: auctionDetails[1],
          finalized: auctionDetails[2],
          initialized: auctionDetails[3]
        };
      } else if (typeof auctionDetails === 'object' && auctionDetails !== null) {
        processedAuctionDetails = auctionDetails;
      } else {
        console.error("Unexpected auction details format:", auctionDetails);
        return;
      }
      
      console.log("   Processed auction details:", processedAuctionDetails);
      
      // Test creating auction object like in our fixed function
      const auction = {
        endTime: processedAuctionDetails.endTime?.toString ? processedAuctionDetails.endTime.toString() : processedAuctionDetails.endTime,
        metadataCID: processedAuctionDetails.metadataCID?.toString ? processedAuctionDetails.metadataCID.toString() : processedAuctionDetails.metadataCID,
        finalized: !!processedAuctionDetails.finalized,
        initialized: !!processedAuctionDetails.initialized
      };
      
      console.log("   Final auction object:", auction);
      
    } catch (error) {
      console.log("   Error in contract interaction:", error.message);
      console.log("   Error stack:", error.stack);
    }
    
    console.log("\n=== Test Complete ===");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testWagmiIntegration();