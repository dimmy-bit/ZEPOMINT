import React, { useState, useEffect } from 'react';

const SystemHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState({
    envVars: {},
    relayerHealth: null,
    ipfsHealth: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSystemHealth = async () => {
      setLoading(true);
      
      // Check environment variables
      const envVars = {
        relayerUrl: import.meta.env.VITE_RELAYER_URL,
        kmsContract: import.meta.env.VITE_KMS_VERIFIER_CONTRACT,
        aclContract: import.meta.env.VITE_ACL_CONTRACT,
        inputVerifierContract: import.meta.env.VITE_INPUT_VERIFIER_CONTRACT,
        decryptionOracleContract: import.meta.env.VITE_DECRYPTION_ORACLE_CONTRACT
      };
      
      // Check relayer health
      let relayerHealth = null;
      if (envVars.relayerUrl) {
        try {
          const response = await fetch(`${envVars.relayerUrl}/health`, { method: 'HEAD' });
          relayerHealth = {
            status: response.status,
            ok: response.ok
          };
        } catch (error) {
          relayerHealth = {
            error: error.message
          };
        }
      }
      
      // Check IPFS health with a known good CID
      let ipfsHealth = null;
      try {
        const testCID = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR';
        const ipfsUrl = `https://ipfs.io/ipfs/${testCID}`;
        const response = await fetch(ipfsUrl, { method: 'HEAD' });
        ipfsHealth = {
          status: response.status,
          ok: response.ok
        };
      } catch (error) {
        ipfsHealth = {
          error: error.message
        };
      }
      
      setHealthStatus({
        envVars,
        relayerHealth,
        ipfsHealth
      });
      
      setLoading(false);
    };
    
    checkSystemHealth();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">System Health Check</h2>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Checking system health...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">System Health Check</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Environment Variables</h3>
          <div className="bg-gray-50 p-4 rounded">
            {Object.entries(healthStatus.envVars).map(([key, value]) => (
              <div key={key} className="flex items-start mb-2">
                <span className="font-medium w-64">{key}:</span>
                <span className={`ml-2 ${value ? 'text-green-600' : 'text-red-600'}`}>
                  {value || 'Not set'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Relayer Health</h3>
          <div className="bg-gray-50 p-4 rounded">
            {healthStatus.relayerHealth ? (
              healthStatus.relayerHealth.error ? (
                <div className="text-red-600">
                  Error: {healthStatus.relayerHealth.error}
                </div>
              ) : (
                <div className={`flex items-center ${healthStatus.relayerHealth.ok ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-3 h-3 rounded-full mr-2 ${healthStatus.relayerHealth.ok ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  Status: {healthStatus.relayerHealth.status} ({healthStatus.relayerHealth.ok ? 'OK' : 'Error'})
                </div>
              )
            ) : (
              <div className="text-gray-500">Relayer URL not configured</div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">IPFS Health</h3>
          <div className="bg-gray-50 p-4 rounded">
            {healthStatus.ipfsHealth ? (
              healthStatus.ipfsHealth.error ? (
                <div className="text-red-600">
                  Error: {healthStatus.ipfsHealth.error}
                </div>
              ) : (
                <div className={`flex items-center ${healthStatus.ipfsHealth.ok ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-3 h-3 rounded-full mr-2 ${healthStatus.ipfsHealth.ok ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  Status: {healthStatus.ipfsHealth.status} ({healthStatus.ipfsHealth.ok ? 'OK' : 'Error'})
                </div>
              )
            ) : (
              <div className="text-gray-500">Checking...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthCheck;