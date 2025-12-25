// Simple script to generate test metadata
import { writeFileSync } from 'fs';

// Create test metadata
const testMetadata = {
  name: "ZepoMint Test NFT",
  description: "This is a test NFT for the ZepoMint platform with proper metadata structure",
  image: "ipfs://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
  attributes: [
    {
      trait_type: "Type",
      value: "Test"
    },
    {
      trait_type: "Platform",
      value: "ZepoMint"
    },
    {
      trait_type: "Encrypted",
      value: "true"
    }
  ]
};

// Save to file in the correct directory
writeFileSync('./public/proper-test-metadata.json', JSON.stringify(testMetadata, null, 2));
console.log('Test metadata generated successfully');
console.log('Metadata:', JSON.stringify(testMetadata, null, 2));