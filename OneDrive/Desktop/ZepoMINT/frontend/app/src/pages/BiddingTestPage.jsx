import React from 'react';
import BiddingTest from '../components/BiddingTest';

const BiddingTestPage = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Bidding Process Test</h1>
            <p className="text-gray-600">
              Test the FHE encryption and bidding process to ensure everything is configured correctly
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <BiddingTest />
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-yellow-50 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Test Instructions</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-lg mb-2">1. Connect Wallet</h3>
                  <p>Make sure your wallet is connected to the Sepolia testnet.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">2. Enter Test Bid</h3>
                  <p>Enter a small test bid amount (e.g., 0.01 ETH) to test the encryption process.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">3. Run Test</h3>
                  <p>Click "Test Bidding Process" to verify that the FHE encryption works correctly.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">4. Check Results</h3>
                  <p>If successful, you'll see the encrypted bid data. If there are errors, check the configuration.</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-lg mb-3">Configuration Check</h3>
                <div className="text-sm space-y-2">
                  <p><strong>Relayer URL:</strong> {import.meta.env.VITE_RELAYER_URL || 'Not set'}</p>
                  <p><strong>KMS Contract:</strong> {import.meta.env.VITE_KMS_VERIFIER_CONTRACT || 'Not set'}</p>
                  <p><strong>Input Verifier:</strong> {import.meta.env.VITE_INPUT_VERIFIER_CONTRACT || 'Not set'}</p>
                  <p><strong>Input Verification:</strong> {import.meta.env.VITE_INPUT_VERIFICATION_CONTRACT || 'Not set'}</p>
                  <p><strong>Contract Address:</strong> {import.meta.env.VITE_CONTRACT_ADDRESS || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiddingTestPage;