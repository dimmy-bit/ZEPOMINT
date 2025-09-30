import React, { useState, useEffect } from 'react';

const RelayerSDKTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const testRelayerSDK = async () => {
    setLoading(true);
    try {
      // Dynamically import the relayer SDK to avoid build issues
      const { createInstance } = await import('@zama-fhe/relayer-sdk/web');
      
      // Create configuration with explicit values only
      const config = {
        chainId: parseInt(import.meta.env.VITE_CHAIN_ID) || 11155111,
        gatewayChainId: parseInt(import.meta.env.VITE_GATEWAY_CHAIN_ID) || 55815,
        relayerUrl: import.meta.env.VITE_RELAYER_URL || 'https://relayer.testnet.zama.cloud/',
        kmsContractAddress: import.meta.env.VITE_KMS_VERIFIER_CONTRACT || '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
        aclContractAddress: import.meta.env.VITE_ACL_CONTRACT || '0x687820221192C5B662b25367F70076A37bc79b6c',
        inputVerifierContractAddress: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT || '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
        verifyingContractAddressDecryption: import.meta.env.VITE_DECRYPTION_ORACLE_CONTRACT || '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
        verifyingContractAddressInputVerification: import.meta.env.VITE_INPUT_VERIFICATION_CONTRACT || '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
        fhevmExecutorContract: import.meta.env.VITE_FHEVM_EXECUTOR_CONTRACT || '0x848B0066793BcC60346Da1F49049357399B8D595',
        hcuLimitContract: import.meta.env.VITE_HCU_LIMIT_CONTRACT || '0x594BB474275918AF9609814E68C61B1587c5F838',
        network: import.meta.env.VITE_NETWORK_URL || 'https://eth-sepolia.g.alchemy.com/v2/JkwlX2jl-1k1wTZQPFHuC-YYuLcoldZk'
      };
      
      console.log('Configuration:', config);
      
      // Test creating an instance
      const instance = await createInstance(config);
      console.log('Instance created:', instance);
      
      setTestResults({
        success: true,
        message: 'Relayer SDK is working correctly!',
        instanceKeys: Object.keys(instance)
      });
    } catch (error) {
      console.error('Error testing Relayer SDK:', error);
      setTestResults({
        success: false,
        message: error.message,
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testRelayerSDK();
  }, []);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Relayer SDK Test</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <p>Testing Relayer SDK...</p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          </div>
        ) : testResults ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className={`p-4 rounded ${testResults.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p className="font-semibold">{testResults.message}</p>
            </div>
            
            {testResults.success && (
              <div className="mt-4">
                <h3 className="font-medium">Instance Methods:</h3>
                <ul className="list-disc pl-5 mt-2">
                  {testResults.instanceKeys.map((key, index) => (
                    <li key={index} className="text-sm">{key}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={testRelayerSDK}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Test Again'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>Click "Test Again" to run the test</p>
            <button
              onClick={testRelayerSDK}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              Test Relayer SDK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelayerSDKTest;