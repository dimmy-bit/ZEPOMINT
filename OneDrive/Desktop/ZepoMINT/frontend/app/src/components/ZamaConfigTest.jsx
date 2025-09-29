import React, { useState, useEffect } from 'react';

const ZamaConfigTest = () => {
  const [configStatus, setConfigStatus] = useState({
    envVars: {},
    contractAddresses: {},
    relayerStatus: 'pending',
    ipfsStatus: 'pending',
    errors: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConfiguration = async () => {
      const status = { ...configStatus };
      const errors = [];

      try {
        // Check environment variables
        status.envVars = {
          VITE_RELAYER_URL: import.meta.env.VITE_RELAYER_URL,
          VITE_KMS_VERIFIER_CONTRACT: import.meta.env.VITE_KMS_VERIFIER_CONTRACT,
          VITE_INPUT_VERIFIER_CONTRACT: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT,
          VITE_ACL_CONTRACT: import.meta.env.VITE_ACL_CONTRACT,
          VITE_DECRYPTION_ORACLE_CONTRACT: import.meta.env.VITE_DECRYPTION_ORACLE_CONTRACT,
          VITE_FHEVM_EXECUTOR_CONTRACT: import.meta.env.VITE_FHEVM_EXECUTOR_CONTRACT,
          VITE_HCU_LIMIT_CONTRACT: import.meta.env.VITE_HCU_LIMIT_CONTRACT
        };

        // Check if all required env vars are present
        const requiredEnvVars = [
          'VITE_RELAYER_URL',
          'VITE_KMS_VERIFIER_CONTRACT',
          'VITE_INPUT_VERIFIER_CONTRACT',
          'VITE_ACL_CONTRACT',
          'VITE_DECRYPTION_ORACLE_CONTRACT',
          'VITE_FHEVM_EXECUTOR_CONTRACT',
          'VITE_HCU_LIMIT_CONTRACT'
        ];

        for (const envVar of requiredEnvVars) {
          if (!import.meta.env[envVar]) {
            errors.push(`Missing environment variable: ${envVar}`);
          }
        }

        // Validate contract addresses format
        status.contractAddresses = {
          isValid: true,
          addresses: {}
        };

        const contractAddresses = {
          KMS_VERIFIER: import.meta.env.VITE_KMS_VERIFIER_CONTRACT,
          INPUT_VERIFIER: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT,
          ACL: import.meta.env.VITE_ACL_CONTRACT,
          DECRYPTION_ORACLE: import.meta.env.VITE_DECRYPTION_ORACLE_CONTRACT,
          FHEVM_EXECUTOR: import.meta.env.VITE_FHEVM_EXECUTOR_CONTRACT,
          HCU_LIMIT: import.meta.env.VITE_HCU_LIMIT_CONTRACT
        };

        for (const [name, address] of Object.entries(contractAddresses)) {
          if (address && !address.startsWith('0x') || (address && address.length !== 42)) {
            errors.push(`Invalid ${name} contract address format: ${address}`);
            status.contractAddresses.isValid = false;
          }
          status.contractAddresses.addresses[name] = address;
        }

        // Test relayer connectivity
        try {
          if (import.meta.env.VITE_RELAYER_URL) {
            const response = await fetch(import.meta.env.VITE_RELAYER_URL, {
              method: 'HEAD',
              timeout: 5000
            });
            status.relayerStatus = response.ok ? 'connected' : 'error';
          } else {
            status.relayerStatus = 'missing_config';
            errors.push('Relayer URL not configured');
          }
        } catch (error) {
          status.relayerStatus = 'error';
          errors.push(`Relayer connection failed: ${error.message}`);
        }

        // Test IPFS gateway accessibility with a known working CID
        try {
          const testCID = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR';
          const testGateway = 'https://ipfs.io/ipfs/';
          const testUrl = `${testGateway}${testCID}`;
          
          const response = await fetch(testUrl, {
            method: 'HEAD',
            timeout: 5000
          });
          
          status.ipfsStatus = response.ok ? 'connected' : 'error';
        } catch (error) {
          status.ipfsStatus = 'error';
          errors.push(`IPFS gateway test failed: ${error.message}`);
        }

      } catch (error) {
        errors.push(`Configuration check failed: ${error.message}`);
      }

      status.errors = errors;
      setConfigStatus(status);
      setLoading(false);
    };

    checkConfiguration();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      case 'missing_config': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return '✓';
      case 'error': return '✗';
      case 'pending': return '⋯';
      default: return '-';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Zama Configuration Test</h2>
      
      {loading ? (
        <div className="text-center py-4">
          <p>Checking configuration...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Environment Variables */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Environment Variables</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(configStatus.envVars).map(([key, value]) => (
                <div key={key} className="border p-3 rounded">
                  <div className="font-medium text-sm text-gray-600">{key}</div>
                  <div className="text-sm break-all mt-1">
                    {value || <span className="text-red-500">Not set</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contract Addresses */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Contract Addresses</h3>
            <div className={`p-3 rounded ${configStatus.contractAddresses.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="font-medium">
                Status: <span className={configStatus.contractAddresses.isValid ? 'text-green-600' : 'text-red-600'}>
                  {configStatus.contractAddresses.isValid ? 'All addresses valid' : 'Invalid addresses found'}
                </span>
              </div>
              <div className="mt-2 space-y-2">
                {Object.entries(configStatus.contractAddresses.addresses || {}).map(([name, address]) => (
                  <div key={name} className="text-sm">
                    <span className="font-medium">{name}:</span> {address}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Status */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Service Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border p-3 rounded">
                <div className="font-medium">Relayer</div>
                <div className={`text-lg ${getStatusColor(configStatus.relayerStatus)}`}>
                  {getStatusIcon(configStatus.relayerStatus)} {configStatus.relayerStatus}
                </div>
              </div>
              <div className="border p-3 rounded">
                <div className="font-medium">IPFS Gateway</div>
                <div className={`text-lg ${getStatusColor(configStatus.ipfsStatus)}`}>
                  {getStatusIcon(configStatus.ipfsStatus)} {configStatus.ipfsStatus}
                </div>
              </div>
            </div>
          </div>

          {/* Errors */}
          {configStatus.errors.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-red-600">Errors Found</h3>
              <div className="bg-red-50 border border-red-200 rounded p-4 space-y-2">
                {configStatus.errors.map((error, index) => (
                  <div key={index} className="text-red-700 text-sm">
                    • {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {configStatus.errors.length === 0 && !loading && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="text-green-700 font-medium">
                ✓ All configuration checks passed! Your DApp should work correctly with Zama FHE.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ZamaConfigTest;