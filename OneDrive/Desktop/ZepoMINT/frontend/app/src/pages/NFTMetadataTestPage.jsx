import React, { useState } from 'react';
import NFTPreview from '../components/NFTPreview';

const NFTMetadataTestPage = () => {
  const [testCID, setTestCID] = useState('QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
  const [metadataCID, setMetadataCID] = useState('');
  const [testResult, setTestResult] = useState(null);

  const testCases = [
    {
      name: "Direct Image CID (Problematic)",
      cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      description: "This is a direct image CID that causes issues"
    },
    {
      name: "Proper Metadata CID (Solution)",
      cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      description: "This should point to proper JSON metadata"
    }
  ];

  const handleTest = (cid) => {
    setTestCID(cid);
  };

  const handleCustomTest = async () => {
    if (metadataCID.trim()) {
      setTestCID(metadataCID.trim());
    }
  };

  const testCIDDirectly = async () => {
    try {
      setTestResult({ loading: true, message: 'Testing CID directly...' });
      
      // Try to fetch the CID directly to see what it contains
      const gateways = [
        'https://ipfs.io/ipfs/',
        'https://dweb.link/ipfs/',
        'https://nftstorage.link/ipfs/',
        'https://w3s.link/ipfs/'
      ];
      
      for (const gateway of gateways) {
        try {
          const url = `${gateway}${testCID}`;
          console.log(`Testing CID with gateway: ${url}`);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json,text/plain,image/*'
            }
          });
          
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            setTestResult({
              loading: false,
              success: true,
              contentType: contentType,
              gateway: gateway,
              message: `CID accessible via ${gateway} with content-type: ${contentType}`
            });
            return;
          }
        } catch (error) {
          console.log(`Gateway ${gateway} failed: ${error.message}`);
        }
      }
      
      setTestResult({
        loading: false,
        success: false,
        message: 'CID not accessible via any gateway'
      });
    } catch (error) {
      setTestResult({
        loading: false,
        success: false,
        message: `Error testing CID: ${error.message}`
      });
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">NFT Metadata Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {testCases.map((testCase, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <h3 className="font-medium">{testCase.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{testCase.description}</p>
                <button
                  onClick={() => handleTest(testCase.cid)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
                >
                  Test This CID
                </button>
              </div>
            ))}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Custom CID Test
            </label>
            <div className="flex">
              <input
                type="text"
                value={metadataCID}
                onChange={(e) => setMetadataCID(e.target.value)}
                placeholder="Enter CID to test"
                className="flex-1 shadow appearance-none border rounded-l py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <button
                onClick={handleCustomTest}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-r"
              >
                Test
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <button
              onClick={testCIDDirectly}
              className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
            >
              Test CID Directly
            </button>
            
            {testResult && (
              <div className={`mt-3 p-3 rounded ${testResult.success ? 'bg-green-100 text-green-800' : testResult.loading ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                {testResult.message}
                {testResult.contentType && (
                  <div className="mt-1 text-sm">
                    Content-Type: {testResult.contentType}
                  </div>
                )}
                {testResult.gateway && (
                  <div className="mt-1 text-sm">
                    Gateway: {testResult.gateway}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-medium mb-2">Current Test CID:</h3>
            <p className="font-mono text-sm break-all">{testCID}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">NFT Preview</h2>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <NFTPreview metadataCID={testCID} />
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">NFT Metadata Solution</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-2">Problem:</h3>
              <p>When creating an auction, you were using a direct image CID instead of proper JSON metadata.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">Solution:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Upload the image to IPFS to get an image CID</li>
                <li>Create proper JSON metadata that references the image CID</li>
                <li>Upload the JSON metadata to IPFS to get a metadata CID</li>
                <li>Use the metadata CID when creating the auction</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">Proper Metadata Structure:</h3>
              <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
{`{
  "name": "Your NFT Name",
  "description": "Your NFT Description",
  "image": "ipfs://QmImageCID...",
  "attributes": [
    {
      "trait_type": "Encrypted",
      "value": "true"
    }
  ]
}`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">Implementation:</h3>
              <p>The fixes have been implemented in the Mint page to automatically create proper metadata when you upload an image.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMetadataTestPage;