import React, { useState } from 'react';
import { fetchIpfsMetadata, fetchIpfsImage } from '../utils/ipfsUtils';

const IPFSAndRelayerTestPage = () => {
  const [testCID, setTestCID] = useState('QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
  const [metadata, setMetadata] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testMetadataFetch = async () => {
    setLoading(true);
    setError('');
    setMetadata(null);
    
    try {
      console.log('Fetching metadata for CID:', testCID);
      const result = await fetchIpfsMetadata(testCID);
      console.log('Metadata result:', result);
      setMetadata(result);
    } catch (err) {
      console.error('Error fetching metadata:', err);
      setError(`Failed to fetch metadata: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testImageFetch = async () => {
    setLoading(true);
    setError('');
    setImageUrl('');
    
    try {
      // Use a known image CID for testing
      const imageCID = 'QmUuwLEGLbT9dDaa5oD6KNFx26HyV4d8zpepQ3H5rDt1hG';
      console.log('Fetching image for CID:', imageCID);
      const url = await fetchIpfsImage(imageCID);
      console.log('Image URL result:', url);
      setImageUrl(url);
    } catch (err) {
      console.error('Error fetching image:', err);
      setError(`Failed to fetch image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">IPFS and Relayer Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* IPFS Test Section */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">IPFS Test</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Test CID:</label>
              <input
                type="text"
                value={testCID}
                onChange={(e) => setTestCID(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter IPFS CID"
              />
            </div>
            
            <div className="space-x-2 mb-4">
              <button
                onClick={testMetadataFetch}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                Test Metadata Fetch
              </button>
              <button
                onClick={testImageFetch}
                disabled={loading}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                Test Image Fetch
              </button>
            </div>
            
            {loading && <div className="text-center py-4">Loading...</div>}
            
            {error && (
              <div className="p-2 bg-red-100 text-red-700 rounded mb-4">
                {error}
              </div>
            )}
            
            {metadata && (
              <div className="p-4 bg-gray-50 rounded shadow">
                <h3 className="font-bold mb-2">Metadata:</h3>
                <pre className="font-mono text-sm whitespace-pre-wrap">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            )}
            
            {imageUrl && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">Image:</h3>
                <img 
                  src={imageUrl} 
                  alt="IPFS Test" 
                  className="max-w-full h-auto rounded"
                  onError={(e) => {
                    console.log('Image failed to load from:', imageUrl);
                    setError('Image failed to load');
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Information Section */}
          <div className="p-6 bg-blue-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Test Information</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">IPFS Gateway Test</h3>
              <p className="text-gray-700 mb-2">
                This test verifies that IPFS gateways are accessible and can fetch both metadata and images.
              </p>
              <p className="text-gray-700">
                If tests fail, check your network connection and try again. Some gateways may be temporarily unavailable.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Common Issues</h3>
              <ul className="text-gray-700 list-disc pl-5 space-y-1">
                <li>Network connectivity issues</li>
                <li>IPFS gateway downtime</li>
                <li>Invalid CID format</li>
                <li>CORS restrictions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPFSAndRelayerTestPage;