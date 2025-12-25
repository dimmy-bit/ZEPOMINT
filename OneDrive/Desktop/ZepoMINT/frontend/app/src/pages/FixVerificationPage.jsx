import React from 'react';
import DiagnosticsAndFix from '../components/DiagnosticsAndFix';
import { useNavigate } from 'react-router-dom';

const FixVerificationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">ZepoMINT Fix Verification</h1>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to App
            </button>
          </div>
        </div>
      </div>
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DiagnosticsAndFix />
        </div>
      </div>
    </div>
  );
};

export default FixVerificationPage;