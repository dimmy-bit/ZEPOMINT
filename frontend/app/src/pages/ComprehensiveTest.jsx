import React from 'react';
import EnvVarTest from '../components/EnvVarTest';
import FHERelayerTest from '../components/FHERelayerTest';
import IPFSTestReal from '../components/IPFSTestReal';

const ComprehensiveTest = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Comprehensive System Test</h1>
        
        <div className="grid grid-cols-1 gap-8">
          <EnvVarTest />
          <FHERelayerTest />
          <IPFSTestReal />
        </div>
        
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Test Instructions</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>First, check that all environment variables are loaded correctly</li>
            <li>Test the FHE relayer connection and encryption functionality</li>
            <li>Test IPFS metadata and image fetching</li>
            <li>If all tests pass, the system should be ready for real auction operations</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveTest;