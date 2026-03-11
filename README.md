# 🗳️ Pollis

> A decentralized polling platform built on Ethereum. Create polls, vote with your wallet, and let the blockchain handle the rest — no middleman, no manipulation.

This is a learning project to explore Web3 development with Solidity and Next.js.

---

## Features

- **Create polls** — public or private, with a custom duration
- **Vote on-chain** — one vote per wallet, enforced by the smart contract
- **Private polls** — share a secret link with only the people you want
- **Live results** — yes/no vote counts update in real time
- **Wallet login** — no account, no password, just your MetaMask

---

## Tech Stack

| Layer                  | Technology              |
| ---------------------- | ----------------------- |
| Smart Contract         | Solidity ^0.8.28        |
| Local Blockchain       | Hardhat v3              |
| Frontend               | Next.js 16 + TypeScript |
| Wallet Connection      | wagmi + RainbowKit      |
| Blockchain Interaction | viem + ethers.js        |
| Testing                | Mocha + Chai            |

---

## Smart Contract

### Functions

| Function                                    | Description                                                        |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `createPoll(question, duration, isPrivate)` | Create a poll with a question, duration in seconds, and visibility |
| `vote(pollId, voteYes)`                     | Vote yes or no on a poll                                           |
| `getPoll(pollId)`                           | Read a poll's current state and results                            |
| `getPollCount()`                            | Get the total number of polls                                      |

### Events

| Event                                     | Description                        |
| ----------------------------------------- | ---------------------------------- |
| `PollCreated(pollID, creator, isPrivate)` | Emitted when a new poll is created |
| `Vote(pollID, voter, voteYes)`            | Emitted when a vote is cast        |

### Rules enforced on-chain

- Each wallet can only vote once per poll
- Votes are rejected after the poll has expired
- Private polls are hidden from the public feed — only accessible via direct link
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

Starts a local Ethereum node at `http://127.0.0.1:8545` with 20 funded test accounts.

### Deploy the contract

In a second terminal:

```bash
npx hardhat ignition deploy ignition/modules/Pollis.ts --network localhost
```

Copy the deployed address and update `POLLIS_ADDRESS` in `web/src/lib/contract.ts`.

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

## Environment Variables

Create `web/.env.local`:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

Get a free Project ID at [cloud.walletconnect.com](https://cloud.walletconnect.com).

---

## Project Structure

```
pollis/
├── contracts/              # Solidity smart contracts
│   └── Pollis.sol
├── ignition/               # Hardhat deploy scripts
│   └── modules/
│       └── Pollis.ts
├── test/                   # Contract tests
│   └── Pollis.ts
├── web/                    # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   └── poll/[id]/  # Direct poll page
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CreatePoll.tsx
│   │   │   └── PollList.tsx
│   │   └── lib/
│   │       ├── contract.ts # ABI + contract address
│   │       └── wagmi.ts    # wagmi config
└── hardhat.config.ts
```

---

## Why Pollis?

Traditional polls rely on a central server — the owner can manipulate results, delete votes, or shut it down. Pollis puts the logic on the blockchain: once a poll is created, nobody (not even the creator) can change the votes. Results are final, transparent, and permanent.
