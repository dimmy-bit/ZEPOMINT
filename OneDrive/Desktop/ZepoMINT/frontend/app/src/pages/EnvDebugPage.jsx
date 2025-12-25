import React, { useState, useEffect } from 'react';
import { debugEnvironmentVariables, validateZamaRelayerConfig } from '../utils/env-validator';

const EnvDebugPage = () => {
  const [envData, setEnvData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // Run debug function
    debugEnvironmentVariables();
    
    // Set env data
    setEnvData(import.meta.env);
    
    // Run validation
    const result = validateZamaRelayerConfig();
    setValidationResult(result);
    
    // Capture console output
    const originalLog = console.log;
    let logs = '';
    
    console.log = function(...args) {
      logs += args.join(' ') + '\n';
      originalLog.apply(console, args);
    };
    
    // Run debug again to capture output
    debugEnvironmentVariables();
    
    // Restore console.log
    console.log = originalLog;
    setDebugInfo(logs);
  }, []);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Environment Variables Debug</h1>
        
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">All Environment Variables</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm overflow-auto max-h-96">
              {JSON.stringify(envData, null, 2)}
            </pre>
          </div>
        </div>
        
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Zama Relayer Configuration Validation</h2>
          {validationResult ? (
            <div className={`p-4 rounded-lg ${validationResult.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-semibold">
                Status: {validationResult.isValid ? '✅ Valid' : '❌ Invalid'}
              </p>
              {validationResult.isValid ? (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Configuration Details:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Relayer URL: {validationResult.config.relayerUrl}</li>
                    <li>KMS Contract: {validationResult.config.kmsContractAddress}</li>
                    <li>Network URL: {validationResult.config.networkUrl}</li>
                    <li>Chain ID: {validationResult.config.chainId}</li>
                    <li>Gateway Chain ID: {validationResult.config.gatewayChainId}</li>
                  </ul>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-red-700">Error: {validationResult.error}</p>
                </div>
              )}
            </div>
          ) : (
            <p>Loading validation result...</p>
          )}
        </div>
        
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {debugInfo || 'No debug information available'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvDebugPage;