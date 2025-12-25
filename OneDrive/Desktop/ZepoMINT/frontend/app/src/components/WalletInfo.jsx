import React, { useEffect, useState } from 'react';
import { useAccount, useBalance, useNetwork, useSwitchNetwork, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const WalletInfo = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const { chain } = useNetwork();
  const { chains, switchNetwork, isLoading: isSwitching } = useSwitchNetwork();
  const { data: balance, refetch: refetchBalance, isError, isLoading } = useBalance({ 
    address,
    chainId: 11155111 // Sepolia chain ID
  });
  const { disconnect } = useDisconnect();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if we're on the correct network (Sepolia)
  const isCorrectNetwork = chain?.id === 11155111; // Sepolia chain ID

  // Refetch balance when address or network changes
  useEffect(() => {
    if (isConnected && address) {
      refetchBalance();
    }
  }, [address, chain, isConnected, refetchBalance]);

  if (!isMounted) {
    return null;
  }

  if (isConnecting) {
    return <div className="text-gray-600">Connecting...</div>;
  }

  if (!isConnected) {
    return (
      <div className="flex items-center">
        <ConnectButton.Custom>
          {({ openConnectModal, mounted }) => {
            return (
              <button
                onClick={openConnectModal}
                className="bg-[#FFD700] hover:bg-[#FFA500] text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                Connect Wallet
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    );
  }

  // If not on Sepolia, show network switch button
  if (!isCorrectNetwork) {
    return (
      <div className="flex items-center space-x-4">
        <div className="hidden md:block text-sm">
          <div className="font-medium text-red-500">Wrong Network</div>
          <div className="text-gray-600">Please switch to Sepolia</div>
        </div>
        <button 
          onClick={() => switchNetwork?.(11155111)} // Sepolia chain ID
          disabled={isSwitching}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
        >
          {isSwitching ? 'Switching...' : 'Switch to Sepolia'}
        </button>
        <button 
          onClick={() => disconnect()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Format balance display
  const formatBalance = () => {
    if (isLoading) {
      return 'Loading...';
    }
    if (isError) {
      return 'Error';
    }
    if (balance) {
      return `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`;
    }
    return '0.0000 ETH';
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="hidden md:block text-sm">
        <div className="font-medium">Sepolia</div>
        <div className="text-gray-600">
          {formatBalance()}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="bg-[#FFD700] rounded-full px-3 py-1 text-sm font-medium text-white">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <button 
          onClick={() => disconnect()}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};

export default WalletInfo;