import React, { useState, useEffect } from 'react';
import { getFHEInstance, encryptBidInteger } from '../utils/fhe-wrapper';
import { fetchIpfsMetadata, fetchIpfsImage, testIpfsConnectivity } from '../utils/ipfsUtils';
import { validateZamaRelayerConfig } from '../utils/env-validator';

const ComprehensiveVerificationTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runComprehensiveTest = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult('=== Starting Comprehensive Verification ===', 'info');
      
      // Test 1: Environment Variables
      setCurrentTest('Environment Variables');
      addResult('1. Checking Environment Variables...', 'info');
      await testEnvironmentVariables();
      
      // Test 2: Relayer Connection
      setCurrentTest('Relayer Connection');
      addResult('2. Testing Relayer Connection...', 'info');
      await testRelayerConnection();
      
      // Test 3: IPFS Connectivity
      setCurrentTest('IPFS Connectivity');
      addResult('3. Testing IPFS Connectivity...', 'info');
      await testIPFSConnectivity();
      
      // Test 4: End-to-End Encryption
      setCurrentTest('End-to-End Encryption');
      addResult('4. Testing End-to-End Encryption...', 'info');
      await testEndToEndEncryption();
      
      addResult('=== All Tests Completed ===', 'success');
    } catch (error) {
      addResult(`Test failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      setCurrentTest('');
    }
  };

  const testEnvironmentVariables = async () => {
    try {
      const validation = validateZamaRelayerConfig();
      
      if (validation.isValid) {
        addResult('✓ Environment variables are properly configured', 'success');
        addResult(`  Relayer URL: ${validation.config.relayerUrl}`, 'info');
        addResult(`  KMS Contract: ${validation.config.kmsContractAddress}`, 'info');
      } else {
        throw new Error(validation.error);
      }
    } catch (error) {
      addResult(`✗ Environment variables test failed: ${error.message}`, 'error');
      throw error;
    }
  };

  const testRelayerConnection = async () => {
    try {
      addResult('  Loading Zama relayer SDK...', 'info');
      
      // Test FHE instance creation
      addResult('  Creating FHE instance...', 'info');
      const instance = await getFHEInstance();
      addResult('  ✓ FHE instance created successfully', 'success');
      addResult(`    Chain ID: ${instance.chainId}`, 'info');
      
      // Test bid encryption with a small value
      addResult('  Testing bid encryption...', 'info');
      const testAddress = "0x0000000000000000000000000000000000000000";
      const encryptedData = await encryptBidInteger(
        0.001, // Small test value
        testAddress,
        testAddress,
        null // No provider needed for direct testing
      );
      
      if (encryptedData && encryptedData.encryptedBid && encryptedData.inputProof) {
        addResult('  ✓ Bid encryption successful', 'success');
        addResult(`    Encrypted bid length: ${encryptedData.encryptedBid.length}`, 'info');
        addResult(`    Input proof length: ${encryptedData.inputProof.length}`, 'info');
      } else {
        throw new Error('Encryption returned invalid data');
      }
    } catch (error) {
      addResult(`✗ Relayer connection test failed: ${error.message}`, 'error');
      throw error;
    }
  };

  const testIPFSConnectivity = async () => {
    try {
      // Test basic IPFS connectivity
      addResult('  Testing basic IPFS connectivity...', 'info');
      const isIpfsWorking = await testIpfsConnectivity();
      
      if (isIpfsWorking) {
        addResult('  ✓ Basic IPFS connectivity test passed', 'success');
      } else {
        addResult('  ⚠ Basic IPFS connectivity test failed', 'warning');
      }
      
      // Test with a known test CID
      const testCID = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR';
      addResult(`  Testing with known CID: ${testCID}`, 'info');
      
      try {
        const metadata = await fetchIpfsMetadata(testCID);
        addResult('  ✓ IPFS metadata fetch successful', 'success');
        addResult(`    Metadata name: ${metadata.name}`, 'info');
      } catch (metadataError) {
        addResult(`  ⚠ IPFS metadata fetch failed: ${metadataError.message}`, 'warning');
      }
      
    } catch (error) {
      addResult(`✗ IPFS connectivity test failed: ${error.message}`, 'error');
      throw error;
    }
  };

  const testEndToEndEncryption = async () => {
    try {
      // This is a more comprehensive test that combines environment validation,
      // relayer connection, and encryption in the same flow as the actual app
      addResult('  Performing end-to-end encryption test...', 'info');
      
      // Validate environment first
      const validation = validateZamaRelayerConfig();
      if (!validation.isValid) {
        throw new Error(`Environment validation failed: ${validation.error}`);
      }
      
      addResult('  ✓ Environment validation passed', 'success');
      
      // Test with a realistic bid value and contract address
      const testBidValue = 0.01;
      const testContractAddress = "0x7317A3152B16D1d2d5A9f0856233c739B5aA111e";
      const testUserAddress = "0x0000000000000000000000000000000000000000";
      
      addResult(`  Encrypting test bid: ${testBidValue} ETH`, 'info');
      
      const encryptedData = await encryptBidInteger(
        testBidValue,
        testContractAddress,
        testUserAddress,
        null // No provider needed for direct testing
      );
      
      if (encryptedData && encryptedData.encryptedBid && encryptedData.inputProof) {
        addResult('  ✓ End-to-end encryption successful', 'success');
        addResult('  ✓ All components working together correctly', 'success');
      } else {
        throw new Error('End-to-end encryption returned invalid data');
      }
    } catch (error) {
      addResult(`✗ End-to-end encryption test failed: ${error.message}`, 'error');
      throw error;
    }
  };

  useEffect(() => {
    // Run tests automatically when component mounts
    runComprehensiveTest();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Comprehensive Verification Test</h1>
      
      <div className="mb-6">
        <button
          onClick={runComprehensiveTest}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
        >
          {loading ? `Running Tests... (${currentTest})` : 'Run Comprehensive Test'}
        </button>
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
              Click "Run Comprehensive Test" to start verification.
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Test Information</h3>
        <p className="text-gray-700">
          This comprehensive test verifies all critical components of your Zama FHE sealed-bid DApp:
        </p>
        <ul className="text-gray-700 list-disc pl-5 mt-2 space-y-1">
          <li>Environment variable configuration</li>
          <li>Zama relayer connectivity and FHE instance creation</li>
          <li>Bid encryption functionality</li>
          <li>IPFS connectivity and metadata fetching</li>
          <li>End-to-end workflow integration</li>
        </ul>
      </div>
    </div>
  );
};

export default ComprehensiveVerificationTest;