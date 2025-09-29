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
    
    // Import and test relayer SDK
    console.log("Testing relayer SDK import...");
    const { SepoliaConfig } = await import('@zama-fhe/relayer-sdk/web');
    
    console.log("SepoliaConfig:", SepoliaConfig);
    
    // Test configuration
    const config = {
      ...SepoliaConfig,
      relayerUrl,
      kmsContractAddress
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