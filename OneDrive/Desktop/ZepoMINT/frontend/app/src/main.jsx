import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { sepolia, localhost } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { setContractAddress } from './utils/contract-interaction';

// Import the deployment information
import deploymentInfo from './contract-deployment.json';

// Get the WalletConnect project ID and RPC URLs from environment variables
const projectId = import.meta.env.VITE_RAINBOWKIT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE';

// Get RPC URLs from environment variables with fallbacks
const alchemyRpcUrl = import.meta.env.VITE_ALCHEMY_RPC_URL;
const infuraRpcUrl = import.meta.env.VITE_INFURA_RPC_URL;
const ankrRpcUrl = import.meta.env.VITE_ANKR_RPC_URL;

// Debug logging
console.log("Environment variables:");
console.log("- VITE_RAINBOWKIT_PROJECT_ID:", projectId);
console.log("- VITE_ALCHEMY_RPC_URL:", alchemyRpcUrl);
console.log("- VITE_INFURA_RPC_URL:", infuraRpcUrl);
console.log("- VITE_ANKR_RPC_URL:", ankrRpcUrl);

// Configure chains with multiple RPC providers for fallback
const providers = [
  // Custom RPC providers with fallbacks
  alchemyRpcUrl && jsonRpcProvider({
    rpc: () => ({
      http: alchemyRpcUrl,
    }),
  }),
  infuraRpcUrl && jsonRpcProvider({
    rpc: () => ({
      http: infuraRpcUrl,
    }),
  }),
  ankrRpcUrl && jsonRpcProvider({
    rpc: () => ({
      http: ankrRpcUrl,
    }),
  }),
  // Fallback to public provider
  publicProvider(),
].filter(Boolean); // Remove any falsy values

console.log("Configured providers:", providers);

const { chains, publicClient } = configureChains(
  [localhost, sepolia],
  providers
);

const { connectors } = getDefaultWallets({
  appName: 'ZepoMint',
  projectId,
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

// Set the contract address
if (deploymentInfo && deploymentInfo.contractAddress) {
  console.log("Setting contract address from deployment info:", deploymentInfo.contractAddress);
  setContractAddress(deploymentInfo.contractAddress);
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </RainbowKitProvider>
      </WagmiConfig>
    </React.StrictMode>,
  );
} else {
  console.error('Failed to find the root element');
}