// test-contract-call.js
// Script to test the specific contract call that's failing
import { ethers } from 'ethers';
import ZepoMintFHEData from '../abi/ZepoMINTFHEAuction.json' with { type: 'json' };

async function testContractCall() {
  try {
    console.log("=== Testing Contract Call ===\n");
    
    // Use the same RPC URL as in the frontend
    const rpcUrl = "https://eth-sepolia.g.alchemy.com/v2/kEl3NhorDcbSNncThw3-PbyCrtJcFsKe";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Get contract address from environment
    const contractAddress = "0xf34d82595114409f8a68cA4C13e6Ae57D0EF1f6E";
    
    console.log("Contract Address:", contractAddress);
    console.log("RPC URL:", rpcUrl);
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, ZepoMintFHEData.abi, provider);
    
    console.log("\n1. Testing contract call with try-catch...");
    
    try {
      console.log("   Calling getAuctionDetails...");
      const result = await contract.getAuctionDetails();
      console.log("   Success! Result:", result);
      console.log("   Result type:", typeof result);
      console.log("   Is array:", Array.isArray(result));
      
      if (Array.isArray(result)) {
        console.log("   Array length:", result.length);
        result.forEach((item, index) => {
          console.log(`   [${index}]:`, item, `(type: ${typeof item})`);
        });
      }
    } catch (error) {
      console.log("   Error calling getAuctionDetails:");
      console.log("   Message:", error.message);
      console.log("   Code:", error.code);
      console.log("   Stack:", error.stack);
    }
    
    console.log("\n2. Testing contract call with manual decode...");
    
    try {
      // Try to call the function manually and see what we get
      const rawResult = await provider.call({
        to: contractAddress,
        data: contract.interface.encodeFunctionData("getAuctionDetails")
      });
      
      console.log("   Raw result:", rawResult);
      
      // Try to decode it manually
      const decoded = contract.interface.decodeFunctionResult("getAuctionDetails", rawResult);
      console.log("   Decoded result:", decoded);
    } catch (error) {
      console.log("   Error in manual call/decode:");
      console.log("   Message:", error.message);
      console.log("   Code:", error.code);
      console.log("   Stack:", error.stack);
    }
    
    console.log("\n=== Test Complete ===");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testContractCall();