# ZepoMint Blueprint: Production Sealed-Bid NFT Mint using Zama fhEVM v0.8

This document provides a comprehensive blueprint for ZepoMint, a production-grade sealed-bid NFT minting platform using Zama's fhEVM v0.8 for true on-chain FHE comparisons.

## Executive Summary

ZepoMint is a production sealed-bid NFT mint using **Zama fhEVM v0.8** for *true on-chain FHE comparisons* (no plaintext reveals), secured with a **threshold KMS** for key management, audited & monitored, deployed to mainnet — plus modern React/Tailwind frontend (white bg, yellow text) and full dev/ops pipeline.

## High-Level Architecture (A→Z)

### 1. Client (browser/mobile)
- UI: React + Tailwind + Framer Motion + Wagmi/RainbowKit
- Uses Zama FHE SDK (`fhevmjs` or Zama provided JS/WASM) to **encrypt bid integer** into `Uint8Array` ciphertext
- Sends ciphertext (hex) to contract `submitBid(bytes)`

### 2. On-chain (fhEVM v0.8)
- Contract uses **fhEVM native encrypted integer types** (e.g., `euint256`) to store and compare encrypted values **on-chain**
- Comparison / argmax done *on-chain* using fhEVM ops → no decryption needed
- Finalized clearing price stored as encrypted ciphertext; optionally publish a proof (MPC proof or zk-proof) if required

### 3. Key Management (Threshold KMS / MPC)
- Use Zama's Threshold KMS (or integrate MPC nodes) so private keys never held by single party
- Operators (N-of-M) form a signing/decryption committee for any off-chain decrypt or threshold operations
- For pure on-chain FHE compute, KMS used to generate keys and rotate them; not used for runtime decryption

### 4. Relayer / Indexer / Operator
- Optional relayer to aggregate transactions and provide faster UX
- Indexer reads contract events, shows auction state. Does NOT access plaintext

### 5. Storage & Off-chain
- All ciphertext and events stored onchain; metadata (image, description) stored on IPFS/Arweave
- Owner can publish metadata for minted NFT after mint

### 6. Monitoring / Observability
- Prometheus/Grafana + Etherscan alerts + node logs
- Sentry for frontend errors

## Why On-Chain FHE (vs Off-Chain Compute)

On-chain FHE (fhEVM) allows **trustless** comparisons inside the VM: bids remain encrypted, nobody sees raw bids, winner computation is on the blockchain itself — strongest privacy + verifiability. This is the core value prop; use fhEVM primitives (v0.8) to implement comparisons/argmax without plaintext exposure.

## Exact Contract Design (On-Chain FHE Approach)

### Contract: `ZepoMintFHE.sol` (production, fhEVM native)

**Filename**: `backend/contracts/ZepoMintFHE.sol`

**Key Features**:
- Uses `euint256` for encrypted bid storage
- Implements `submitBid(externalEuint256, bytes)` for encrypted bid submission
- Implements `computeWinnerOnChain()` for on-chain winner determination
- Uses `FHE.gt()` and `FHE.select()` for secure comparisons
- Integrates with Zama's Threshold KMS for key management

## Full On-Chain Flow (Step-by-Step)

1. **Auction Creation (owner)**
   - `createAuction(biddingDurationSeconds, metadataCID, reserveEncrypted?)` — sets `auctionEnd`

2. **Client Encryption**
   - Client uses Zama JS/WASM to encrypt integer `bid` with public key (fhe public key)
   - Convert to hex: `ethers.utils.hexlify(ct)` and submit to `submitBid(externalEuint256, bytes)`

3. **Bids Stored Onchain**
   - `encryptedBids.push({bidder: msg.sender, ciphertextHandle: bidHandle, ts: block.timestamp})`

4. **After AuctionEnd, Compute Winner (Onchain)**
   - Anyone can call `computeWinnerOnChain()` which loops over encrypted bids and uses fhEVM compare to compute encrypted argmax & encrypted clearing price

5. **Reveal & Mint**
   - Contract uses result to set `winner` by mapping argmax index to bidder address
   - Winner can call `mintNFT(tokenId)` to mint their NFT

## Client Encryption & Serialization (Exact)

**Implementation**: `frontend/app/src/utils/fhe-encrypt.js`

**Key Functions**:
- `encryptBidInteger(value, contractAddress, userAddress)` - Encrypts bid values
- `submitEncryptedBid(contract, encryptedData)` - Submits encrypted bids to contract
- `initializeRelayer(relayerUrl)` - Initializes Zama relayer for FHE operations

## Threshold KMS / Key Lifecycle (Exact Plan)

### 1. Key Generation
- Use Zama TKMS or MPC to generate a **public key** for encryption and distributed private key shares

### 2. Key Publication
- Publish public key reference onchain via `setPublicKeyURI(uri)` in contract

### 3. Key Rotation
- Use onchain governance to approve new keys; KMS rotates keys offchain

### 4. Key Use Cases
- Threshold decryption for revealing clearing price or winner index

### 5. Audit Log & Quorum
- All threshold ops produce signed logs and receipts; store on IPFS/chain

**Operational Requirements**: Maintain N ≥ 4 nodes with t = 3 for resilience

## Frontend & UX (Production, Details)

### Pages (Feature List)
1. Home — hero, how it works, live auctions
2. Mint / Auction create — owner interface to create auction
3. Auctions — list active/past auctions
4. Auction detail — show time left, submit bid
5. Owner console — fetch ciphertexts, trigger compute, finalize + mint
6. Docs — embed Zama docs links and developer notes
7. Connect Wallet — RainbowKit modal

### UI EXACT DESIGN (White bg, yellow text)
- Background: `#FFFFFF`
- Primary accent (gold): `#FFD700`
- Font stack: Inter / system-ui
- Responsive design with mobile-first approach

### Animations
- Logo: Framer Motion gradient rotation
- Cards: hover lift + soft glow
- Buttons: micro interactions

## Production Dev & Ops Checklist (A→Z)

### Dev Setup (Local)
1. Node 20.x installation
2. Hardhat environment setup
3. Environment variable configuration
4. Contract compilation and deployment

### Security & Audits (Must Do Before Mainnet)
1. Third-party audit (Trail of Bits / OpenZeppelin / Certora)
2. Threat model documentation
3. Bug bounty program (Immunefi)
4. Pen Test & Fuzzing

### Testing Plan
1. Unit tests (Hardhat) covering edge cases
2. Integration tests using fhEVM local devnet
3. Load tests: simulate thousands of encrypted bids
4. Performance benchmarks: measure gas & latency

### Cost Estimation & Gas Planning
- Calculate gas per encrypted comparison using fhEVM docs
- Consider rollup aggregation for gas savings

### Deployment Pipeline
- CI: GitHub Actions with lint, unit tests, build
- Mainnet release: Manual gated workflow with audit sign-off

### Monitoring & Incident Response
- Alerts for high gas spikes or failed txs
- Circuit breaker in contract via `Pausable`
- Incident runbook for key rotation

## Legal & Compliance Notes

- Privacy law: GDPR implications for metadata
- AML/KYC: Confidential transfers may raise AML concerns
- Consult legal counsel before mainnet launch

## Timeline & Milestone Plan (6–10 Weeks Realistic)

**Week 0–1**: Planning & infra
**Week 1–3**: Backend dev
**Week 3–5**: Frontend & encryption
**Week 5–6**: Testing & audits
**Week 6–8**: Audit + bug bounty
**Week 9**: Mainnet launch

## Exact Files & Code Hotspots

- `backend/contracts/ZepoMintFHE.sol` — fhEVM contract implementation
- `frontend/app/src/utils/fhe-encrypt.js` — Client encryption with Zama SDK
- `backend/scripts/kms-integration.js` — Threshold KMS integration
- `backend/test/ZepoMintFHE.test.js` — Unit tests
- `backend/bench/benchmark.js` — Performance benchmarks

## Testing & Benchmark Commands

```bash
# Backend testing
cd backend
npm ci
npx hardhat compile
npx hardhat test

# Frontend development
cd frontend/app
npm ci
npm run dev

# Benchmarking
node backend/bench/benchmark.js
```

## Security Checklist Before Mainnet

- [ ] Contract audit (2 independent audits)
- [ ] Threat model documentation
- [ ] MPC operator hardening (HSM for key shares)
- [ ] Bug bounty program active
- [ ] CI security: signed commits, dependabot
- [ ] Multisig control for sensitive operations

## Developer Program / Community Plan (Zama)

- Register project with Zama Developer Hub
- Prepare detailed README with testnet txs
- Apply for grants/partnerships via Zama programs

## Homepage & Overall UI Spec (Final, Full)

### Top Header
- Animated gradient gold logo
- Navigation: Home | Auctions | Mint | Docs | Connect Wallet

### Hero Block
- White background with subtle crypto illustration
- Animated gradient gold heading
- Primary/secondary call-to-action buttons

### How It Works
- 3 cards explaining the process
- Icons and clear descriptions

### Live Auctions
- Grid of auction cards
- Time left countdown
- Encrypted bid indicators

### Auction Detail
- NFT preview and metadata
- Bid submission form
- Auction details panel

### Owner Console
- Ciphertext fetching
- On-chain compute triggering
- Finalization and minting
- Audit log viewing

### Footer
- Documentation links
- GitHub repository
- Zama Developer Hub link

## Conclusion

ZepoMint represents a production-ready implementation of sealed-bid NFT auctions using cutting-edge FHE technology. By leveraging Zama's fhEVM v0.8, the platform provides unprecedented privacy guarantees while maintaining the trustless nature of blockchain systems. The comprehensive architecture, robust security measures, and professional development practices ensure a high-quality product ready for mainnet deployment.