import React from 'react';
import NFTMetadataVerification from '../components/NFTMetadataVerification';

const NFTMetadataVerificationPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NFTMetadataVerification />
        </div>
      </div>
    </div>
  );
};

export default NFTMetadataVerificationPage;