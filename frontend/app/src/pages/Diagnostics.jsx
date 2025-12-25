import React, { useState } from 'react';
import EnvTest from '../components/EnvTest';
import IPFSTest from '../components/IPFSTest';
import RelayerTest from '../components/RelayerTest';
import ContractTest from '../components/ContractTest';

const Diagnostics = () => {
  const [activeTab, setActiveTab] = useState('env');

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">DApp Diagnostics</h1>
        
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('env')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'env'
                  ? 'border-[#FFD700] text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Environment Variables
            </button>
            <button
              onClick={() => setActiveTab('ipfs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ipfs'
                  ? 'border-[#FFD700] text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              IPFS Upload
            </button>
            <button
              onClick={() => setActiveTab('relayer')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'relayer'
                  ? 'border-[#FFD700] text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Relayer Connection
            </button>
            <button
              onClick={() => setActiveTab('contract')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contract'
                  ? 'border-[#FFD700] text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contract Interaction
            </button>
          </nav>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'env' && <EnvTest />}
          {activeTab === 'ipfs' && <IPFSTest />}
          {activeTab === 'relayer' && <RelayerTest />}
          {activeTab === 'contract' && <ContractTest />}
        </div>
        
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Diagnostics Information</h2>
          <p className="text-gray-700 mb-4">
            This diagnostics page helps you verify that all components of your Zama FHE sealed-bid DApp 
            are working correctly. Test each component to identify and resolve any issues.
          </p>
          
          <h3 className="text-lg font-semibold mb-2">Troubleshooting Guide</h3>
          <ul className="text-gray-700 list-disc pl-5 space-y-2">
            <li>
              <strong>Environment Variables:</strong> Ensure all required VITE_ prefixed variables 
              are set in your frontend/.env file
            </li>
            <li>
              <strong>IPFS Upload:</strong> Test file uploads to verify IPFS connectivity and gateway access
            </li>
            <li>
              <strong>Relayer Connection:</strong> Verify Zama relayer connectivity and FHE encryption functionality
            </li>
            <li>
              <strong>Contract Interaction:</strong> Test communication with the deployed smart contract
            </li>
          </ul>
          
          <div className="mt-4 p-4 bg-yellow-100 rounded">
            <h4 className="font-semibold text-yellow-800">Important Notes</h4>
            <p className="text-yellow-700 text-sm mt-1">
              If any test fails, check the browser console for detailed error messages. Make sure your 
              .env file is properly configured and all required services are accessible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;