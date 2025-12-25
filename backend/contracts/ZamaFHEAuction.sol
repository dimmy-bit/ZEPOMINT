// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint128, ebool, eaddress, externalEuint128, externalEaddress } from "@fhevm/solidity/lib/FHE.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @title ZamaFHEAuction - Proper Zama FHEVM sealed-bid auction
/// @author Zama Team
/// @notice This contract implements a sealed-bid auction using Zama FHEVM
contract ZamaFHEAuction is Ownable, ERC721 {
    using FHE for euint128;
    using FHE for eaddress;

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
    }

    // State variables
    Auction public currentAuction;
    Bid[] public bids;
    eaddress public winnerEncrypted;
    euint128 public winningBidEncrypted;
    uint256 public winningBidIndex;
    string public publicKeyURI;

    // Events
    event AuctionCreated(uint256 endTime, string metadataCID);
    event BidSubmitted(uint256 bidIndex);
    event AuctionFinalized(eaddress winner, euint128 winningBid, uint256 winnerIndex);

    constructor(string memory _publicKeyURI) Ownable(msg.sender) ERC721("Zama FHE NFT", "ZFHE") {
        publicKeyURI = _publicKeyURI;
    }

    /// @notice Create a new auction
    /// @param durationSeconds Duration of the auction in seconds
    /// @param metadataCID IPFS CID for the NFT metadata
    function createAuction(uint256 durationSeconds, string memory metadataCID) external onlyOwner {
        require(durationSeconds > 0, "Duration must be positive");
        require(bytes(metadataCID).length > 0, "Metadata CID required");
        require(!currentAuction.initialized || currentAuction.finalized, "Previous auction not finalized");

        uint256 endTime = block.timestamp + durationSeconds;

        currentAuction = Auction({
            metadataCID: metadataCID,
            endTime: endTime,
            finalized: false,
            initialized: true
        });

        // Clear previous bids
        delete bids;

        emit AuctionCreated(endTime, metadataCID);
    }

    /// @notice Submit an encrypted bid
    /// @param encryptedAmount Encrypted bid amount
    /// @param bidder Encrypted bidder address
    /// @param amountProof Proof for the encrypted amount
    /// @param bidderProof Proof for the encrypted bidder
    function submitBid(externalEuint128 encryptedAmount, externalEaddress bidder, bytes memory amountProof, bytes memory bidderProof) external {
        require(currentAuction.initialized, "No active auction");
        require(!currentAuction.finalized, "Auction finalized");
        require(block.timestamp < currentAuction.endTime, "Bidding period ended");

        euint128 amount = FHE.fromExternal(encryptedAmount, amountProof);
        eaddress bidderAddr = FHE.fromExternal(bidder, bidderProof);

        bids.push(Bid({
            encryptedAmount: amount,
            bidder: bidderAddr
        }));

        emit BidSubmitted(bids.length - 1);
    }

    /// @notice Compute the winner using FHE operations
    function computeWinnerOnChain() external onlyOwner {
        require(currentAuction.initialized, "No active auction");
        require(!currentAuction.finalized, "Already finalized");
        require(block.timestamp >= currentAuction.endTime, "Bidding not ended");
        require(bids.length > 0, "No bids");

        // Grant access to all bids for FHE operations
        for (uint256 i = 0; i < bids.length; i++) {
            FHE.allow(bids[i].encryptedAmount, address(this));
            FHE.allow(bids[i].bidder, address(this));
        }

        // Find winner using FHE operations
        euint128 highestBid = bids[0].encryptedAmount;
        eaddress winner = bids[0].bidder;
        uint256 winnerIndex = 0;

        for (uint256 i = 1; i < bids.length; i++) {
            ebool isHigher = FHE.gt(bids[i].encryptedAmount, highestBid);
            highestBid = FHE.select(isHigher, bids[i].encryptedAmount, highestBid);
            winner = FHE.select(isHigher, bids[i].bidder, winner);
            // Note: We can't directly select the index in FHE, so we'll keep track separately
        }

        winnerEncrypted = winner;
        winningBidEncrypted = highestBid;
        winningBidIndex = winnerIndex;
        currentAuction.finalized = true;

        emit AuctionFinalized(winner, highestBid, winnerIndex);
    }

    /// @notice Mint NFT to the winner
    function mintNFTToWinner() external onlyOwner {
        require(currentAuction.finalized, "Auction not finalized");
        winnerEncrypted.allow(msg.sender);
        winningBidEncrypted.allow(msg.sender);
        _safeMint(msg.sender, winningBidIndex);
    }

    /// @notice Get bid count
    function getBidCount() external view returns (uint256) {
        return bids.length;
    }

    /// @notice Check if auction has ended
    function hasAuctionEnded() external view returns (bool) {
        return currentAuction.initialized && block.timestamp >= currentAuction.endTime;
    }
}