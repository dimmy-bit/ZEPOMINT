import React, { useState, useEffect } from 'react';
import { getFHEInstance } from '../utils/fhe-wrapper';

const RelayerTestComponent = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = [];
    
    try {
      results.push('Starting Relayer tests...');
      
      // Test environment variables
      results.push('Checking environment variables...');
      const relayerUrl = import.meta.env.VITE_RELAYER_URL;
      const kmsContractAddress = import.meta.env.VITE_KMS_VERIFIER_CONTRACT;
      
      if (!relayerUrl) {
        results.push('✗ VITE_RELAYER_URL is not set');
      } else {
        results.push(`✓ VITE_RELAYER_URL: ${relayerUrl}`);
      }
      
      if (!kmsContractAddress) {
        results.push('✗ VITE_KMS_VERIFIER_CONTRACT is not set');
      } else {
        results.push(`✓ VITE_KMS_VERIFIER_CONTRACT: ${kmsContractAddress}`);
      }
      
      // Test relayer connection
      results.push('Testing relayer connection...');
      try {
        const instance = await getFHEInstance();
        results.push('✓ Relayer connection successful');
        results.push(`Instance created with chainId: ${instance.chainId}`);
      } catch (error) {
        results.push(`✗ Relayer connection failed: ${error.message}`);
      }
      
      results.push('Tests completed.');
    } catch (error) {
      results.push(`Tests failed with error: ${error.message}`);
    }
    
    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Relayer Test Results</h2>
      {loading ? (
        <p>Running tests...</p>
      ) : (
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div 
              key={index} 
              className={`p-2 rounded ${result.startsWith('✓') ? 'bg-green-100' : result.startsWith('✗') ? 'bg-red-100' : 'bg-blue-100'}`}
            >
              {result}
            </div>
          ))}
          <button 
            onClick={runTests}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Run Tests Again
          </button>
        </div>
      )}
    </div>
  );
};

export default RelayerTestComponent;