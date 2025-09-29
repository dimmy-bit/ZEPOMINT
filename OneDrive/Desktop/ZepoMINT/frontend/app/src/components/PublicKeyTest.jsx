import React, { useState, useEffect } from 'react';

const PublicKeyTest = () => {
  const [publicKey, setPublicKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testPublicKey = async () => {
    setLoading(true);
    setError(null);
    try {
      // Import the relayer SDK
      const { createInstance } = await import('@zama-fhe/relayer-sdk/web');
      
      // Create instance with configuration
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
      
      const instance = await createInstance(config);
      
      // Get public key
      const key = await instance.getPublicKey();
      setPublicKey(key);
    } catch (err) {
      console.error('Error getting public key:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testPublicKey();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Public Key Test</h2>
      
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Fetching public key...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {publicKey && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p><strong>Public Key Retrieved Successfully!</strong></p>
          <p className="font-mono text-sm mt-2 break-all">{publicKey}</p>
        </div>
      )}
      
      <div className="mt-4">
        <button
          onClick={testPublicKey}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Public Key'}
        </button>
      </div>
    </div>
  );
};

export default PublicKeyTest;