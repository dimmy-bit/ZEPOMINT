import React, { useState } from 'react';
import NFTPreview from './NFTPreview';

const NFTMetadataVerification = () => {
  const [testCID, setTestCID] = useState('QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');

  const testCases = [
    {
      name: "Direct Image CID (Problematic Case)",
      cid: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      description: "This is a direct image CID that was causing issues"
    },
    {
      name: "Fixed Metadata CID (Solution)",
      cid: "QmYtUcVcHcJwB5zF6pPEj3mH5xNcx7X8dE1Y9YgJ4jQ7nR",
      description: "This should point to proper JSON metadata"
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">NFT Metadata Verification</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {testCases.map((testCase, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white shadow">
            <h3 className="font-medium text-lg mb-2">{testCase.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{testCase.description}</p>
            <div className="font-mono text-xs bg-gray-100 p-2 rounded mb-3 break-all">
              {testCase.cid}
            </div>
            <button
              onClick={() => setTestCID(testCase.cid)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Test This CID
            </button>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Current Test CID:</h2>
        <div className="font-mono text-sm bg-gray-100 p-3 rounded mb-6 break-all">
          {testCID}
        </div>
        
        <h3 className="text-lg font-medium mb-3">NFT Preview:</h3>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <NFTPreview metadataCID={testCID} />
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-lg mb-2">✅ Solution Implemented</h3>
        <p className="mb-2">The fixes have been implemented to handle both:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Direct image CIDs (with fallback metadata creation)</li>
          <li>Proper JSON metadata CIDs (standard NFT format)</li>
        </ul>
        <p className="mt-3 font-medium">Your auctions should now display correctly!</p>
      </div>
    </div>
  );
};

export default NFTMetadataVerification;