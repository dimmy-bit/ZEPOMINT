import React, { useEffect, useState } from 'react';

const EnvVarTest = () => {
  const [envVars, setEnvVars] = useState({});

  useEffect(() => {
    // Log environment variables to console
    console.log('Environment variables in browser:', import.meta.env);
    
    // Set state with environment variables
    setEnvVars({
      VITE_RELAYER_URL: import.meta.env.VITE_RELAYER_URL,
      VITE_KMS_VERIFIER_CONTRACT: import.meta.env.VITE_KMS_VERIFIER_CONTRACT,
      VITE_INPUT_VERIFIER_CONTRACT: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT,
      VITE_ACL_CONTRACT: import.meta.env.VITE_ACL_CONTRACT,
      allEnv: import.meta.env
    });
  }, []);

  return (
    <div className="p-4 bg-yellow-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Environment Variable Test</h3>
      <div className="text-sm">
        <p>VITE_RELAYER_URL: {envVars.VITE_RELAYER_URL || 'NOT SET'}</p>
        <p>VITE_KMS_VERIFIER_CONTRACT: {envVars.VITE_KMS_VERIFIER_CONTRACT || 'NOT SET'}</p>
        <p>VITE_INPUT_VERIFIER_CONTRACT: {envVars.VITE_INPUT_VERIFIER_CONTRACT || 'NOT SET'}</p>
        <p>VITE_ACL_CONTRACT: {envVars.VITE_ACL_CONTRACT || 'NOT SET'}</p>
      </div>
      <button 
        onClick={() => console.log('Current env vars:', import.meta.env)}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
      >
        Log Env Vars to Console
      </button>
    </div>
  );
};

export default EnvVarTest;