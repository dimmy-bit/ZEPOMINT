import React, { useState } from 'react';
import { motion } from 'framer-motion';
import WalletInfo from './WalletInfo';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="h-20 fixed w-full bg-white/95 backdrop-blur-md shadow-md z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <motion.div
          className="text-3xl font-extrabold"
          animate={{ 
            background: [
              "linear-gradient(45deg, #FFD700, #FFA500)",
              "linear-gradient(45deg, #FFA500, #FFD700)",
              "linear-gradient(45deg, #FFD700, #FFA500)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ 
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent"
          }}
        >
          <Link to="/">ZepoMint</Link>
        </motion.div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-10">
          <Link 
            to="/" 
            className="text-gray-800 hover:text-yellow-500 transition-all duration-300 font-bold text-lg"
          >
            Home
          </Link>
          <Link 
            to="/auctions" 
            className="text-gray-800 hover:text-yellow-500 transition-all duration-300 font-bold text-lg"
          >
            Auctions
          </Link>
          <Link 
            to="/mint" 
            className="text-gray-800 hover:text-yellow-500 transition-all duration-300 font-bold text-lg"
          >
            Create Auction
          </Link>
          <Link 
            to="/docs" 
            className="text-gray-800 hover:text-yellow-500 transition-all duration-300 font-bold text-lg"
          >
            Docs
          </Link>
          <WalletInfo />
        </nav>
        
        {/* Mobile Navigation Button */}
        <button 
          className="lg:hidden p-3 rounded-xl hover:bg-gray-100 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-7 h-7 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          className="lg:hidden bg-white border-t border-gray-100 shadow-xl"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto px-4 py-6 flex flex-col space-y-5">
            <Link 
              to="/" 
              className="text-gray-800 hover:text-yellow-500 transition-all duration-300 font-bold text-xl py-3 px-4 rounded-xl hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/auctions" 
              className="text-gray-800 hover:text-yellow-500 transition-all duration-300 font-bold text-xl py-3 px-4 rounded-xl hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Auctions
            </Link>
            <Link 
              to="/mint" 
              className="text-gray-800 hover:text-yellow-500 transition-all duration-300 font-bold text-xl py-3 px-4 rounded-xl hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Create Auction
            </Link>
            <Link 
              to="/docs" 
              className="text-gray-800 hover:text-yellow-500 transition-all duration-300 font-bold text-xl py-3 px-4 rounded-xl hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Docs
            </Link>
            <div className="pt-4 border-t border-gray-100">
              <WalletInfo />
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;