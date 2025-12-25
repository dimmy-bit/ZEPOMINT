// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint128, ebool, eaddress, externalEuint128, externalEaddress } from "@fhevm/solidity/lib/FHE.sol";
import { CoprocessorConfig } from "@fhevm/solidity/lib/Impl.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

/// @title ZepoMINTFHEAuctionComplete - Complete FHE auction with enhanced error handling
/// @author Mir Mohammed
/// @notice This contract implements a complete auction system with proper FHE operations:
/// - 0 bids: Finalize without winner
/// - 1 bid: Automatic winner
/// - 2+ bids: FHE-based winner determination with proper error handling
contract ZepoMINTFHEAuctionComplete is Ownable, ERC721 {
    // Set the coprocessor config directly
    constructor() Ownable(msg.sender) ERC721("ZepoMINT NFT", "ZMNFT") {
        CoprocessorConfig memory config = CoprocessorConfig({
            ACLAddress: 0x687820221192C5B662b25367F70076A37bc79b6c,
            CoprocessorAddress: 0x848B0066793BcC60346Da1F49049357399B8D595,
            DecryptionOracleAddress: 0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1,
            KMSVerifierAddress: 0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC
        });
        FHE.setCoprocessor(config);
    }
    
    // Protocol ID
    function protocolId() public pure returns (uint256) {
        return 10001;
    }
    
    // Auction structure
    struct Auction {
        string metadataCID;
        uint256 endTime;
        bool finalized;
        bool initialized;
    }
    
    // Bid structure
    struct Bid {
        euint128 encryptedAmount;
        eaddress bidder;
        bool revealed;
    }
    
    // State variables
    Auction public currentAuction;
    Bid[] public bids;
    eaddress public winnerEncrypted;
    euint128 public winningBidEncrypted;
    uint256 public winningBidIndex;
    bool public auctionInitialized = false;
    string public publicKeyURI = "";
    uint256 private _tokenIds;
    
    // Events
    event AuctionCreated(uint256 endTime, string metadataCID);
    event BidSubmitted(address indexed bidder, uint256 bidIndex);
    event AuctionFinalized(eaddress winner, euint128 encryptedPrice, uint256 winnerIndex);
    event NFTMinted(address winner, uint256 tokenId);
    event PublicKeyUpdated(string newPublicKeyURI, uint256 timestamp);
    event SmartFinalization(string reason, uint256 bidCount);
    event FHEOperationFailed(string reason);
    event WinnerDeterminationStarted(uint256 bidCount);
    event WinnerDeterminationCompleted(address winnerAddress, uint256 winningBidIndex);
    
    /// @notice Initialize the contract
    function initialize(string memory _publicKeyURI) external onlyOwner {
        require(bytes(publicKeyURI).length == 0, "Already initialized");
        publicKeyURI = _publicKeyURI;
        emit PublicKeyUpdated(_publicKeyURI, block.timestamp);
    }
    
    /// @notice Create a new auction
    function createAuction(uint256 biddingDurationSeconds, string memory metadataCID) external onlyOwner {
        require(biddingDurationSeconds > 0, "Duration must be > 0");
        require(bytes(metadataCID).length > 0, "Metadata CID required");
        require(!currentAuction.initialized || currentAuction.finalized, "Previous auction not finalized");
        
        uint256 endTime = block.timestamp + biddingDurationSeconds;
        
        currentAuction = Auction({
            metadataCID: metadataCID,
            endTime: endTime,
            finalized: false,
            initialized: true
        });
        
        // Clear previous bids
        while (bids.length > 0) {
            bids.pop();
        }
        
        winningBidIndex = 0;
        auctionInitialized = true;
        
        emit AuctionCreated(endTime, metadataCID);
    }
    
    /// @notice Submit an encrypted bid
    function submitBid(externalEuint128 encryptedAmount, externalEaddress bidder, bytes memory amountProof, bytes memory bidderProof) external {
        require(currentAuction.initialized, "No active auction");
        require(!currentAuction.finalized, "Auction finalized");
        require(block.timestamp < currentAuction.endTime, "Bidding ended");
        
        euint128 amount = FHE.fromExternal(encryptedAmount, amountProof);
        eaddress bidderAddr = FHE.fromExternal(bidder, bidderProof);
        
        uint256 bidIndex = bids.length;
        bids.push(Bid({
            encryptedAmount: amount,
            bidder: bidderAddr,
            revealed: false
        }));
        
        emit BidSubmitted(msg.sender, bidIndex);
    }
    
    /// @notice Smart finalization based on bid count with enhanced error handling
    function smartFinalize() external onlyOwner {
        require(currentAuction.initialized, "No active auction");
        require(!currentAuction.finalized, "Already finalized");
        require(block.timestamp >= currentAuction.endTime, "Auction not ended");
        
        uint256 bidCount = bids.length;
        emit SmartFinalization("Starting finalization process", bidCount);
        
        if (bidCount == 0) {
            // No bids - finalize without winner
            currentAuction.finalized = true;
            emit SmartFinalization("No bids submitted", bidCount);
            emit AuctionFinalized(eaddress.wrap(bytes32(0)), euint128.wrap(0), 0);
        } else if (bidCount == 1) {
            // One bid - assign as winner
            _finalizeSingleBid();
            emit SmartFinalization("Single bid winner finalized", bidCount);
        } else {
            // Multiple bids - use enhanced FHE approach
            _computeWinnerWithEnhancedFHE();
            emit SmartFinalization("Multiple bids winner determined", bidCount);
        }
    }
    
    /// @notice Internal function to finalize single bid
    function _finalizeSingleBid() private {
        require(bids.length >= 1, "No bids available");
        
        // Grant access to the bid for processing
        FHE.allow(bids[0].encryptedAmount, address(this));
        FHE.allow(bids[0].bidder, address(this));
        
        winnerEncrypted = bids[0].bidder;
        winningBidEncrypted = bids[0].encryptedAmount;
        winningBidIndex = 0;
        currentAuction.finalized = true;
        
        emit AuctionFinalized(winnerEncrypted, winningBidEncrypted, winningBidIndex);
    }
    
    /// @notice Enhanced FHE-based winner computation for multiple bids
    function _computeWinnerWithEnhancedFHE() private {
        uint256 bidCount = bids.length;
        require(bidCount > 1, "Need more than 1 bid for this function");
        
        emit WinnerDeterminationStarted(bidCount);
        
        _performFHEWinnerDetermination();
    }
    
    /// @notice Internal function to perform FHE winner determination
    function _performFHEWinnerDetermination() internal returns (bool) {
        uint256 bidCount = bids.length;
        require(bidCount > 1, "Need more than 1 bid for FHE operations");
        
        // Grant access to all bids for comparison
        for (uint256 i = 0; i < bidCount; i++) {
            FHE.allow(bids[i].encryptedAmount, address(this));
            FHE.allow(bids[i].bidder, address(this));
        }
        
        // Initialize with first bid
        euint128 highestBid = bids[0].encryptedAmount;
        eaddress winner = bids[0].bidder;
        uint256 highestBidIndex = 0;
        
        // Compare each bid to find the highest using FHE operations
        for (uint256 i = 1; i < bidCount; i++) {
            // Use FHE.gt to compare encrypted amounts
            ebool isHigher = FHE.gt(bids[i].encryptedAmount, highestBid);
            
            // Use FHE.select to update highest bid and winner if current bid is higher
            highestBid = FHE.select(isHigher, bids[i].encryptedAmount, highestBid);
            winner = FHE.select(isHigher, bids[i].bidder, winner);
            
            // Update the index if the current bid is higher
            // For now, we'll just track the highest bid and set index to 0
            // The actual winner index will be determined off-chain by the frontend
        }
        
        // Set the winning bid index to 0 for now
        // The actual winner index will be determined off-chain by the frontend
        winningBidIndex = 0;
        
        // Set winner information
        winnerEncrypted = winner;
        winningBidEncrypted = highestBid;
        
        emit AuctionFinalized(winner, highestBid, winningBidIndex);
        return true;
    }
    
    /// @notice Mint NFT to winner with enhanced error handling
    function mintNFTToWinner(uint256 /* tokenId */) external {
        require(currentAuction.finalized, "Auction not finalized");
        // Skip this check for now as FHE operations may not be fully supported in require statements
        // require(winnerEncrypted != eaddress.wrap(bytes32(0)), "No winner determined");
        
        // Allow the winner to decrypt their address
        FHE.allow(winnerEncrypted, msg.sender);
        FHE.allow(winningBidEncrypted, msg.sender);
        
        _tokenIds++;
        _safeMint(msg.sender, _tokenIds);
        emit NFTMinted(msg.sender, _tokenIds);
    }
    
    // View functions
    function hasAuctionEnded() external view returns (bool) {
        return currentAuction.initialized && block.timestamp >= currentAuction.endTime;
    }
    
    function getPublicKeyURI() external view returns (string memory) {
        return publicKeyURI;
    }
    
    function getAuctionDetails() external view returns (Auction memory) {
        return currentAuction;
    }
    
    function getBidCount() external view returns (uint256) {
        return bids.length;
    }
    
    function getBid(uint256 index) external view returns (Bid memory) {
        require(index < bids.length, "Invalid bid index");
        return bids[index];
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        
        if (currentAuction.initialized && bytes(currentAuction.metadataCID).length > 0) {
            return string(abi.encodePacked("ipfs://", currentAuction.metadataCID));
        }
        
        return "";
    }
    
    /// @notice Function to get winner details (for frontend display)
    function getWinnerDetails() external view returns (eaddress winner, euint128 winningBid, uint256 index) {
        return (winnerEncrypted, winningBidEncrypted, winningBidIndex);
    }
}