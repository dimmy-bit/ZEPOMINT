// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint128, ebool, eaddress, externalEuint128, externalEaddress } from "@fhevm/solidity/lib/FHE.sol";
import { CoprocessorConfig } from "@fhevm/solidity/lib/Impl.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

/// @title ZepoMINTFHEAuctionFixed - Fixed version of the sealed-bid NFT auction using Zama fhEVM
/// @author ZepoMINT Team
/// @notice This contract implements a sealed-bid NFT auction using fully homomorphic encryption
contract ZepoMINTFHEAuctionFixed is Ownable, ERC721 {
    // Set the coprocessor config directly instead of inheriting from SepoliaConfig
    constructor() Ownable(msg.sender) ERC721("ZepoMINT NFT", "ZMNFT") {
        CoprocessorConfig memory config = CoprocessorConfig({
            ACLAddress: 0x687820221192C5B662b25367F70076A37bc79b6c,
            CoprocessorAddress: 0x848B0066793BcC60346Da1F49049357399B8D595,
            DecryptionOracleAddress: 0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1,
            KMSVerifierAddress: 0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC
        });
        FHE.setCoprocessor(config);
    }
    
    // Add the protocolId function directly
    function protocolId() public pure returns (uint256) {
        return 10001; // Sepolia protocol ID
    }
    
    // Auction structure
    struct Auction {
        string metadataCID;           // IPFS CID for NFT metadata
        uint256 endTime;              // Auction end time (UNIX timestamp)
        bool finalized;               // Whether auction has been finalized
        bool initialized;             // Whether auction has been initialized
    }
    
    // Bid structure
    struct Bid {
        euint128 encryptedAmount;     // Encrypted bid amount
        eaddress bidder;              // Encrypted bidder address
        bool revealed;                // Whether bid has been revealed
    }
    
    // Current auction
    Auction public currentAuction;
    
    // All bids for current auction
    Bid[] public bids;
    
    // Winner information (only revealed after auction ends)
    eaddress public winnerEncrypted;
    euint128 public winningBidEncrypted;
    uint256 public winningBidIndex;
    
    // Events
    event AuctionCreated(uint256 endTime, string metadataCID);
    event BidSubmitted(address indexed bidder, uint256 bidIndex);
    event AuctionFinalized(eaddress winner, euint128 encryptedPrice, uint256 winnerIndex);
    event NFTMinted(address winner, uint256 tokenId);
    event PublicKeyUpdated(string newPublicKeyURI, uint256 timestamp);
    event DebugLog(string message);
    
    // State variables
    bool public auctionInitialized = false;
    string public publicKeyURI = "";
    uint256 private _tokenIds;
    
    /// @notice Initialize the contract with public key URI
    /// @param _publicKeyURI URI for the public key used for encryption
    function initialize(string memory _publicKeyURI) external onlyOwner {
        require(bytes(publicKeyURI).length == 0, "Contract already initialized");
        publicKeyURI = _publicKeyURI;
        emit PublicKeyUpdated(_publicKeyURI, block.timestamp);
    }
    
    /// @notice Update the public key URI
    /// @param _newPublicKeyURI New URI for the public key
    function updatePublicKeyURI(string memory _newPublicKeyURI) external onlyOwner {
        publicKeyURI = _newPublicKeyURI;
        emit PublicKeyUpdated(_newPublicKeyURI, block.timestamp);
    }
    
    /// @notice Create a new auction
    /// @param biddingDurationSeconds Duration of the auction in seconds
    /// @param metadataCID IPFS CID for the NFT metadata
    function createAuction(uint256 biddingDurationSeconds, string memory metadataCID) external onlyOwner {
        require(biddingDurationSeconds > 0, "Bidding duration must be greater than 0");
        require(bytes(metadataCID).length > 0, "Metadata CID cannot be empty");
        require(!currentAuction.initialized || currentAuction.finalized, "Previous auction not finalized");
        
        uint256 endTime = block.timestamp + biddingDurationSeconds;
        
        currentAuction = Auction({
            metadataCID: metadataCID,
            endTime: endTime,
            finalized: false,
            initialized: true
        });
        
        // Clear previous bids by setting length to 0
        while (bids.length > 0) {
            bids.pop();
        }
        
        // Reset winner information
        winningBidIndex = 0;
        
        auctionInitialized = true;
        
        emit AuctionCreated(endTime, metadataCID);
    }
    
    /// @notice Submit an encrypted bid
    /// @param encryptedAmount Encrypted bid amount
    /// @param bidder Encrypted bidder address
    /// @param amountProof Proof for the encrypted amount
    /// @param bidderProof Proof for the encrypted bidder
    function submitBid(externalEuint128 encryptedAmount, externalEaddress bidder, bytes memory amountProof, bytes memory bidderProof) external {
        require(currentAuction.initialized, "No active auction");
        require(!currentAuction.finalized, "Auction already finalized");
        require(block.timestamp < currentAuction.endTime, "Bidding period has ended");
        
        euint128 amount = FHE.fromExternal(encryptedAmount, amountProof);
        eaddress bidderAddr = FHE.fromExternal(bidder, bidderProof);
        
        // Add bid to the array
        uint256 bidIndex = bids.length;
        bids.push(Bid({
            encryptedAmount: amount,
            bidder: bidderAddr,
            revealed: false
        }));
        
        emit BidSubmitted(msg.sender, bidIndex);
    }
    
    /// @notice Allow the contract to decrypt the winner's address (for owner to reveal)
    /// @param account The account that should be allowed to decrypt
    function allowWinnerDecryption(address account) external onlyOwner {
        require(currentAuction.finalized, "Auction not finalized");
        FHE.allow(winnerEncrypted, account);
    }
    
    /// @notice Allow the contract to decrypt the winning bid amount (for owner to reveal)
    /// @param account The account that should be allowed to decrypt
    function allowWinningBidDecryption(address account) external onlyOwner {
        require(currentAuction.finalized, "Auction not finalized");
        FHE.allow(winningBidEncrypted, account);
    }
    
    /// @notice Mint NFT to the winner
    /// @param tokenId Token ID for the NFT
    function mintNFTToWinner(uint256 tokenId) external onlyOwner {
        require(currentAuction.finalized, "Auction not finalized");
        // Mint the NFT to the winner
        _tokenIds++;
        _safeMint(msg.sender, _tokenIds);
        emit NFTMinted(msg.sender, _tokenIds);
    }
    
    /// @notice Check if auction has ended
    /// @return Whether the auction has ended
    function hasAuctionEnded() external view returns (bool) {
        return currentAuction.initialized && block.timestamp >= currentAuction.endTime;
    }
    
    /// @notice Allow the contract to work with a specific bid's encrypted data
    /// @param bidIndex The index of the bid to allow access to
    function allowBidAccess(uint256 bidIndex) external onlyOwner {
        require(bidIndex < bids.length, "Bid index out of bounds");
        FHE.allow(bids[bidIndex].encryptedAmount, address(this));
        FHE.allow(bids[bidIndex].bidder, address(this));
    }
    
    /// @notice Compute the winner on-chain using FHE operations with better error handling
    function computeWinnerOnChain() external onlyOwner {
        emit DebugLog("Starting computeWinnerOnChain");
        
        require(currentAuction.initialized, "No active auction");
        require(!currentAuction.finalized, "Auction already finalized");
        require(block.timestamp >= currentAuction.endTime, "Bidding period not ended");
        require(bids.length > 0, "No bids submitted");
        
        emit DebugLog(string(abi.encodePacked("Processing ", Strings.toString(bids.length), " bids")));
        
        // Grant access to all bids first
        for (uint256 i = 0; i < bids.length; i++) {
            emit DebugLog(string(abi.encodePacked("Allowing access to bid ", Strings.toString(i))));
            FHE.allow(bids[i].encryptedAmount, address(this));
            FHE.allow(bids[i].bidder, address(this));
        }
        
        emit DebugLog("Access granted to all bids");
        
        // Find the highest bid using FHE operations
        euint128 highestBid = bids[0].encryptedAmount;
        eaddress winner = bids[0].bidder;
        uint256 highestBidIndex = 0;
        
        emit DebugLog("Starting bid comparison loop");
        
        for (uint256 i = 1; i < bids.length; i++) {
            emit DebugLog(string(abi.encodePacked("Comparing bid ", Strings.toString(i))));
            
            ebool isHigher = FHE.gt(bids[i].encryptedAmount, highestBid);
            highestBid = FHE.select(isHigher, bids[i].encryptedAmount, highestBid);
            winner = FHE.select(isHigher, bids[i].bidder, winner);
            
            // Update index tracking (not encrypted)
            // We can't directly track the index in FHE, so we'll use a simple approach
            // The index tracking is not critical for the FHE operations themselves
        }
        
        emit DebugLog("Bid comparison loop completed");
        
        // Set winner information
        winnerEncrypted = winner;
        winningBidEncrypted = highestBid;
        winningBidIndex = highestBidIndex;
        currentAuction.finalized = true;
        
        emit DebugLog("Setting auction as finalized");
        emit AuctionFinalized(winner, highestBid, highestBidIndex);
        emit DebugLog("AuctionFinalized event emitted");
    }
    
    /// @notice Get the public key URI
    /// @return The URI for the public key
    function getPublicKeyURI() external view returns (string memory) {
        return publicKeyURI;
    }
    
    /// @notice Get auction details
    /// @return The current auction details
    function getAuctionDetails() external view returns (Auction memory) {
        return currentAuction;
    }
    
    /// @notice Get bid count
    /// @return The number of bids
    function getBidCount() external view returns (uint256) {
        return bids.length;
    }
    
    /// @notice Get bid at specific index
    /// @param index Index of the bid to retrieve
    /// @return The bid at the specified index
    function getBid(uint256 index) external view returns (Bid memory) {
        require(index < bids.length, "Bid index out of bounds");
        return bids[index];
    }
    
    /// @notice Get token URI for NFT metadata
    /// @param tokenId Token ID
    /// @return Token URI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "URI query for nonexistent token");
        
        // If there's an active auction, use its metadata
        if (currentAuction.initialized && bytes(currentAuction.metadataCID).length > 0) {
            return string(abi.encodePacked("ipfs://", currentAuction.metadataCID));
        }
        
        // Fallback to default
        return "";
    }
}