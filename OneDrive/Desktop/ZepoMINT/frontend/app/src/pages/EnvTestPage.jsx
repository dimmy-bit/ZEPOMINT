import React, { useEffect, useState } from 'react';
import { validateZamaRelayerConfig } from '../utils/env-validator';

const EnvTestPage = () => {
  const [envData, setEnvData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    // Log all environment variables
    console.log('All import.meta.env:', import.meta.env);
    
    // Set environment data
    setEnvData({
      VITE_RELAYER_URL: import.meta.env.VITE_RELAYER_URL,
      VITE_KMS_VERIFIER_CONTRACT: import.meta.env.VITE_KMS_VERIFIER_CONTRACT,
      VITE_INPUT_VERIFIER_CONTRACT: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT,
      VITE_ACL_CONTRACT: import.meta.env.VITE_ACL_CONTRACT,
      VITE_DECRYPTION_ORACLE_CONTRACT: import.meta.env.VITE_DECRYPTION_ORACLE_CONTRACT,
      VITE_FHEVM_EXECUTOR_CONTRACT: import.meta.env.VITE_FHEVM_EXECUTOR_CONTRACT,
      VITE_HCU_LIMIT_CONTRACT: import.meta.env.VITE_HCU_LIMIT_CONTRACT,
      VITE_CHAIN_ID: import.meta.env.VITE_CHAIN_ID,
      VITE_GATEWAY_CHAIN_ID: import.meta.env.VITE_GATEWAY_CHAIN_ID,
      VITE_NETWORK_URL: import.meta.env.VITE_NETWORK_URL,
      VITE_CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS,
      VITE_SEPOLIA_RPC_URL: import.meta.env.VITE_SEPOLIA_RPC_URL,
    });
    
    // Run validation
    const result = validateZamaRelayerConfig();
    setValidationResult(result);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Environment Variables Test</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Environment Variables</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {envData && Object.entries(envData).map(([key, value]) => (
            <div key={key} className="bg-white p-4 rounded-lg shadow border">
              <div className="font-semibold text-sm text-gray-600">{key}</div>
              <div className="mt-1 text-sm break-all">
                {value ? (
                  <span className="text-green-600">{value}</span>
                ) : (
                  <span className="text-red-500">NOT SET</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Validation Result</h2>
        {validationResult && (
          <div className={`p-4 rounded-lg ${validationResult.isValid ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
            <div className="font-semibold mb-2">
              Validation: {validationResult.isValid ? 'PASSED' : 'FAILED'}
            </div>
            {!validationResult.isValid && (
              <div className="text-red-700">
                Error: {validationResult.error}
              </div>
            )}
            {validationResult.isValid && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Configuration:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(validationResult.config).map(([key, value]) => (
                    <div key={key} className="bg-white p-2 rounded">
                      <span className="font-medium">{key}:</span> {value?.toString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvTestPage;