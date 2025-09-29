import { ethers } from 'ethers';

// Use Pinata gateway directly with reasonable rate limiting
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

// Reasonable rate limiting - 5 seconds between requests to prevent 429 errors
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests

/**
 * Rate limited fetch function with reasonable delays
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
const rateLimitedFetch = async (url, options = {}) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  // If less than 5 seconds has passed, wait
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${Math.ceil(waitTime/1000)} seconds before next request`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
  console.log(`Making request to: ${url}`);
  return fetch(url, options);
};

/**
 * Converts IPFS CID to HTTP URL using Pinata
 * @param {string} ipfsUrl - IPFS CID or URL
 * @returns {string} - HTTP URL to access the content
 */
export const convertIpfsUrl = (ipfsUrl) => {
  if (!ipfsUrl) {
    return null;
  }
  
  // If it's already an HTTP URL, return it as is
  if (ipfsUrl.startsWith('http://') || ipfsUrl.startsWith('https://')) {
    return ipfsUrl;
  }
  
  // If it's a CID (starts with Qm or baf), use Pinata
  if (ipfsUrl.startsWith('Qm') || ipfsUrl.startsWith('baf')) {
    // Use Pinata's gateway for reliable IPFS access
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`;
  }
  
  // If it's an ipfs:// URL, convert it to HTTP
  if (ipfsUrl.startsWith('ipfs://')) {
    const cid = ipfsUrl.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }
  
  // For any other case, return null
  return null;
};

/**
 * Fetches and parses JSON metadata from IPFS using Pinata with reasonable rate limiting
 * @param {string} ipfsUrl - The IPFS URL to the metadata JSON
 * @returns {Promise<object>} - The parsed metadata
 */
export const fetchIpfsMetadata = async (ipfsUrl) => {
  // Convert ipfs:// URL to hash
  let ipfsHash = ipfsUrl;
  if (ipfsUrl.startsWith('ipfs://')) {
    ipfsHash = ipfsUrl.replace('ipfs://', '');
  }
  
  // Enhanced error handling and logging
  console.log(`Attempting to fetch metadata for CID: ${ipfsHash}`);
  
  try {
    // Use Pinata gateway directly with reasonable rate limiting
    const httpUrl = `${PINATA_GATEWAY}${ipfsHash}`;
    console.log(`Fetching metadata from Pinata with 5-second rate limiting: ${httpUrl}`);
    
    const response = await rateLimitedFetch(httpUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    });
    
    if (response.ok) {
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      console.log(`Response content-type: ${contentType}`);
      
      // If it's an image, create fallback metadata
      if (contentType && contentType.startsWith('image/')) {
        console.log(`Direct image CID detected: ${ipfsHash}`);
        return {
          name: "Direct Image NFT",
          description: "NFT with direct image CID",
          image: `ipfs://${ipfsHash}`,
          attributes: [
            {
              trait_type: "Fallback",
              value: "Direct Image"
            }
          ]
        };
      }
      
      // Try to parse as JSON regardless of content-type for flexibility
      try {
        const text = await response.text();
        const metadata = JSON.parse(text);
        console.log(`Successfully fetched and parsed metadata from Pinata`);
        return metadata;
      } catch (parseError) {
        console.log(`Failed to parse JSON from Pinata: ${parseError.message}`);
        // If parsing fails but we have an image, create fallback metadata
        if (contentType && contentType.startsWith('image/')) {
          console.log(`Creating fallback metadata for image CID: ${ipfsHash}`);
          return {
            name: "Direct Image NFT",
            description: "NFT with direct image CID",
            image: `ipfs://${ipfsHash}`,
            attributes: [
              {
                trait_type: "Fallback",
                value: "Direct Image"
              }
            ]
          };
        }
        throw parseError;
      }
    } else {
      throw new Error(`Pinata gateway returned status ${response.status}`);
    }
  } catch (error) {
    console.error(`Failed to fetch from Pinata: ${error.message}`);
    throw error;
  }
};

/**
 * Fetches image from IPFS using Pinata with reasonable rate limiting
 * @param {string} ipfsUrl - The IPFS URL to the image
 * @returns {Promise<string>} - The working HTTP URL for the image
 */
export const fetchIpfsImage = async (ipfsUrl) => {
  // Convert ipfs:// URL to hash
  let ipfsHash = ipfsUrl;
  if (ipfsUrl.startsWith('ipfs://')) {
    ipfsHash = ipfsUrl.replace('ipfs://', '');
  }
  
  try {
    // Use Pinata gateway directly with reasonable rate limiting
    const httpUrl = `${PINATA_GATEWAY}${ipfsHash}`;
    console.log(`Fetching image from Pinata with 5-second rate limiting: ${httpUrl}`);
    
    // Test if the image URL is accessible
    const response = await rateLimitedFetch(httpUrl, { 
      method: 'GET',
      headers: {
        'Accept': 'image/*'
      }
    });
    
    if (response.ok) {
      // Check if it's an image content type
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.startsWith('image/')) {
        console.log(`Successfully resolved image from Pinata`);
        return httpUrl;
      } else {
        throw new Error(`Non-image content type from Pinata: ${contentType}`);
      }
    } else {
      throw new Error(`Pinata gateway returned status ${response.status}`);
    }
  } catch (error) {
    console.error(`Failed to fetch image from Pinata: ${error.message}`);
    throw error;
  }
};

/**
 * Validates if a CID is a valid IPFS CID
 * @param {string} cid - The CID to validate
 * @returns {boolean} - Whether the CID is valid
 */
export const isValidCID = (cid) => {
  if (!cid) return false;
  
  // Basic validation for common CID formats
  return cid.startsWith('Qm') || cid.startsWith('baf');
};

/**
 * Test function to verify IPFS connectivity using Pinata
 * @returns {Promise<boolean>} - Whether IPFS is accessible
 */
export const testIpfsConnectivity = async () => {
  try {
    const testCID = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'; // Known test CID
    const testUrl = `${PINATA_GATEWAY}${testCID}`;
    
    const response = await rateLimitedFetch(testUrl, {
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('IPFS connectivity test failed:', error);
    return false;
  }
};