import React from 'react';
import RelayerDebug from '../components/RelayerDebug';
import { Link } from 'react-router-dom';

const RelayerDebugPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Relayer Debug</h1>
          <Link 
            to="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <RelayerDebug />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RelayerDebugPage;