import React from 'react';

const Docs = () => {
  const docsLinks = [
    {
      title: "Zama Developer Hub",
      description: "Official documentation and resources for Zama's FHE technology",
      url: "https://www.zama.ai/developer-hub"
    },
    {
      title: "Zama Protocol Documentation",
      description: "Comprehensive guide to the Zama Confidential Blockchain Protocol",
      url: "https://docs.zama.ai/homepage/"
    },
    {
      title: "fhEVM v0.8 Release Notes",
      description: "Latest features and improvements in fhEVM v0.8",
      url: "https://github.com/zama-ai/fhevm/releases/tag/v0.8.0"
    },
    {
      title: "Migration Guide",
      description: "How to migrate from previous versions of fhEVM",
      url: "https://docs.zama.ai/protocol/solidity-guides/development-guide/migration"
    },
    {
      title: "FHEVM Solidity Library",
      description: "Documentation for the Solidity library used in FHEVM contracts",
      url: "https://docs.zama.ai/fhevm"
    },
    {
      title: "Zama Status Page",
      description: "Current status of Zama's network and services",
      url: "https://status.zama.ai/"
    }
  ];

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
            Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the resources and guides to understand how ZepoMint leverages Zama's FHE technology
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {docsLinks.map((doc, index) => (
            <a 
              key={index}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl p-6 bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold ml-4 text-gray-900">{doc.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{doc.description}</p>
              <div className="text-sm text-yellow-600 font-medium flex items-center">
                <span>Visit documentation</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))}
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">ZepoMint Developer Guide</h2>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="prose max-w-none">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h3>
              <p className="text-gray-700 mb-6">
                ZepoMint is a production-grade sealed-bid NFT minting platform that leverages Zama's fhEVM v0.8 
                for true on-chain FHE comparisons without plaintext reveals.
              </p>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-3 text-gray-700">True On-Chain FHE using Zama fhEVM v0.8</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-3 text-gray-700">Threshold KMS for secure key management</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-3 text-gray-700">Sealed-bid auctions with encrypted bids</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-3 text-gray-700">IPFS integration for decentralized NFT metadata</p>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h3>
              <div className="space-y-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">1</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Create an Auction</h4>
                    <p className="text-gray-700">The contract owner creates an auction by specifying the duration and uploading NFT metadata to IPFS.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">2</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Place Encrypted Bids</h4>
                    <p className="text-gray-700">Bidders connect their wallets and submit encrypted bids using Zama's FHE technology. Bids remain completely private until the auction ends.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">3</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Compute Winner</h4>
                    <p className="text-gray-700">Once the auction ends, the contract owner computes the winner on-chain using FHE comparisons without revealing any bid amounts.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">4</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Mint NFT</h4>
                    <p className="text-gray-700">The winner can mint their NFT, and all participants can verify the fairness of the auction process.</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Security & Privacy</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-gray-900">Zero Knowledge Bidding</h4>
                    <p className="text-gray-700 mt-2">
                      ZepoMint ensures complete privacy for all bidders. Using Zama's Fully Homomorphic Encryption (FHE), 
                      bid amounts are encrypted before being submitted to the blockchain. No one—not even the contract owner—
                      can see the bid amounts until the auction concludes and the winner is computed on-chain.
                    </p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Technical Architecture</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Core Components</h4>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li><span className="font-medium">ZepoMintFHE Smart Contract</span> - The core Solidity contract implementing sealed-bid auctions with FHE</li>
                  <li><span className="font-medium">Zama fhEVM v0.8</span> - Provides on-chain FHE operations for encrypted comparisons</li>
                  <li><span className="font-medium">IPFS Storage</span> - Decentralized storage for NFT metadata using Pinata and NFT.Storage</li>
                  <li><span className="font-medium">Frontend DApp</span> - React-based interface with wagmi and viem for wallet integration</li>
                  <li><span className="font-medium">Zama Relayer</span> - Handles FHE encryption operations in the browser</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Getting Help</h4>
                <p className="text-gray-700 mb-3">
                  If you encounter any issues or have questions about ZepoMint, please check the resources above or 
                  reach out to the Zama community for support with FHE-related questions.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href="https://github.com/zama-ai/fhevm/issues" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    GitHub Issues
                  </a>
                  <a 
                    href="https://discord.gg/zama-ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1 14.66 14.66 0 0 0-4.58 0 10.14 10.14 0 0 0-.53-1.1 16 16 0 0 0-4.13 1.3 17.33 17.33 0 0 0-3 11.59 16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83 3.39 3.39 0 0 0 .42-.33 11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.84 12.41 12.41 0 0 0 1.08 1.78 16.44 16.44 0 0 0 5.06-2.59 17.22 17.22 0 0 0-3-11.59 16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.93 1.93 0 0 1 1.8 2 1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.92 1.92 0 0 1 1.8 2 1.92 1.92 0 0 1-1.8 2z"/>
                    </svg>
                    Discord Community
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;