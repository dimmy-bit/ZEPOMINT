export const ZamaConfig = {
  // Zama Sepolia Testnet Configuration
  chainId: 11155111, // Sepolia chain ID
  gatewayChainId: 55815, // Zama gateway chain ID
  
  // Zama Contract Addresses (From Official Documentation)
  kmsContractAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
  aclContractAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
  inputVerifierContractAddress: "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4",
  decryptionOracleContractAddress: "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1",
  fhevmExecutorContractAddress: "0x848B0066793BcC60346Da1F49049357399B8D595",
  hcuLimitContractAddress: "0x594BB474275918AF9609814E68C61B1587c5F838",
  
  // Network Configuration
  networkUrl: import.meta.env.VITE_NETWORK_URL || "https://rpc.sepolia.org",
  relayerUrl: import.meta.env.VITE_RELAYER_URL || "https://relayer.testnet.zama.cloud/",
  gatewayUrl: import.meta.env.VITE_GATEWAY_URL || "https://gateway.sepolia.zama.ai",
  
  // Contract address for the deployed contract
  contractAddress: "0xB9451B1fdD5CaBe38C1de2C64136ae47bb930725"
};

export default ZamaConfig;