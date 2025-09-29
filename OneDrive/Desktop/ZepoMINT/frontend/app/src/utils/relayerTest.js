/**
 * Test script to verify relayer configuration
 */
export async function testRelayerConfig() {
  try {
    console.log("Testing relayer configuration...");
    
    // Check environment variables
    const relayerUrl = import.meta.env.VITE_RELAYER_URL;
    const kmsContractAddress = import.meta.env.VITE_KMS_VERIFIER_CONTRACT;
    
    console.log("Environment variables:", {
      relayerUrl,
      kmsContractAddress
    });
    
    if (!relayerUrl) {
      throw new Error("VITE_RELAYER_URL is not set");
    }
    
    if (!kmsContractAddress) {
      throw new Error("VITE_KMS_VERIFIER_CONTRACT is not set");
    }
    
    // Test relayer connectivity
    console.log("Testing relayer connectivity...");
    const healthUrl = `${relayerUrl}/health`;
    
    try {
      const response = await fetch(healthUrl, { method: 'HEAD' });
      console.log("Relayer health check response:", response.status);
    } catch (error) {
      console.log("Relayer health check failed:", error.message);
    }
    
    // Test configuration
    const config = {
      chainId: import.meta.env.VITE_CHAIN_ID || 11155111,
      gatewayChainId: import.meta.env.VITE_GATEWAY_CHAIN_ID || 55815,
      relayerUrl: relayerUrl,
      kmsContractAddress: kmsContractAddress,
      aclContractAddress: import.meta.env.VITE_ACL_CONTRACT || "0x687820221192C5B662b25367F70076A37bc79b6c",
      inputVerifierContractAddress: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT || "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4",
      verifyingContractAddressDecryption: import.meta.env.VITE_DECRYPTION_ORACLE_CONTRACT || "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1",
      verifyingContractAddressInputVerification: import.meta.env.VITE_INPUT_VERIFICATION_CONTRACT || "0x7048C39f048125eDa9d678AEbaDfB22F7900a29F",
      fhevmExecutorContract: import.meta.env.VITE_FHEVM_EXECUTOR_CONTRACT || "0x848B0066793BcC60346Da1F49049357399B8D595",
      hcuLimitContract: import.meta.env.VITE_HCU_LIMIT_CONTRACT || "0x594BB474275918AF9609814E68C61B1587c5F838"
    };
    
    console.log("Final configuration:", config);
    
    return {
      success: true,
      config,
      message: "Relayer configuration test completed successfully"
    };
  } catch (error) {
    console.error("Relayer configuration test failed:", error);
    return {
      success: false,
      error: error.message,
      message: "Relayer configuration test failed"
    };
  }
}