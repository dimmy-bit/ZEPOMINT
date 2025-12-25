import React from 'react';
import IPFSTestComponent from '../components/IPFSTestComponent';
import RelayerTestComponent from '../components/RelayerTestComponent';

const DebugTestPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Debug Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">IPFS Tests</h2>
          <IPFSTestComponent />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3">Relayer Tests</h2>
          <RelayerTestComponent />
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Debug Information</h3>
        <p className="mb-2">This page tests the fixes for the two main issues:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>IPFS gateway resolution errors (removed cf-ipfs.com)</li>
          <li>Relayer configuration according to Zama documentation</li>
        </ul>
        <p className="mt-3">If both tests pass, the issues should be resolved.</p>
      </div>
    </div>
  );
};

export default DebugTestPage;