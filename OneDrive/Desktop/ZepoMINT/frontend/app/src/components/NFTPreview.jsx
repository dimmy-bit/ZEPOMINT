import React, { useState, useEffect } from 'react';

const NFTPreview = ({ metadataCID }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNFTData = async () => {
      if (!metadataCID) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Convert metadataCID to proper HTTP URL using multiple reliable gateways
        // Using more reliable gateways based on current best practices
        const gateways = [
          `https://ipfs.io/ipfs/${metadataCID}`,  // IPFS official gateway
          `https://gateway.pinata.cloud/ipfs/${metadataCID}`,  // Pinata gateway
          `https://${metadataCID}.ipfs.dweb.link/`,  // Protocol Labs gateway
          `https://cloudflare-ipfs.com/ipfs/${metadataCID}`,  // Cloudflare gateway
          `https://nftstorage.link/ipfs/${metadataCID}`  // NFT.Storage gateway
        ];
        
        let metadataResponse = null;
        let metadataUrl = '';
        
        // Try each gateway in order until one works
        for (const gateway of gateways) {
          try {
            console.log(`Trying metadata gateway: ${gateway}`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(gateway, {
              signal: controller.signal,
              headers: {
                'Accept': 'application/json'
              }
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                metadataResponse = response;
                metadataUrl = gateway;
                console.log(`Successfully fetched metadata from: ${gateway}`);
                break;
              } else {
                console.log(`Gateway ${gateway} returned non-JSON content: ${contentType}`);
              }
            } else {
              console.log(`Gateway ${gateway} returned status: ${response.status}`);
            }
          } catch (err) {
            console.log(`Metadata gateway ${gateway} failed: ${err.message}`);
            continue;
          }
        }
        
        if (!metadataResponse) {
          throw new Error('Failed to fetch metadata from any IPFS gateway');
        }
        
        const metadata = await metadataResponse.json();
        setMetadata(metadata);
        
        // Get image URL from metadata
        let imageCID = metadata.image;
        
        // Handle different image formats
        if (imageCID) {
          // Remove ipfs:// prefix if present
          if (imageCID.startsWith('ipfs://')) {
            imageCID = imageCID.substring(7);
          }
          
          // Try multiple gateways for the image
          const imageGateways = [
            `https://ipfs.io/ipfs/${imageCID}`,  // IPFS official gateway
            `https://gateway.pinata.cloud/ipfs/${imageCID}`,  // Pinata gateway
            `https://${imageCID}.ipfs.dweb.link/`,  // Protocol Labs gateway
            `https://cloudflare-ipfs.com/ipfs/${imageCID}`,  // Cloudflare gateway
            `https://nftstorage.link/ipfs/${imageCID}`  // NFT.Storage gateway
          ];
          
          // Try each gateway for the image
          for (const gateway of imageGateways) {
            try {
              console.log(`Trying image gateway: ${gateway}`);
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
              
              const response = await fetch(gateway, {
                signal: controller.signal,
                method: 'HEAD' // Just check if resource exists
              });
              
              clearTimeout(timeoutId);
              
              if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.startsWith('image/')) {
                  setImageUrl(gateway);
                  console.log(`Successfully resolved image from: ${gateway}`);
                  break;
                }
              }
            } catch (err) {
              console.log(`Image gateway ${gateway} failed: ${err.message}`);
              continue;
            }
          }
          
          // If we couldn't resolve the image, use the first gateway as fallback
          if (!imageUrl) {
            setImageUrl(`https://ipfs.io/ipfs/${imageCID}`);
          }
        }
      } catch (err) {
        console.error('Error fetching NFT data:', err);
        if (err.name === 'AbortError') {
          setError('Request timeout. Please try again.');
        } else {
          setError(`Failed to load NFT: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchNFTData();
  }, [metadataCID]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl w-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mb-6"></div>
        <div className="text-center">
          <span className="text-xl font-bold text-gray-700">Loading NFT...</span>
          <p className="text-gray-600 mt-2">Fetching from IPFS</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl w-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-red-300">
        <div className="text-6xl mb-6">⚠️</div>
        <div className="text-center px-6">
          <span className="text-xl font-bold text-red-800">Error Loading NFT</span>
          <p className="text-red-700 mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="group">
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200">
          <div className="aspect-square w-full overflow-hidden">
            {/* Direct image loading with proper attributes to avoid COEP issues */}
            <img 
              src={imageUrl} 
              alt={metadata?.name || 'NFT'} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onError={(e) => {
                console.log('Image failed to load, showing fallback');
                // Try alternative gateways without CORS proxy
                const imageCID = metadata?.image?.replace('ipfs://', '');
                if (imageCID) {
                  const fallbackUrls = [
                    `https://gateway.pinata.cloud/ipfs/${imageCID}`,
                    `https://ipfs.io/ipfs/${imageCID}`,
                    `https://${imageCID}.ipfs.dweb.link/`,
                    `https://cloudflare-ipfs.com/ipfs/${imageCID}`,
                    `https://nftstorage.link/ipfs/${imageCID}`
                  ];
                  
                  // Try each fallback URL directly
                  let foundImage = false;
                  for (const url of fallbackUrls) {
                    const img = new Image();
                    img.onload = () => {
                      if (!foundImage) {
                        foundImage = true;
                        setImageUrl(url);
                      }
                    };
                    img.onerror = () => {
                      console.log(`Fallback image failed: ${url}`);
                    };
                    img.src = url;
                    // Add attributes to avoid COEP issues
                    img.crossOrigin = "anonymous";
                    img.referrerPolicy = "no-referrer";
                  }
                  
                  // If all fail, show a placeholder
                  setTimeout(() => {
                    if (!foundImage) {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%239ca3af'%3ENo Image Available%3C/text%3E%3C/svg%3E";
                      setError('Failed to load image from all gateways');
                    }
                  }, 3000);
                } else {
                  // Show placeholder if no image CID
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%239ca3af'%3ENo Image Available%3C/text%3E%3C/svg%3E";
                  setError('No image CID found in metadata');
                }
              }}
            />
          </div>
          
          {/* NFT Metadata Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-6 text-white">
            <h3 className="font-extrabold text-2xl truncate">{metadata?.name || 'Untitled NFT'}</h3>
            {metadata?.description && (
              <p className="text-gray-300 mt-2 line-clamp-2">{metadata.description}</p>
            )}
          </div>
          
          {/* Rarity Badge */}
          {metadata?.attributes && (
            <div className="absolute top-6 right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg">
              {metadata.attributes.length} Traits
            </div>
          )}
        </div>
        
        {/* Properties */}
        {metadata?.attributes && metadata.attributes.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Properties</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {metadata.attributes.slice(0, 6).map((attr, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{attr.trait_type}</div>
                  <div className="text-sm font-extrabold text-gray-900 mt-1 truncate">{attr.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl w-full min-h-[500px] flex items-center justify-center border-2 border-dashed border-gray-300">
      <div className="text-center px-6">
        <div className="text-6xl mb-6">🖼️</div>
        <span className="text-xl font-bold text-gray-700">No NFT Preview Available</span>
        <p className="text-gray-600 mt-2">Metadata CID: {metadataCID?.substring(0, 20)}...</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-800 py-3 px-6 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default NFTPreview;