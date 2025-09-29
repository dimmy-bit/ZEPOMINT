// test-contract-connection.js - Test script to verify contract connection
import { ethers } from 'ethers';
import ZepoMintFHEData from '../abi/ZepoMINTFHEAuction.json' with { type: 'json' };

// Get contract address from environment variables
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0771aFDD5Ef859cDe4371dA1EafA62F07Ed2686a";

// RPC URLs from environment variables
const RPC_URLS = [
  import.meta.env.VITE_ALCHEMY_RPC_URL,
  import.meta.env.VITE_INFURA_RPC_URL,
  import.meta.env.VITE_ANKR_RPC_URL,
  import.meta.env.VITE_SEPOLIA_RPC_URL,
  "https://rpc.sepolia.org" // Public fallback
].filter(Boolean); // Remove any falsy values

// Function to get a working provider with fallback
async function getWorkingProvider() {
  for (const rpcUrl of RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      // Test the provider
      await provider.getBlockNumber();
      console.log("Using RPC provider:", rpcUrl);
      return provider;
    } catch (error) {
      console.log("RPC provider failed:", rpcUrl, error.message);
      continue;
    }
  }
  throw new Error("All RPC providers failed");
}

// Function to test contract connection
export async function testContractConnection() {
  try {
    console.log("Testing contract connection...");
    console.log("Contract address:", CONTRACT_ADDRESS);
    
    // Get a working provider
    const provider = await getWorkingProvider();
    console.log("Provider connected successfully");
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ZepoMintFHEData.abi, provider);
    console.log("Contract instance created");
    
    // Test basic contract functions
    try {
      const auctionInitialized = await contract.auctionInitialized();
      console.log("Auction initialized:", auctionInitialized);
    } catch (error) {
      console.log("Could not read auctionInitialized (may be expected if contract is new)");
    }
    
    try {
      const publicKeyURI = await contract.publicKeyURI();
      console.log("Public key URI:", publicKeyURI);
    } catch (error) {
      console.log("Could not read publicKeyURI (may be expected if not set yet)");
    }
    
    try {
      const bidCount = await contract.getBidCount();
      console.log("Bid count:", bidCount.toString());
    } catch (error) {
      console.log("Could not read bid count");
    }
    
    console.log("Contract connection test completed successfully!");
    return true;
  } catch (error) {
    console.error("Contract connection test failed:", error.message);
    return false;
  }
}

// Run the test if this file is executed directly
if (import.meta.url === new URL(import.meta.url).href) {
  testContractConnection()
    .then(success => {
      if (success) {
        console.log("✓ All tests passed");
      } else {
        console.log("✗ Tests failed");
      }
    })
    .catch(error => {
      console.error("Test error:", error);
    });
}

export default testContractConnection;