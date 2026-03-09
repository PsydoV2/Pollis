# 🗳️ Pollis

> A decentralized polling platform built on Ethereum. Create polls, vote with your wallet, and let the blockchain handle the rest — no middleman, no manipulation.

This is a learning project to explore Web3 development with Solidity and Next.js.

---

## Tech Stack

| Layer             | Technology               |
| ----------------- | ------------------------ |
| Smart Contract    | Solidity ^0.8.28         |
| Local Blockchain  | Hardhat v3               |
| Frontend          | Next.js + TypeScript     |
| Wallet Connection | wagmi + RainbowKit       |
| Testing           | Mocha + Chai + Ethers.js |

---

## Smart Contract Functions

| Function                         | Description                                               |
| -------------------------------- | --------------------------------------------------------- |
| `createPoll(question, duration)` | Create a new poll with a question and duration in seconds |
| `vote(pollId, voteYes)`          | Vote yes or no on a poll — one vote per wallet            |
| `getPoll(pollId)`                | Read a poll's current state and results                   |
| `getPollCount()`                 | Get the total number of polls                             |

**Rules enforced on-chain:**

- Each wallet can only vote once per poll
- Votes are rejected after the poll duration has expired
- All results are publicly verifiable on the blockchain

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MetaMask](https://metamask.io/) browser extension

### Installation

```bash
git clone https://github.com/PsydoV2/Pollis.git
cd Pollis
npm install
```

### Run a local blockchain

```bash
npx hardhat node
```

This starts a local Ethereum node at `http://127.0.0.1:8545` with 20 funded test accounts.

### Deploy the contract

In a second terminal:

```bash
npx hardhat ignition deploy ignition/modules/Pollis.ts --network localhost
```

### Run the frontend

```bash
cd web
npm install
npm run dev
```

### Run tests

```bash
npx hardhat test
```

---

## Project Structure

```
pollis/
├── contracts/         # Solidity smart contracts
│   └── Pollis.sol
├── ignition/          # Hardhat deploy scripts
│   └── modules/
│       └── Pollis.ts
├── test/              # Contract tests
│   └── Pollis.ts
├── web/               # Next.js frontend
└── hardhat.config.ts
```

---

## Why Pollis?

Traditional polls rely on a central server — the owner can manipulate results, delete votes, or shut it down. Pollis puts the logic on the blockchain: once a poll is created, nobody (not even the creator) can change the votes. Results are final, transparent, and permanent.

---

_Built while learning Web3 development. Feedback welcome._
