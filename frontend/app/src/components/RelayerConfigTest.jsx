import React, { useState, useEffect } from 'react';

const RelayerConfigTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testRelayerConfig = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      // Log environment variables for debugging
      console.log('Environment variables:');
      console.log('VITE_RELAYER_URL:', import.meta.env.VITE_RELAYER_URL);
      console.log('VITE_KMS_VERIFIER_CONTRACT:', import.meta.env.VITE_KMS_VERIFIER_CONTRACT);
      console.log('VITE_ACL_CONTRACT:', import.meta.env.VITE_ACL_CONTRACT);
      console.log('VITE_INPUT_VERIFIER_CONTRACT:', import.meta.env.VITE_INPUT_VERIFIER_CONTRACT);
      
      // Import the relayer SDK dynamically
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
        network: import.meta.env.VITE_NETWORK_URL || 'https://rpc.sepolia.org'
      };
      
      console.log('Relayer configuration:', config);
      
      // Test creating an instance
      const instance = await createInstance(config);
      console.log('Relayer instance created:', instance);
      
      // Test getting public key
      const publicKey = await instance.getPublicKey();
      console.log('Public key:', publicKey);
      
      setTestResult({
        success: true,
        message: 'Relayer configuration is working correctly!',
        config: config,
        publicKey: publicKey ? (publicKey.publicKey ? publicKey.publicKey.slice(0, 50) + '...' : publicKey.slice(0, 50) + '...') : 'N/A'
      });
    } catch (error) {
      console.error('Error testing relayer configuration:', error);
      setTestResult({
        success: false,
        message: error.message,
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testRelayerConfig();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Relayer Configuration Test</h2>
      
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Testing relayer configuration...</p>
        </div>
      )}
      
      {testResult && (
        <div className={`p-4 rounded ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="font-semibold">{testResult.message}</p>
          
          {testResult.success && (
            <div className="mt-3 text-sm">
              <p><strong>Relayer URL:</strong> {testResult.config.relayerUrl}</p>
              <p><strong>KMS Contract:</strong> {testResult.config.kmsContractAddress}</p>
              <p><strong>Public Key:</strong> {testResult.publicKey}</p>
            </div>
          )}
          
          {!testResult.success && (
            <div className="mt-3 text-sm">
              <p><strong>Error Details:</strong> {testResult.error?.stack || testResult.error?.message}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4">
        <button
          onClick={testRelayerConfig}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Relayer Config'}
        </button>
      </div>
    </div>
  );
};

export default RelayerConfigTest;