// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint128, ebool, eaddress, externalEuint128, externalEaddress } from "@fhevm/solidity/lib/FHE.sol";
import { CoprocessorConfig } from "@fhevm/solidity/lib/Impl.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

/// @title ZepoMINTFHEAuctionSmartFinalize - Smart finalization NFT auction
/// @author Mir Mohammed
/// @notice This contract implements smart finalization logic:
/// - 0 bids: Finalize without winner
/// - 1 bid: Automatic winner
/// - 2+ bids: FHE-based winner determination
contract ZepoMINTFHEAuctionSmartFinalize is Ownable, ERC721 {
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
    
    /// @notice Smart finalization based on bid count
    function smartFinalize() external onlyOwner {
        require(currentAuction.initialized, "No active auction");
        require(!currentAuction.finalized, "Already finalized");
        require(block.timestamp >= currentAuction.endTime, "Auction not ended");
        
        uint256 bidCount = bids.length;
        
        if (bidCount == 0) {
            // No bids - finalize without winner
            currentAuction.finalized = true;
            emit SmartFinalization("No bids submitted", bidCount);
            emit AuctionFinalized(eaddress.wrap(bytes32(0)), euint128.wrap(0), 0);
        } else if (bidCount == 1) {
            // One bid - automatic winner (prevent owner from winning)
            if (bids[0].bidder == eaddress.wrap(bytes32(uint256(uint160(owner()))))) {
                // Owner bid - finalize without winner
                currentAuction.finalized = true;
                emit SmartFinalization("Owner bid - no winner", bidCount);
                emit AuctionFinalized(eaddress.wrap(bytes32(0)), euint128.wrap(0), 0);
            } else {
                // Non-owner bid - set as winner
                FHE.allow(bids[0].encryptedAmount, address(this));
                FHE.allow(bids[0].bidder, address(this));
                
                winnerEncrypted = bids[0].bidder;
                winningBidEncrypted = bids[0].encryptedAmount;
                winningBidIndex = 0;
                currentAuction.finalized = true;
                
                emit SmartFinalization("Single non-owner bid - automatic winner", bidCount);
                emit AuctionFinalized(winnerEncrypted, winningBidEncrypted, winningBidIndex);
            }
        } else {
            // Multiple bids - use FHE to determine winner (prevent owner from winning)
            _computeWinnerWithFHE();
        }
    }
    
    /// @notice Private function to compute winner using FHE
    function _computeWinnerWithFHE() private {
        // Grant access to all bids
        for (uint256 i = 0; i < bids.length; i++) {
            FHE.allow(bids[i].encryptedAmount, address(this));
            FHE.allow(bids[i].bidder, address(this));
        }
        
        // Find highest non-owner bid
        euint128 highestBid = euint128.wrap(0);
        eaddress winner = eaddress.wrap(bytes32(0));
        uint256 highestBidIndex = 0;
        bool foundNonOwnerBid = false;
        
        eaddress ownerEncrypted = FHE.asEaddress(owner());
        
        for (uint256 i = 0; i < bids.length; i++) {
            // Check if this bid is from owner
            ebool isOwnerBid = FHE.eq(bids[i].bidder, ownerEncrypted);
            ebool isNotOwnerBid = FHE.ne(bids[i].bidder, ownerEncrypted);
            
            if (FHE.decrypt(isNotOwnerBid)) {
                if (!foundNonOwnerBid) {
                    // First non-owner bid
                    highestBid = bids[i].encryptedAmount;
                    winner = bids[i].bidder;
                    highestBidIndex = i;
                    foundNonOwnerBid = true;
                } else {
                    // Compare with current highest
                    ebool isHigher = FHE.gt(bids[i].encryptedAmount, highestBid);
                    highestBid = FHE.select(isHigher, bids[i].encryptedAmount, highestBid);
                    winner = FHE.select(isHigher, bids[i].bidder, winner);
                }
            }
        }
        
        if (foundNonOwnerBid) {
            // Set winner information
            winnerEncrypted = winner;
            winningBidEncrypted = highestBid;
            winningBidIndex = highestBidIndex;
            currentAuction.finalized = true;
            
            emit SmartFinalization("Multiple bids - FHE winner determination", bids.length);
            emit AuctionFinalized(winner, highestBid, highestBidIndex);
        } else {
            // All bids from owner - no winner
            currentAuction.finalized = true;
            emit SmartFinalization("All owner bids - no winner", bids.length);
            emit AuctionFinalized(eaddress.wrap(bytes32(0)), euint128.wrap(0), 0);
        }
    }
    
    /// @notice Mint NFT to winner
    function mintNFTToWinner(uint256 tokenId) external onlyOwner {
        require(currentAuction.finalized, "Auction not finalized");
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
}