import React, { useEffect, useState } from 'react';

const ZamaVerification = () => {
  const [envVars, setEnvVars] = useState({});
  const [relayerTest, setRelayerTest] = useState({ status: 'not-started', result: null });
  const [contractInfo, setContractInfo] = useState({});

  useEffect(() => {
    // Check environment variables
    const variables = {
      'VITE_RELAYER_URL': import.meta.env.VITE_RELAYER_URL,
      'VITE_KMS_VERIFIER_CONTRACT': import.meta.env.VITE_KMS_VERIFIER_CONTRACT,
      'VITE_INPUT_VERIFIER_CONTRACT': import.meta.env.VITE_INPUT_VERIFIER_CONTRACT,
      'VITE_CONTRACT_ADDRESS': import.meta.env.VITE_CONTRACT_ADDRESS,
      'VITE_CHAIN_ID': import.meta.env.VITE_CHAIN_ID,
    };
    
    setEnvVars(variables);
    console.log('Environment variables:', variables);
    
    // Check contract deployment info
    import('../contract-deployment.json').then((deploymentInfo) => {
      setContractInfo(deploymentInfo.default);
      console.log('Contract deployment info:', deploymentInfo.default);
    });
    
    // Test relayer connection
    const testRelayer = async () => {
      setRelayerTest({ status: 'testing', result: null });
      
      try {
        if (import.meta.env.VITE_RELAYER_URL) {
          const response = await fetch(`${import.meta.env.VITE_RELAYER_URL}/v1/keyurl`);
          const data = await response.text();
          
          setRelayerTest({
            status: response.ok ? 'success' : 'error',
            result: {
              status: response.status,
              statusText: response.statusText,
              headers: [...response.headers.entries()],
              data: data.substring(0, 200) + '...'
            }
          });
        } else {
          setRelayerTest({
            status: 'error',
            result: 'VITE_RELAYER_URL is not set'
          });
        }
      } catch (error) {
        setRelayerTest({
          status: 'error',
          result: error.message
        });
      }
    };
    
    testRelayer();
  }, []);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Zama FHE Verification</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Environment Variables</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="mb-2 flex">
                <span className="font-medium w-64">{key}:</span>
                <span className={value ? "text-green-600" : "text-red-600"}>
                  {value || 'UNDEFINED'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contract Deployment Info</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            {Object.entries(contractInfo).map(([key, value]) => (
              <div key={key} className="mb-2 flex">
                <span className="font-medium w-32">{key}:</span>
                <span className="text-blue-600">
                  {typeof value === 'string' ? value : JSON.stringify(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Relayer Connection Test</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            {relayerTest.status === 'not-started' && <p>Not started...</p>}
            {relayerTest.status === 'testing' && <p>Testing...</p>}
            {relayerTest.status === 'success' && (
              <div className="text-green-600">
                <p>✅ Relayer connection successful!</p>
                <p>Status: {relayerTest.result.status} {relayerTest.result.statusText}</p>
                <p>Response: {relayerTest.result.data}</p>
              </div>
            )}
            {relayerTest.status === 'error' && (
              <div className="text-red-600">
                <p>❌ Relayer connection failed!</p>
                <p>Error: {relayerTest.result}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZamaVerification;