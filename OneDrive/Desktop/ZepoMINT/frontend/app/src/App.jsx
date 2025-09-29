import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Mint from './pages/Mint';
import Auctions from './pages/Auctions';
import OwnerConsole from './pages/OwnerConsole';
import MintNFT from './pages/MintNFT';
import EnvTestPage from './pages/EnvTestPage';
import EnvDebugPage from './pages/EnvDebugPage';
import IpfsTestPage from './pages/IpfsTestPage';
import ZamaTestPage from './pages/ZamaTestPage';
import TestPage from './pages/TestPage';
import EnvDebug from './components/EnvDebug';
import ComprehensiveVerificationPage from './pages/ComprehensiveVerificationPage';
import TargetedErrorTestPage from './pages/TargetedErrorTestPage';
import ContractTest from './pages/ContractTest';
import TestAuctionPage from './pages/TestAuctionPage';
import TestAutoFinalize from './pages/TestAutoFinalize';
import DebugAuction from './pages/DebugAuction';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mint" element={<Mint />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/owner" element={<OwnerConsole />} />
          <Route path="/mint-nft" element={<MintNFT />} />
          <Route path="/env-test" element={<EnvTestPage />} />
          <Route path="/env-debug" element={<EnvDebugPage />} />
          <Route path="/ipfs-test" element={<IpfsTestPage />} />
          <Route path="/zama-test" element={<ZamaTestPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/env-component-debug" element={<EnvDebug />} />
          <Route path="/comprehensive-test" element={<ComprehensiveVerificationPage />} />
          <Route path="/targeted-test" element={<TargetedErrorTestPage />} />
          <Route path="/contract-test" element={<ContractTest />} />
          <Route path="/test-auction" element={<TestAuctionPage />} />
          <Route path="/test-auto-finalize" element={<TestAutoFinalize />} />
          <Route path="/debug-auction" element={<DebugAuction />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;