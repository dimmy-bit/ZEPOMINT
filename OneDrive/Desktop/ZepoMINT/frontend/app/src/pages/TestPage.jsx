import React from 'react';
import RelayerTest from '../components/RelayerTest';
import PublicKeyTest from '../components/PublicKeyTest';
import SimpleZamaTest from '../components/SimpleZamaTest';

const TestPage = () => {
  return (
    <div className="pt-16 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Relayer SDK Test</h2>
            <RelayerTest />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Public Key Test</h2>
            <PublicKeyTest />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Simple Zama Test</h2>
            <SimpleZamaTest />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;