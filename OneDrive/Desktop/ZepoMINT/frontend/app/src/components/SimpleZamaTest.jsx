import React, { useState, useEffect } from 'react';

const SimpleZamaTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testZamaSDK = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log("Testing Zama SDK with minimal configuration...");
      
      // Import the relayer SDK dynamically
      const { createInstance } = await import('@zama-fhe/relayer-sdk/web');
      
      // Use minimal configuration - only the relayer URL
      const config = {
        relayerUrl: import.meta.env.VITE_RELAYER_URL || "https://relayer.testnet.zama.cloud/",
      };
      
      console.log("Minimal configuration:", config);
      
      // Test creating an instance
      const instance = await createInstance(config);
      console.log("Instance created:", instance);
      
      // Test getting public key
      const publicKey = await instance.getPublicKey();
      console.log("Public key:", publicKey);
      
      setTestResult({
        success: true,
        message: 'Zama SDK is working correctly with minimal configuration!',
        config: config,
        publicKey: publicKey ? (publicKey.publicKey ? publicKey.publicKey.slice(0, 50) + '...' : publicKey.slice(0, 50) + '...') : 'N/A'
      });
    } catch (error) {
      console.error('Error testing Zama SDK:', error);
      console.error('Error stack:', error.stack);
      setTestResult({
        success: false,
        message: error.message,
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Simple Zama SDK Test</h2>
      
      {testResult && (
        <div className={`p-4 rounded mb-4 ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="font-semibold">{testResult.message}</p>
          {testResult.success && (
            <div className="mt-2 text-sm">
              <p><strong>Configuration:</strong> {JSON.stringify(testResult.config)}</p>
              <p><strong>Public Key:</strong> {testResult.publicKey}</p>
            </div>
          )}
          {!testResult.success && (
            <div className="mt-2 text-sm">
              <p><strong>Error Details:</strong> {testResult.error?.stack || testResult.error?.message}</p>
            </div>
          )}
        </div>
      )}
      
      <button
        onClick={testZamaSDK}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test Zama SDK (Minimal)'}
      </button>
    </div>
  );
};

export default SimpleZamaTest;