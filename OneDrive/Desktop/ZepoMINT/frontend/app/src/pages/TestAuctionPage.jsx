// TestAuctionPage.jsx
// Page to test auction display functionality
import React from 'react';
import TestAuctionDisplay from '../components/TestAuctionDisplay';

const TestAuctionPage = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Test Auction Display</h1>
        <TestAuctionDisplay />
      </div>
    </div>
  );
};

export default TestAuctionPage;