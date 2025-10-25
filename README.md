# 🧠 ZepoMINT — Fully Homomorphic Encrypted NFT Auctions (Built with Zama FHEVM)

**ZepoMINT** is a decentralized sealed-bid auction DApp that uses **Fully Homomorphic Encryption (FHE)** to ensure total bid privacy and fairness — built on **Zama’s FHEVM**.

---

## 📘 Table of Contents

* [✨ Overview](#-overview)
* [🧩 Key Features](#-key-features)
* [🏗 Architecture](#-architecture)
* [⚙️ Tech Stack](#️-tech-stack)
* [🧱 Smart Contract Functions](#-smart-contract-functions)
* [💻 Installation & Setup](#-installation--setup)
* [🔐 Environment Variables](#-environment-variables)
* [🚀 Running Locally (FHEVM Local Network)](#-running-locally-fhevm-local-network)
* [🧪 Workflow (Step-by-Step)](#-workflow-step-by-step)
* [🎨 Frontend Structure](#-frontend-structure)
* [🪄 Error Handling & Debugging](#-error-handling--debugging)
* [🏁 Future Improvements](#-future-improvements)
* [📜 License](#-license)

---

## ✨ Overview

**ZepoMINT** is a **confidential NFT auction platform** built using **Zama’s FHE (Fully Homomorphic Encryption)** technology.

It allows:

* Auction creators to launch NFT auctions.
* Bidders to submit **encrypted bids** (amounts remain private).
* Smart contracts to **compare encrypted bids directly** on-chain using FHE.
* The system to **determine the winner** and **mint the NFT** to the highest bidder — all without revealing any bid amounts.

🧠 *“ZepoMINT combines the privacy of encryption with the transparency of blockchain.”*

---

## 🧩 Key Features

| Feature                            | Description                                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| 🔒 **Fully Encrypted Bids**        | All bids are encrypted using Zama FHE. No one (not even the owner) can see bid values.    |
| 🏆 **On-chain Winner Computation** | The contract uses FHE operations (`FHE.gt`, `FHE.select`) to compute the winner securely. |
| 🎨 **NFT Minting**                 | The winning bidder automatically receives the NFT upon auction finalization.              |
| ⚙️ **Fair Auction Mechanism**      | Prevents bid manipulation and guarantees fair competition.                                |
| 🌐 **IPFS Integration**            | Metadata and assets stored on IPFS (via Pinata / nft.storage).                            |
| 🧰 **Local + Testnet Compatible**  | Can run on local FHEVM or Sepolia testnet (depending on relayer availability).            |

---

## 🏗 Architecture

```
Frontend (React + Vite)
      │
      ▼
Zama Relayer SDK (Encryption)
      │
      ▼
Smart Contract (FHE Auction)
      │
      ├── Stores encrypted bids
      ├── Computes winner (FHE.gt / FHE.select)
      └── Mints NFT to winner
      │
      ▼
IPFS (Pinata / nft.storage)
```

---

## ⚙️ Tech Stack

* **Blockchain:** Zama FHEVM / Ethereum (Sepolia)
* **Smart Contracts:** Solidity, Hardhat
* **Frontend:** React + Vite + Wagmi + Ethers.js
* **Encryption:** Zama Relayer SDK (`@zama-fhe/relayer-sdk`)
* **Storage:** IPFS / Pinata
* **Deployment:** Vercel / Netlify
* **Network:** Local FHEVM or Sepolia Testnet

---

## 🧱 Smart Contract Functions

| Function                                             | Description                                                      |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| `createAuction(string metadataCID, uint256 endTime)` | Creates a new auction with an NFT metadata CID.                  |
| `placeBid(bytes encryptedAmount)`                    | Places an encrypted bid using Zama’s relayer public key.         |
| `computeWinnerOnChain(uint256 auctionId)`            | Runs encrypted comparison on-chain to determine the highest bid. |
| `finalizeAuction(uint256 auctionId)`                 | Mints NFT to the winner and marks the auction as finalized.      |
| `getAuctionDetails(uint256 auctionId)`               | Returns metadataCID, bids, status, and winner info.              |

---

## 💻 Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/<your-username>/ZepoMINT.git
cd ZepoMINT
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Setup the local FHEVM (recommended)

```bash
git clone https://github.com/zama-ai/fhevm-hardhat-template.git
cd fhevm-hardhat-template
npm install
npx hardhat node
```

---

## 🔐 Environment Variables

Create a `.env` file in the root of your project:

```bash
VITE_NETWORK_URL=http://127.0.0.1:8545
VITE_CONTRACT_ADDRESS=0xYourContractAddress
VITE_RELAYER_URL=http://127.0.0.1:3000
VITE_KMS_VERIFIER_CONTRACT=0x...
VITE_INPUT_VERIFIER_CONTRACT=0x...
VITE_ACL_CONTRACT=0x...
VITE_DECRYPTION_ORACLE_CONTRACT=0x...
VITE_CHAIN_ID=11155111
VITE_GATEWAY_CHAIN_ID=55815
```

If using **Sepolia**, replace network URL with your Alchemy/Infura RPC.

---

## 🚀 Running Locally (FHEVM Local Network)

### 1️⃣ Start Zama local relayer

```bash
npm run relayer:start
```

### 2️⃣ Start local FHEVM chain

```bash
npm run node
```

### 3️⃣ Deploy your smart contract

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 4️⃣ Run the frontend

```bash
npm run dev
```

---

## 🧪 Workflow (Step-by-Step)

| Step | Actor        | Description                                                                                    |
| ---- | ------------ | ---------------------------------------------------------------------------------------------- |
| 1️⃣  | **Owner**    | Uploads NFT metadata & image to IPFS and creates auction on DApp.                              |
| 2️⃣  | **Bidder**   | Connects wallet, enters bid amount → SDK encrypts it using FHE → sends ciphertext to contract. |
| 3️⃣  | **Owner**    | After end time, calls **Compute Winner** → contract compares encrypted bids using FHE.         |
| 4️⃣  | **Owner**    | Calls **Finalize Auction** → NFT is minted **directly to winner’s address**.                   |
| 5️⃣  | **Frontend** | Displays winner info, final price (decrypted if allowed), and auction result.                  |

---

## 🎨 Frontend Structure

```
src/
 ├── pages/
 │   ├── CreateAuction.jsx
 │   ├── AuctionsList.jsx
 │   ├── AuctionDetails.jsx
 │   └── OwnerConsole.jsx
 ├── utils/
 │   ├── contract-interaction.js
 │   └── ipfs-utils.js
 ├── components/
 │   ├── AuctionCard.jsx
 │   ├── BidModal.jsx
 │   └── Loader.jsx
 └── App.jsx
```

---

## 🪄 Error Handling & Debugging

| Error                                       | Cause                                  | Fix                                            |
| ------------------------------------------- | -------------------------------------- | ---------------------------------------------- |
| `Bad JSON`                                  | Wrong relayer URL or invalid response  | Check `VITE_RELAYER_URL` and test `/v1/keyurl` |
| `Transaction sent but no hash found`        | Missing signer                         | Use connected wallet signer before tx call     |
| `execution reverted (unknown custom error)` | FHE coprocessor unavailable on Sepolia | Use local FHEVM                                |
| `Cannot read property toNumber`             | Bid count is BigInt                    | Use `Number(value)` or `BigInt()`              |
| `CORS blocked from Pinata`                  | Gateway blocks browser fetch           | Use another IPFS gateway or local proxy        |

---

## 🏁 Future Improvements

* [ ] Automated finalization (cron or chainlink automation)
* [ ] Multi-token auctions (ERC1155)
* [ ] On-chain NFT gallery
* [ ] Full UI polish with history & leaderboards
* [ ] FHE decryption view for verified owner
* [ ] Zama public relayer fallback with auto-detect

---

## 📜 License

MIT License © 2025 — **ZepoMINT Team**

---

## 🤝 Contributors

* **Mir Mohammed** — Founder & Lead Developer
* **OpenAI GPT-5 Assistant** — Technical Documentation Support
* **Zama AI Team** — FHEVM SDK & Encryption Infrastructure

---

## 🌍 Links

*  X  mir : https://x.com/0XMIRX
* 🔗 Zama Docs: [https://docs.zama.ai](https://docs.zama.ai)
* 🧠 FHEVM Template: [https://github.com/zama-ai/fhevm-hardhat-template](https://github.com/zama-ai/fhevm-hardhat-template)
* 🧩 Example Relayer SDK: [https://www.npmjs.com/package/@zama-fhe/relayer-sdk](https://www.npmjs.com/package/@zama-fhe/relayer-sdk)
* 🌐 Live Demo (optional): [https://zepomint.vercel.app](https://zepomint.vercel.app)

---

### 💬 Notes

> ZepoMINT is built as a research-grade prototype integrating **FHE (Fully Homomorphic Encryption)** into smart contracts.
> For production use, ensure secure relayer hosting and verified key management.
