import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ZepoMintFHEABI from '../abi/ZepoMINTFHEAuctionSmartFinalizeFixed.json';
import deploymentInfo from '../contract-deployment.json';

const PublicKeyVerification = () => {
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verifyPublicKey = async () => {
    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      console.log("=== Public Key Verification Started ===");
      console.log("Deployment Info:", deploymentInfo);

      if (!deploymentInfo || !deploymentInfo.contractAddress) {
        throw new Error("Contract address not found in deployment info");
      }

      const contractAddress = deploymentInfo.contractAddress;
      console.log("Contract Address:", contractAddress);

      // Create ethers contract instance
      const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.org");
      const contract = new ethers.Contract(contractAddress, ZepoMintFHEABI.abi, provider);

      console.log("Contract instance created");

      // Test publicKeyURI
      try {
        const publicKeyURI = await contract.publicKeyURI();
        console.log("Public Key URI:", publicKeyURI);
        
        setVerificationResult({
          success: true,
          publicKeyURI: publicKeyURI,
          message: "Public key URI retrieved successfully!"
        });
      } catch (err) {
        console.log("Error getting publicKeyURI:", err.message);
        throw new Error("Failed to retrieve public key URI: " + err.message);
      }
    } catch (err) {
      console.error("Public key verification failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyPublicKey();
  }, []);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Public Key Verification</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>Error: {error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <p>Verifying public key...</p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          </div>
        ) : verificationResult ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Verification Results</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Status:</h3>
                <p className="text-green-600 font-semibold">{verificationResult.message}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Public Key URI:</h3>
                <p className="font-mono text-sm break-all bg-gray-100 p-2 rounded">{verificationResult.publicKeyURI}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Contract Address:</h3>
                <p className="font-mono text-sm break-all">{deploymentInfo.contractAddress}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={verifyPublicKey}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Again'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>Click "Verify Again" to run the verification</p>
            <button
              onClick={verifyPublicKey}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              Verify Public Key
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicKeyVerification;