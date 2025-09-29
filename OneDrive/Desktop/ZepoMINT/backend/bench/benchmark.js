/**
 * ZepoMint Benchmarking Script
 * 
 * This script benchmarks the performance of the ZepoMintFHE contract
 * under various conditions to measure gas costs and execution times.
 */

const { ethers } = require("hardhat");
const { FHE } = require("fhevmjs");

async function main() {
  console.log("Starting ZepoMint Benchmarking...");
  
  // Get signers
  const [owner, bidder1, bidder2, bidder3] = await ethers.getSigners();
  
  // Deploy contract
  console.log("Deploying ZepoMintFHE contract...");
  const ZepoMintFHE = await ethers.getContractFactory("ZepoMintFHE");
  const zepoMintFHE = await ZepoMintFHE.deploy();
  await zepoMintFHE.deployed();
  console.log("Contract deployed at:", zepoMintFHE.address);
  
  // Benchmark 1: Auction creation
  console.log("\n=== Benchmark 1: Auction Creation ===");
  const duration = 3600; // 1 hour
  const metadataCID = "QmBenchmarkCID";
  
  const createAuctionTx = await zepoMintFHE.createAuction(duration, metadataCID);
  const createAuctionReceipt = await createAuctionTx.wait();
  
  console.log("Gas used for auction creation:", createAuctionReceipt.gasUsed.toString());
  
  // Benchmark 2: Bid submission (with different numbers of bids)
  console.log("\n=== Benchmark 2: Bid Submission ===");
  
  // Test with 1, 10, 100, 1000 bids
  const bidCounts = [1, 10, 100];
  const bidders = [bidder1, bidder2, bidder3];
  
  for (const bidCount of bidCounts) {
    console.log(`\nTesting with ${bidCount} bids:`);
    
    // Submit bids
    const bidPromises = [];
    const startTime = Date.now();
    
    for (let i = 0; i < bidCount; i++) {
      const bidder = bidders[i % bidders.length];
      
      // In a real benchmark, we would create actual encrypted bids
      // For now, we'll just measure the transaction overhead
      const bidPromise = zepoMintFHE.connect(bidder).submitBid(
        ethers.utils.hexZeroPad(ethers.utils.hexlify(i + 1), 32),
        "0x" + "00".repeat(64) // Placeholder proof
      );
      
      bidPromises.push(bidPromise);
    }
    
    // Wait for all bids to be submitted
    const bidReceipts = await Promise.all(bidPromises.map(p => p.then(tx => tx.wait())));
    const endTime = Date.now();
    
    // Calculate total gas used
    const totalGas = bidReceipts.reduce((sum, receipt) => sum.add(receipt.gasUsed), ethers.BigNumber.from(0));
    const avgGasPerBid = totalGas.div(bidCount);
    const totalTime = endTime - startTime;
    
    console.log(`  Total gas used: ${totalGas.toString()}`);
    console.log(`  Average gas per bid: ${avgGasPerBid.toString()}`);
    console.log(`  Total time: ${totalTime}ms`);
    console.log(`  Average time per bid: ${(totalTime / bidCount).toFixed(2)}ms`);
  }
  
  // Benchmark 3: Auction finalization
  console.log("\n=== Benchmark 3: Auction Finalization ===");
  
  // Fast forward time to end the auction
  await ethers.provider.send("evm_increaseTime", [3601]);
  await ethers.provider.send("evm_mine");
  
  // Get bid count before finalization
  const bidCount = await zepoMintFHE.getBidCount();
  console.log(`Finalizing auction with ${bidCount} bids`);
  
  const finalizeTx = await zepoMintFHE.computeWinnerOnChain();
  const finalizeReceipt = await finalizeTx.wait();
  
  console.log("Gas used for auction finalization:", finalizeReceipt.gasUsed.toString());
  
  // Benchmark 4: HCU usage estimation
  console.log("\n=== Benchmark 4: HCU Usage Estimation ===");
  
  // Based on Zama documentation, estimate HCU usage
  // This is a simplified estimation - in practice, you would need to analyze
  // the actual FHE operations performed
  
  console.log("Estimated HCU usage:");
  console.log("  Auction creation: Minimal (no FHE operations)");
  console.log("  Bid submission: Minimal (no FHE operations in submitBid)");
  console.log(`  Auction finalization with ${bidCount} bids:`);
  console.log("    - FHE.gt operations: ~55,000 HCU per comparison");
  console.log("    - FHE.select operations: ~55,000 HCU per selection");
  console.log("    - Total estimated HCU: Variable based on bid count");
  
  console.log("\nBenchmarking complete!");
}

// Run the benchmark
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });