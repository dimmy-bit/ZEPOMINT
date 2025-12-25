import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';

const Home = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  const handleExploreAuctions = () => {
    navigate('/auctions');
  };

  const handleCreateAuction = () => {
    navigate('/mint');
  };

  const handleLearnMore = () => {
    navigate('/docs');
  };

  const features = [
    {
      icon: "🔒",
      title: "Privacy-Preserving",
      description: "All bids are encrypted using Zama's Fully Homomorphic Encryption, ensuring complete privacy throughout the auction process."
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Built on Sepolia testnet with optimized smart contracts for quick transaction processing and minimal gas fees."
    },
    {
      icon: "🎨",
      title: "NFT Focused",
      description: "Designed specifically for NFT auctions with IPFS metadata storage and seamless minting experience."
    },
    {
      icon: "🛡️",
      title: "Secure & Trustless",
      description: "Winner selection happens entirely on-chain using secure FHE operations without any centralized components."
    }
  ];

  const stats = [
    { value: "0", label: "Auctions Held" },
    { value: "0", label: "NFTs Minted" },
    { value: "0 ETH", label: "Volume Traded" },
    { value: "100%", label: "Bid Privacy" }
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                ZepoMint
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto">
              Sealed-bid NFT auctions with <span className="font-semibold text-yellow-600">true privacy</span>
            </p>
            
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Using Zama's fhEVM technology to ensure your bids remain encrypted and private until auction completion
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <button 
                onClick={handleExploreAuctions}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold text-lg"
              >
                Explore Auctions
              </button>
              {isConnected ? (
                <button 
                  onClick={handleCreateAuction}
                  className="bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-900 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold text-lg"
                >
                  Create Auction
                </button>
              ) : (
                <button 
                  onClick={handleLearnMore}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold text-lg border border-gray-300"
                >
                  Learn More
                </button>
              )}
            </div>
          </motion.div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <div className="text-2xl md:text-3xl font-bold text-yellow-500 mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose ZepoMint?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The most secure and private NFT auction platform powered by cutting-edge encryption technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our sealed-bid auction process ensures complete privacy for all participants
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div 
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-lg mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Place Encrypted Bid</h3>
              <p className="text-gray-600">
                Submit your bid amount using fully homomorphic encryption. Your bid remains private and encrypted on-chain.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-lg mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure Comparison</h3>
              <p className="text-gray-600">
                All bids are compared on-chain using Zama's fhEVM without revealing any plaintext values.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-lg mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Winner Mint</h3>
              <p className="text-gray-600">
                The winner is determined and can mint their NFT without revealing their bid amount to anyone.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Experience Private Auctions?</h2>
          <p className="text-yellow-100 text-xl mb-10 max-w-2xl mx-auto">
            Join the future of NFT auctions with complete bid privacy
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={handleExploreAuctions}
              className="bg-white text-yellow-600 hover:bg-gray-100 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold text-lg"
            >
              Start Bidding
            </button>
            <button 
              onClick={() => window.open('https://github.com/zama-ai/fhevm', '_blank')}
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold text-lg"
            >
              View Documentation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;