import React, { useState, useEffect } from 'react';

const RelayerDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    envVars: {},
    relayerStatus: 'pending',
    errors: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRelayerConfig = async () => {
      const info = { ...debugInfo };
      const errors = [];

      try {
        // Check environment variables
        info.envVars = {
          VITE_RELAYER_URL: import.meta.env.VITE_RELAYER_URL,
          VITE_KMS_VERIFIER_CONTRACT: import.meta.env.VITE_KMS_VERIFIER_CONTRACT,
          VITE_INPUT_VERIFIER_CONTRACT: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT,
          VITE_ACL_CONTRACT: import.meta.env.VITE_ACL_CONTRACT
        };

        console.log('Environment variables:', info.envVars);

        // Validate relayer URL
        if (!import.meta.env.VITE_RELAYER_URL) {
          errors.push('VITE_RELAYER_URL is not set');
        } else {
          try {
            new URL(import.meta.env.VITE_RELAYER_URL);
            console.log('Relayer URL is valid:', import.meta.env.VITE_RELAYER_URL);
          } catch (urlError) {
            errors.push(`Invalid relayer URL format: ${import.meta.env.VITE_RELAYER_URL}`);
          }
        }

        // Validate contract addresses
        const requiredContracts = [
          'VITE_KMS_VERIFIER_CONTRACT',
          'VITE_INPUT_VERIFIER_CONTRACT',
          'VITE_ACL_CONTRACT'
        ];

        for (const contract of requiredContracts) {
          if (!import.meta.env[contract]) {
            errors.push(`${contract} is not set`);
          } else if (!import.meta.env[contract].startsWith('0x') || import.meta.env[contract].length !== 42) {
            errors.push(`Invalid ${contract} format: ${import.meta.env[contract]}`);
          }
        }

        // Try to import and initialize the relayer SDK
        try {
          console.log('Attempting to import relayer SDK...');
          const { SepoliaConfig } = await import('@zama-fhe/relayer-sdk/web');
          console.log('SepoliaConfig:', SepoliaConfig);
          
          // Check if all required addresses are in SepoliaConfig
          const requiredConfigFields = [
            'kmsContractAddress',
            'aclContractAddress',
            'inputVerifierContractAddress'
          ];
          
          for (const field of requiredConfigFields) {
            if (!SepoliaConfig[field]) {
              errors.push(`Missing ${field} in SepoliaConfig`);
            }
          }
          
          info.relayerStatus = 'sdk_loaded';
          console.log('Relayer SDK loaded successfully');
        } catch (importError) {
          errors.push(`Failed to import relayer SDK: ${importError.message}`);
          console.error('Relayer SDK import error:', importError);
          info.relayerStatus = 'sdk_error';
        }

      } catch (error) {
        errors.push(`Configuration check failed: ${error.message}`);
        console.error('Configuration check error:', error);
      }

      info.errors = errors;
      setDebugInfo(info);
      setLoading(false);
    };

    checkRelayerConfig();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Relayer Debug Information</h2>
      
      {loading ? (
        <div className="text-center py-4">
          <p>Checking relayer configuration...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Environment Variables */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Environment Variables</h3>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(debugInfo.envVars).map(([key, value]) => (
                <div key={key} className="border p-3 rounded">
                  <div className="font-medium text-sm text-gray-600">{key}</div>
                  <div className="text-sm break-all mt-1">
                    {value || <span className="text-red-500">Not set</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Relayer Status */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Relayer Status</h3>
            <div className="border p-3 rounded">
              <div className="font-medium">
                Status: <span className={debugInfo.relayerStatus === 'sdk_loaded' ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo.relayerStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Errors */}
          {debugInfo.errors.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-red-600">Errors Found</h3>
              <div className="bg-red-50 border border-red-200 rounded p-4 space-y-2">
                {debugInfo.errors.map((error, index) => (
                  <div key={index} className="text-red-700 text-sm">
                    • {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {debugInfo.errors.length === 0 && !loading && debugInfo.relayerStatus === 'sdk_loaded' && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="text-green-700 font-medium">
                ✓ Relayer configuration appears to be correct!
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RelayerDebug;