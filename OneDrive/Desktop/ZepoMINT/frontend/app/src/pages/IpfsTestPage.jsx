import React, { useState, useEffect } from 'react';
import { fetchIpfsMetadata, fetchIpfsImage, testIpfsConnectivity } from '../utils/ipfsUtils';

const IpfsTestPage = () => {
  const [testResults, setTestResults] = useState({
    connectivity: null,
    metadata: null,
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [testCid, setTestCid] = useState('QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');

  const runTests = async () => {
    setLoading(true);
    setTestResults({
      connectivity: null,
      metadata: null,
      image: null
    });

    try {
      // Test IPFS connectivity
      console.log('Testing IPFS connectivity...');
      const connectivityResult = await testIpfsConnectivity();
      setTestResults(prev => ({ ...prev, connectivity: connectivityResult }));
      console.log('Connectivity test result:', connectivityResult);

      // Test metadata fetching
      console.log('Testing metadata fetching...');
      const metadataResult = await fetchIpfsMetadata(testCid);
      setTestResults(prev => ({ ...prev, metadata: metadataResult }));
      console.log('Metadata test result:', metadataResult);

      // Test image fetching if metadata contains image
      if (metadataResult && metadataResult.image) {
        console.log('Testing image fetching...');
        const imageResult = await fetchIpfsImage(metadataResult.image);
        setTestResults(prev => ({ ...prev, image: imageResult }));
        console.log('Image test result:', imageResult);
      }
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">IPFS Functionality Test</h1>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Test CID:
          </label>
          <div className="flex">
            <input
              type="text"
              value={testCid}
              onChange={(e) => setTestCid(e.target.value)}
              className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter CID to test"
            />
            <button
              onClick={runTests}
              disabled={loading}
              className={`bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-r ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Testing...' : 'Run Tests'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">IPFS Connectivity</h2>
            {testResults.connectivity === null ? (
              <p>Testing...</p>
            ) : testResults.connectivity ? (
              <div className="p-4 bg-green-100 rounded-lg">
                <p className="text-green-800 font-semibold">✅ Connected to IPFS</p>
              </div>
            ) : (
              <div className="p-4 bg-red-100 rounded-lg">
                <p className="text-red-800 font-semibold">❌ Failed to connect to IPFS</p>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Metadata Fetching</h2>
            {testResults.metadata === null ? (
              <p>Testing...</p>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg max-h-60 overflow-auto">
                <pre className="text-sm">
                  {JSON.stringify(testResults.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Image Fetching</h2>
            {testResults.image === null ? (
              <p>Testing...</p>
            ) : (
              <div>
                <img 
                  src={testResults.image} 
                  alt="Test IPFS Image" 
                  className="max-w-full h-auto rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentElement.innerHTML = '<div class="p-4 bg-red-100 rounded-lg"><p class="text-red-800">❌ Failed to load image</p></div>';
                  }}
                />
                <p className="mt-2 text-sm text-gray-600 break-all">{testResults.image}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IpfsTestPage;