import React, { useState, useEffect } from 'react';

const RelayerSDKTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const testRelayerSDK = async () => {
    setLoading(true);
    try {
      // Dynamically import the relayer SDK to avoid build issues
      const { createInstance, SepoliaConfig } = await import('@zama-fhe/relayer-sdk/web');
      
      console.log('SepoliaConfig:', SepoliaConfig);
      
      // Test creating an instance
      const instance = await createInstance(SepoliaConfig);
      console.log('Instance created:', instance);
      
      setTestResults({
        success: true,
        message: 'Relayer SDK is working correctly!',
        instanceKeys: Object.keys(instance)
      });
    } catch (error) {
      console.error('Error testing Relayer SDK:', error);
      setTestResults({
        success: false,
        message: error.message,
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testRelayerSDK();
  }, []);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Relayer SDK Test</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <p>Testing Relayer SDK...</p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          </div>
        ) : testResults ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className={`p-4 rounded ${testResults.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p className="font-semibold">{testResults.message}</p>
            </div>
            
            {testResults.success && (
              <div className="mt-4">
                <h3 className="font-medium">Instance Methods:</h3>
                <ul className="list-disc pl-5 mt-2">
                  {testResults.instanceKeys.map((key, index) => (
                    <li key={index} className="text-sm">{key}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={testRelayerSDK}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Test Again'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>Click "Test Again" to run the test</p>
            <button
              onClick={testRelayerSDK}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              Test Relayer SDK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelayerSDKTest;