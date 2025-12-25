import React, { useEffect, useState } from 'react';

const EnvDebug = () => {
  const [envData, setEnvData] = useState({});
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    // Log all environment variables
    console.log('All environment variables:', import.meta.env);
    
    // Set env data for display
    setEnvData(import.meta.env);
    
    // Validate environment variables
    const validateEnv = () => {
      const requiredVars = [
        'VITE_RELAYER_URL',
        'VITE_KMS_VERIFIER_CONTRACT',
        'VITE_INPUT_VERIFIER_CONTRACT',
        'VITE_ACL_CONTRACT',
        'VITE_DECRYPTION_ORACLE_CONTRACT',
        'VITE_FHEVM_EXECUTOR_CONTRACT',
        'VITE_HCU_LIMIT_CONTRACT'
      ];
      
      const missingVars = [];
      const presentVars = {};
      
      for (const varName of requiredVars) {
        const value = import.meta.env[varName];
        if (!value || value === '') {
          missingVars.push(varName);
        } else {
          presentVars[varName] = value;
        }
      }
      
      return {
        isValid: missingVars.length === 0,
        missingVars,
        presentVars
      };
    };
    
    setValidationResult(validateEnv());
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Environment Variables Debug</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold">All Environment Variables:</h3>
        <pre className="bg-white p-2 rounded text-xs overflow-auto">
          {JSON.stringify(envData, null, 2)}
        </pre>
      </div>
      
      {validationResult && (
        <div>
          <h3 className="font-semibold">Validation Result:</h3>
          <div className={`p-2 rounded ${validationResult.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
            <p>Status: {validationResult.isValid ? 'All required variables present' : 'Missing variables'}</p>
            {!validationResult.isValid && (
              <div>
                <p className="font-semibold">Missing variables:</p>
                <ul className="list-disc pl-5">
                  {validationResult.missingVars.map(varName => (
                    <li key={varName} className="text-red-600">{varName}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-2">
              <p className="font-semibold">Present variables:</p>
              <ul className="list-disc pl-5">
                {Object.entries(validationResult.presentVars).map(([key, value]) => (
                  <li key={key}>
                    <span className="font-mono">{key}:</span> {value}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvDebug;