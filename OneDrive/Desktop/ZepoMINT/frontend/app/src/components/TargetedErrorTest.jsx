import React, { useState } from 'react';
import { encryptBidInteger } from '../utils/fhe-wrapper';
import { fetchIpfsMetadata, fetchIpfsImage } from '../utils/ipfsUtils';

const TargetedErrorTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testCID, setTestCID] = useState('QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
  const [bidAmount, setBidAmount] = useState('0.01');

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testRelayerError = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult('=== Testing Relayer "Wrong Relayer URL" Error ===', 'info');
      
      // Test the specific error we're seeing
      addResult('1. Attempting to encrypt bid with current configuration...', 'info');
      
      const testContractAddress = "0x7317A3152B16D1d2d5A9f0856233c739B5aA111e";
      const testUserAddress = "0x0000000000000000000000000000000000000000";
      
      try {
        addResult(`  Using bid amount: ${bidAmount} ETH`, 'info');
        addResult(`  Using contract address: ${testContractAddress}`, 'info');
        
        const encryptedData = await encryptBidInteger(
          parseFloat(bidAmount),
          testContractAddress,
          testUserAddress,
          null // No provider for testing
        );
        
        if (encryptedData && encryptedData.encryptedBid && encryptedData.inputProof) {
          addResult('✓ Bid encryption successful - Relayer is working correctly', 'success');
          addResult(`  Encrypted bid length: ${encryptedData.encryptedBid.length}`, 'info');
          addResult(`  Input proof length: ${encryptedData.inputProof.length}`, 'info');
        } else {
          addResult('✗ Encryption returned invalid data', 'error');
        }
      } catch (error) {
        addResult(`✗ Bid encryption failed: ${error.message}`, 'error');
        
        // Check for specific error patterns
        if (error.message.includes('wrong relayer url')) {
          addResult('⚠ This is the exact error we need to fix!', 'warning');
          addResult('  Possible causes:', 'info');
          addResult('  1. Incorrect VITE_RELAYER_URL in .env file', 'info');
          addResult('  2. Network connectivity issues to relayer', 'info');
          addResult('  3. Zama SDK WebAssembly binding issues', 'info');
        }
        
        if (error.message.includes('__wbindgen_malloc')) {
          addResult('⚠ WebAssembly binding error detected!', 'warning');
          addResult('  This is a known issue with Zama SDK in browser environments', 'info');
          addResult('  Possible solutions:', 'info');
          addResult('  1. Clear browser cache and refresh', 'info');
          addResult('  2. Check Vite configuration for WebAssembly support', 'info');
          addResult('  3. Verify @zama-fhe/relayer-sdk installation', 'info');
        }
      }
    } catch (error) {
      addResult(`Test failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testIPFSError = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult('=== Testing IPFS "Image Not Loading" Error ===', 'info');
      
      // Test the specific IPFS error we're seeing
      addResult(`1. Attempting to fetch metadata for CID: ${testCID}`, 'info');
      
      try {
        const metadata = await fetchIpfsMetadata(testCID);
        addResult('✓ Metadata fetch successful', 'success');
        addResult(`  Name: ${metadata.name}`, 'info');
        addResult(`  Description: ${metadata.description}`, 'info');
        
        // Try to fetch image if available
        if (metadata.image) {
          addResult(`2. Attempting to fetch image: ${metadata.image}`, 'info');
          try {
            const imageUrl = await fetchIpfsImage(metadata.image);
            addResult('✓ Image fetch successful', 'success');
            addResult(`  Image URL: ${imageUrl}`, 'info');
          } catch (imageError) {
            addResult(`✗ Image fetch failed: ${imageError.message}`, 'error');
          }
        }
      } catch (error) {
        addResult(`✗ Metadata fetch failed: ${error.message}`, 'error');
        
        // Try direct image fetch as fallback
        addResult(`2. Attempting direct image fetch for CID: ${testCID}`, 'info');
        try {
          const imageUrl = await fetchIpfsImage(testCID);
          addResult('✓ Direct image fetch successful', 'success');
          addResult(`  Image URL: ${imageUrl}`, 'info');
        } catch (directError) {
          addResult(`✗ Direct image fetch failed: ${directError.message}`, 'error');
        }
      }
    } catch (error) {
      addResult(`Test failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Targeted Error Testing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Relayer Error Test</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Test Bid Amount (ETH)
            </label>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="0.01"
              step="0.01"
              min="0"
            />
          </div>
          
          <button
            onClick={testRelayerError}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold w-full"
          >
            {loading ? 'Testing Relayer...' : 'Test Relayer Error'}
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">IPFS Error Test</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Test CID
            </label>
            <input
              type="text"
              value={testCID}
              onChange={(e) => setTestCID(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Qm..."
            />
          </div>
          
          <button
            onClick={testIPFSError}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold w-full"
          >
            {loading ? 'Testing IPFS...' : 'Test IPFS Error'}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        
        <div className="space-y-3 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded">
          {testResults.map((result, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg ${
                result.type === 'success' ? 'bg-green-100 border border-green-200' :
                result.type === 'error' ? 'bg-red-100 border border-red-200' :
                result.type === 'warning' ? 'bg-yellow-100 border border-yellow-200' :
                'bg-blue-100 border border-blue-200'
              }`}
            >
              <div className="flex items-start">
                <span className="font-mono text-xs text-gray-500 mr-2">[{result.timestamp}]</span>
                <span className="flex-1">
                  {result.type === 'success' && '✓ '}
                  {result.type === 'error' && '✗ '}
                  {result.type === 'warning' && '⚠ '}
                  {result.message}
                </span>
              </div>
            </div>
          ))}
          
          {testResults.length === 0 && !loading && (
            <div className="text-center text-gray-500 py-8">
              Run one of the tests above to see results.
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Known Issues & Solutions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-red-700">Relayer "Wrong URL" Error:</p>
            <ul className="text-gray-700 list-disc pl-5 space-y-1 text-sm">
              <li>Verify VITE_RELAYER_URL=https://relayer.testnet.zama.cloud</li>
              <li>Check network connectivity to the relayer endpoint</li>
              <li>Clear browser cache and refresh the page</li>
              <li>Verify @zama-fhe/relayer-sdk installation (v0.2.0)</li>
            </ul>
          </div>
          
          <div>
            <p className="font-medium text-blue-700">IPFS "Image Not Loading" Error:</p>
            <ul className="text-gray-700 list-disc pl-5 space-y-1 text-sm">
              <li>Verify CID format and accessibility</li>
              <li>Check rate limiting (5-second delays between requests)</li>
              <li>Try different IPFS gateways if one is failing</li>
              <li>Validate content-type headers when fetching</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetedErrorTest;