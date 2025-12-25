import React, { useState, useEffect } from 'react';

const RelayerTestReal = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testRelayerReal = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log("Testing relayer in real browser environment...");
      
      // Import the relayer SDK dynamically
      const { createInstance } = await import('@zama-fhe/relayer-sdk/web');
      
      // Create configuration with environment variables
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
        hcuLimitContract: import.meta.env.VITE_HCU_LIMIT_CONTRACT || '0x594BB474275918AF9609814E68C61B1587c5F838'
      };
      
      console.log("Relayer configuration:", config);
      
      // Test creating an instance
      const instance = await createInstance(config);
      console.log("Relayer instance created:", instance);
      
      // Test getting public key
      const publicKey = await instance.getPublicKey();
      console.log("Public key:", publicKey);
      
      // Test encrypting a small value
      const contractAddress = "0x1a68a637f729e431dAAF33F20Df7f86c9A885f8c";
      const userAddress = "0x20dcd85aC3d79D97E1eC05375c45f4d94dD9371a";
      
      console.log("Creating encrypted input...");
      const encryptedInput = instance.createEncryptedInput(contractAddress, userAddress);
      encryptedInput.add128(BigInt(1000000000000000000n)); // 1 ETH in wei
      
      console.log("Encrypting input...");
      const encryptedData = await encryptedInput.encrypt();
      console.log("Encrypted data:", {
        handleLength: encryptedData.handles[0].length,
        proofLength: encryptedData.inputProof.length
      });
      
      setTestResult({
        success: true,
        message: 'Relayer is working correctly in browser environment!',
        config: config,
        publicKey: publicKey ? (publicKey.publicKey ? publicKey.publicKey.slice(0, 50) + '...' : publicKey.slice(0, 50) + '...') : 'N/A',
        encryption: {
          handleLength: encryptedData.handles[0].length,
          proofLength: encryptedData.inputProof.length
        }
      });
    } catch (error) {
      console.error('Error testing relayer:', error);
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
    testRelayerReal();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Real Relayer Test (Browser Environment)</h2>
      
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Testing relayer in browser environment...</p>
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
              <p><strong>Encryption Test:</strong> Handle ({testResult.encryption.handleLength} bytes), Proof ({testResult.encryption.proofLength} bytes)</p>
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
          onClick={testRelayerReal}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Relayer (Real)'}
        </button>
      </div>
    </div>
  );
};

export default RelayerTestReal;