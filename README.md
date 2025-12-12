# 🚀 MarsCorp: The First On-Chain Civilization Economy

![MarsCorp Banner](https://img.shields.io/badge/MarsCorp-Solana%20Economy-red?style=for-the-badge&logo=solana)
![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20Anchor%20%7C%20TypeScript-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-Hackathon%20Live-green?style=flat-square)

**MarsCorp** is a decentralized economic strategy game built on **Solana**. It combines the mechanics of a tycoon simulation with real financial stakes, allowing players to build businesses, launch tokens via bonding curves, and speculate on the outcome of the Martian economy.

> **Vision:** "Build real businesses on Mars. Launch them as IPOs. Trade, speculate, and profit—all from Earth, all on-chain."

---

## 🌟 Key Features

*   **🏭 Business Launchpad:** Create your own Martian company (Mining, Energy, Tech) and launch a token instantly via a **Bonding Curve** mechanism (fair launch, no pre-mine).
*   **💹 Decentralized Exchange:** Trade company tokens in real-time. Prices are determined by an on-chain AMM algorithm.
*   **🔮 Prediction Markets:** Speculate on economic events (e.g., "Will Helium-3 exports double?") using binary outcome markets.
*   **📊 Real-Time Indexer:** A custom high-performance indexer that aggregates on-chain data for a seamless, lag-free user experience.
*   **🕶️ "Shadow Ops":** (Experimental) High-risk PVP mechanics to sabotage competitors or steal data.

---

## 🛠️ Tech Stack

*   **Blockchain:** Solana (Devnet)
*   **Smart Contracts:** Rust (Anchor Framework)
*   **Frontend:** React 19, Vite, TailwindCSS, Framer Motion, Recharts
*   **Indexer/API:** Node.js, Express
*   **Wallet Integration:** Solana Wallet Adapter (Phantom, Solflare)

---

## ⚡ Quick Start

Follow these steps to run the full MarsCorp stack locally.

### 1. Prerequisites
*   Node.js (v18+)
*   Git

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/marscorp.git
cd marscorp
npm install
```

### 3. Start the Indexer (Backend)
The indexer fetches data from the blockchain and serves it to the frontend.

```bash
# Terminal 1
npm run server
```

### 4. Start the Frontend
Launch the user interface.

```bash
# Terminal 2
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Demo Mode & Seeding

For hackathon demonstration purposes, the application includes scripts to seed the blockchain with active data (companies, trades, price history).

**To reset/seed the market data:**

```bash
# Creates 20 realistic companies and executes random trades on Devnet
npx tsx scripts/seed-market.ts
```

*Note: This requires a funded Solana Devnet wallet in `~/.config/solana/id.json`.*

---

## 📖 Documentation

For a deep dive into the game mechanics, economic theory, and future roadmap, read the full **[MarsCorp Whitepaper](./marscorp_docs.md)**.

---

## 🏆 Hackathon Notes

*   **Contract Address:** `5GKfHwujgiKLXP84f28HyGL5FJ3AnunKsVGmKDmG6RXi` (Devnet)
*   **Indexer:** Currently running in "On-Chain Fetch Mode" (no local DB required) for ease of judging.
*   **Demo Mode:** Enabled by default to showcase full functionality without requiring wallet funds for every action (read-only views are populated).

---

*(c) 2025 MarsCorp Industries. All rights reserved.*