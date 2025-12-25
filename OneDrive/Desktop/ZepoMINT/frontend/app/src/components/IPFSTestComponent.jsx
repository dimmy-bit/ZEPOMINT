import React, { useState, useEffect } from 'react';
import { fetchIpfsMetadata, fetchIpfsImage } from '../utils/ipfsUtils';

const IPFSTestComponent = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testCID = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'; // Known test CID

  const runTests = async () => {
    setLoading(true);
    const results = [];
    
    try {
      results.push('Starting IPFS tests...');
      
      // Test metadata fetching
      results.push('Testing metadata fetch...');
      try {
        const metadata = await fetchIpfsMetadata(testCID);
        results.push(`✓ Metadata fetch successful: ${JSON.stringify(metadata).substring(0, 100)}...`);
      } catch (error) {
        results.push(`✗ Metadata fetch failed: ${error.message}`);
      }
      
      // Test image fetching
      results.push('Testing image fetch...');
      try {
        // Using a known image CID for testing
        const imageCID = 'QmTgqnhFBMkfT9s8PHKcdXBn1f5bGdQvi9b6yt2jN8Y1dE'; // Sample image CID
        const imageUrl = await fetchIpfsImage(imageCID);
        results.push(`✓ Image fetch successful: ${imageUrl.substring(0, 100)}...`);
      } catch (error) {
        results.push(`✗ Image fetch failed: ${error.message}`);
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
      <h2 className="text-xl font-bold mb-4">IPFS Test Results</h2>
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

export default IPFSTestComponent;