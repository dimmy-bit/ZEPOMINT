import React, { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { getFHEInstance, encryptBidInteger } from '../utils/fhe-wrapper';
import { fetchIpfsMetadata, fetchIpfsImage } from '../utils/ipfsUtils';
import { getCurrentAuction, getBidCount } from '../utils/contract-interaction';

const FinalVerification = () => {
  const [verificationResults, setVerificationResults] = useState({
    envVars: false,
    relayer: false,
    ipfs: false,
    contract: false
  });
  const [detailedResults, setDetailedResults] = useState({});
  const [isTesting, setIsTesting] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  const { isConnected } = useAccount();
  const publicClient = usePublicClient();

  // Check environment variables
  const checkEnvVars = () => {
    const requiredVars = [
      'VITE_RELAYER_URL',
      'VITE_KMS_VERIFIER_CONTRACT',
      'VITE_ACL_CONTRACT',
      'VITE_INPUT_VERIFIER_CONTRACT'
    ];
    
    const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
    
    return {
      success: missingVars.length === 0,
      missing: missingVars,
      allVars: requiredVars.map(varName => ({
        name: varName,
        value: import.meta.env[varName] || 'NOT SET'
      }))
    };
  };

  // Test relayer connection
  const testRelayer = async () => {
    try {
      console.log("Testing relayer connection...");
      
      // Test 1: Check environment variables
      const envCheck = checkEnvVars();
      if (!envCheck.success) {
        throw new Error(`Missing environment variables: ${envCheck.missing.join(', ')}`);
      }
      
      // Test 2: Create FHE instance
      console.log("Creating FHE instance...");
      const instance = await getFHEInstance();
      console.log("FHE instance created:", !!instance);
      
      // Test 3: Try to encrypt a sample bid
      console.log("Testing bid encryption...");
      const testAddress = "0x0000000000000000000000000000000000000000"; // Dummy address for testing
      const encryptedData = await encryptBidInteger(
        0.1, // 0.1 ETH
        testAddress,
        testAddress
      );
      
      console.log("Encryption successful:", !!encryptedData);
      
      return {
        success: true,
        instanceCreated: !!instance,
        encryptionSuccess: !!encryptedData
      };
    } catch (err) {
      console.error("Relayer test failed:", err);
      return {
        success: false,
        error: err.message
      };
    }
  };

  // Test IPFS functionality
  const testIPFS = async () => {
    try {
      console.log("Testing IPFS functionality...");
      
      // Test with a known good CID
      const testCID = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR';
      
      console.log("Fetching metadata...");
      const metadata = await fetchIpfsMetadata(testCID);
      console.log("Metadata fetched:", !!metadata);
      
      // Test with a known image CID
      const imageCID = 'QmUuwLEGLbT9dDaa5oD6KNFx26HyV4d8zpepQ3H5rDt1hG';
      console.log("Fetching image...");
      const imageUrl = await fetchIpfsImage(imageCID);
      console.log("Image URL fetched:", imageUrl);
      
      return {
        success: true,
        metadataFetched: !!metadata,
        imageFetched: !!imageUrl
      };
    } catch (err) {
      console.error("IPFS test failed:", err);
      return {
        success: false,
        error: err.message
      };
    }
  };

  // Test contract interaction
  const testContract = async () => {
    try {
      console.log("Testing contract interaction...");
      
      if (!publicClient) {
        throw new Error("Public client not available");
      }
      
      // Test getting current auction
      console.log("Fetching current auction...");
      const auction = await getCurrentAuction(publicClient);
      console.log("Current auction:", auction);
      
      // Test getting bid count
      console.log("Fetching bid count...");
      const bidCount = await getBidCount(publicClient);
      console.log("Bid count:", bidCount);
      
      return {
        success: true,
        auctionFetched: !!auction,
        bidCount: bidCount
      };
    } catch (err) {
      console.error("Contract test failed:", err);
      return {
        success: false,
        error: err.message
      };
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsTesting(true);
    setTestCompleted(false);
    
    try {
      // Test environment variables
      const envResult = checkEnvVars();
      setDetailedResults(prev => ({ ...prev, env: envResult }));
      setVerificationResults(prev => ({ ...prev, envVars: envResult.success }));
      
      // Test relayer
      const relayerResult = await testRelayer();
      setDetailedResults(prev => ({ ...prev, relayer: relayerResult }));
      setVerificationResults(prev => ({ ...prev, relayer: relayerResult.success }));
      
      // Test IPFS
      const ipfsResult = await testIPFS();
      setDetailedResults(prev => ({ ...prev, ipfs: ipfsResult }));
      setVerificationResults(prev => ({ ...prev, ipfs: ipfsResult.success }));
      
      // Test contract
      const contractResult = await testContract();
      setDetailedResults(prev => ({ ...prev, contract: contractResult }));
      setVerificationResults(prev => ({ ...prev, contract: contractResult.success }));
      
      setTestCompleted(true);
    } catch (error) {
      console.error("Error running tests:", error);
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    // Auto-run tests when component mounts
    runAllTests();
  }, []);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Final System Verification</h1>
        
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Verification Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${verificationResults.envVars ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${verificationResults.envVars ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-semibold">Environment Variables</span>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${verificationResults.relayer ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${verificationResults.relayer ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-semibold">Zama Relayer</span>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${verificationResults.ipfs ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${verificationResults.ipfs ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-semibold">IPFS Gateway</span>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${verificationResults.contract ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${verificationResults.contract ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-semibold">Smart Contract</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={runAllTests}
              disabled={isTesting}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {isTesting ? 'Running Tests...' : 'Re-run All Tests'}
            </button>
          </div>
        </div>
        
        {testCompleted && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Detailed Results</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Environment Variables</h3>
                {detailedResults.env && (
                  <div className={`p-3 rounded ${detailedResults.env.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p>Status: {detailedResults.env.success ? '✅ Success' : '❌ Failed'}</p>
                    {detailedResults.env.missing && detailedResults.env.missing.length > 0 && (
                      <p className="text-red-600">Missing: {detailedResults.env.missing.join(', ')}</p>
                    )}
                    <div className="mt-2">
                      <h4 className="font-medium">All Variables:</h4>
                      <ul className="text-sm">
                        {detailedResults.env.allVars.map((varInfo, index) => (
                          <li key={index} className="font-mono">
                            {varInfo.name}: {varInfo.value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Zama Relayer</h3>
                {detailedResults.relayer && (
                  <div className={`p-3 rounded ${detailedResults.relayer.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p>Status: {detailedResults.relayer.success ? '✅ Success' : '❌ Failed'}</p>
                    {detailedResults.relayer.success ? (
                      <>
                        <p>FHE Instance Created: {detailedResults.relayer.instanceCreated ? '✅' : '❌'}</p>
                        <p>Bid Encryption: {detailedResults.relayer.encryptionSuccess ? '✅' : '❌'}</p>
                      </>
                    ) : (
                      <p className="text-red-600">Error: {detailedResults.relayer.error}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">IPFS Gateway</h3>
                {detailedResults.ipfs && (
                  <div className={`p-3 rounded ${detailedResults.ipfs.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p>Status: {detailedResults.ipfs.success ? '✅ Success' : '❌ Failed'}</p>
                    {detailedResults.ipfs.success ? (
                      <>
                        <p>Metadata Fetch: {detailedResults.ipfs.metadataFetched ? '✅' : '❌'}</p>
                        <p>Image Fetch: {detailedResults.ipfs.imageFetched ? '✅' : '❌'}</p>
                      </>
                    ) : (
                      <p className="text-red-600">Error: {detailedResults.ipfs.error}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Smart Contract</h3>
                {detailedResults.contract && (
                  <div className={`p-3 rounded ${detailedResults.contract.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p>Status: {detailedResults.contract.success ? '✅ Success' : '❌ Failed'}</p>
                    {detailedResults.contract.success ? (
                      <>
                        <p>Auction Data: {detailedResults.contract.auctionFetched ? '✅' : '❌'}</p>
                        <p>Bid Count: {detailedResults.contract.bidCount}</p>
                      </>
                    ) : (
                      <p className="text-red-600">Error: {detailedResults.contract.error}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">System Status</h2>
          <p className="text-gray-700">
            {Object.values(verificationResults).every(result => result) 
              ? '✅ All systems are working correctly!' 
              : '⚠️ Some systems require attention. Check the detailed results above.'}
          </p>
          
          {!isConnected && (
            <div className="mt-4 p-3 bg-yellow-100 rounded">
              <p className="text-yellow-800">
                Please connect your wallet to fully test contract interactions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalVerification;