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
      const { createInstance, SepoliaConfig } = await import('@zama-fhe/relayer-sdk/web');
      
      // Create instance with configuration
      const config = {
        ...SepoliaConfig,
        relayerUrl: import.meta.env.VITE_RELAYER_URL || SepoliaConfig.relayerUrl,
        kmsContractAddress: import.meta.env.VITE_KMS_VERIFIER_CONTRACT || SepoliaConfig.kmsContractAddress,
        aclContractAddress: import.meta.env.VITE_ACL_CONTRACT || SepoliaConfig.aclContractAddress,
        inputVerifierContractAddress: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT || SepoliaConfig.inputVerifierContractAddress
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