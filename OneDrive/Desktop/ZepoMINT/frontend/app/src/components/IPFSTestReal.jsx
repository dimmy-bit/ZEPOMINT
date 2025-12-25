import React, { useState } from 'react';
import { fetchIpfsMetadata, fetchIpfsImage, convertIpfsUrl } from '../utils/ipfsUtils';

const IPFSTestReal = () => {
  const [testCID, setTestCID] = useState('QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'); // Test CID for a real IPFS file
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');

  const testIPFS = async () => {
    setIsTesting(true);
    setError('');
    setTestResult(null);

    try {
      console.log('Testing IPFS functionality with CID:', testCID);
      
      // Test 1: Fetch metadata
      console.log('Fetching metadata...');
      const metadata = await fetchIpfsMetadata(testCID);
      console.log('Metadata fetched:', metadata);

      // Test 2: Extract image URL and fetch it
      let imageUrl = '';
      if (metadata.image) {
        console.log('Fetching image from metadata...');
        imageUrl = await fetchIpfsImage(metadata.image);
        console.log('Image URL resolved:', imageUrl);
      }

      setTestResult({
        metadata,
        imageUrl,
        convertedUrl: convertIpfsUrl(metadata.image || '')
      });
    } catch (err) {
      console.error('IPFS Test Error:', err);
      setError(err.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">IPFS Functionality Test</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Test CID:
        </label>
        <input
          type="text"
          value={testCID}
          onChange={(e) => setTestCID(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter IPFS CID"
        />
      </div>

      <button
        onClick={testIPFS}
        disabled={isTesting}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isTesting ? 'Testing...' : 'Test IPFS Functionality'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {testResult && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
          <h3 className="font-bold">Test Results:</h3>
          <div className="mt-2">
            <p>✅ Metadata Fetched Successfully</p>
            <p>✅ Image URL Resolved: {testResult.imageUrl ? 'Yes' : 'No'}</p>
            
            {testResult.imageUrl && (
              <div className="mt-2">
                <img 
                  src={testResult.imageUrl} 
                  alt="IPFS Test" 
                  className="max-w-xs max-h-32 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentElement.innerHTML = '<p className="text-red-500">Image failed to load</p>';
                  }}
                />
              </div>
            )}
            
            <div className="mt-2">
              <p className="text-sm">Converted URL: {testResult.convertedUrl}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPFSTestReal;