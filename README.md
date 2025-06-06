# Kickstarter-Style Ethereum DApp

Helloo!

It's my first project using Web3 and Solidity.

This project is a full-stack Ethereum crowdfunding application built with Solidity, Web3.js, and Next.js.

This project allows users to deploy campaigns, contribute funds, create spending requests, and manage approvals—all on the Sepolia test network.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
   - [1. Clone Repository](#1-clone-repository)
   - [2. Install Dependencies](#2-install-dependencies)
   - [3. Environment Variables](#3-environment-variables)
   - [4. Compile & Deploy Contracts](#4-compile--deploy-contracts)
   - [5. Run the Next.js App](#5-run-the-nextjs-app)
5. [Folder Structure](#folder-structure)
6. [Smart Contract Details](#smart-contract-details)
7. [Frontend Overview](#frontend-overview)
8. [Contributing](#contributing)
9. [License](#license)

---

## Project Overview

This application implements a decentralized crowdfunding platform similar to Kickstarter. Campaign creators can deploy new fundraising campaigns, set a minimum contribution, and manage spending requests. Contributors can fund campaigns, approve requests once certain thresholds are met, and ultimately finalize requests to transfer Ether to designated recipients.

All Solidity contracts are deployed to the Sepolia testnet.

The Next.js frontend interacts with these contracts using Web3.js, providing a responsive UI for both campaign creation and campaign management.

---

## Features

- **CampaignFactory Contract**

  - Deploy new `Campaign` contracts with a specified minimum contribution.
  - Retrieve a list of all deployed campaigns.

- **Campaign Contract**

  - Accept contributions (must exceed the minimum).
  - Track contributors (approvers) and approval counts.
  - Allow the manager to create spending requests.
  - Enable contributors to approve requests.
  - Finalize approved requests once over 50% of contributors have approved.

- **Next.js Frontend**
  - List all active campaigns.
  - Detailed campaign view showing:
    - Minimum contribution
    - Current balance
    - Number of requests
    - Number of approvers
    - Manager’s address
  - Contribution form with error/success feedback.
  - “Create Request” form for campaign managers.
  - Requests table with real-time approve/finalize buttons.
  - Automatic data refresh after contributions and approvals—no manual page reload required.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or later)
- **npm** (v6 or later) or **Yarn**
- A **MetaMask** (or other Web3-compatible) wallet configured for Sepolia
- A **mnemonic phrase** (Test account)

---

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/kickstart-ethereum.git
cd kickstart-ethereum
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env.local` at the project root (it is already listed in `.gitignore`):

```
# .env.local (do NOT commit this file)

# HDWallet mnemonic for deploying contracts
MNEMONIC="your twelve-word mnemonic here"

# Infura (or Alchemy) project ID for Sepolia network
INFURA_KEY="your_infura_project_id"
```

- `MNEMONIC` should correspond to an account with Sepolia ETH for testing.
- `INFURA_KEY` is the public key that allows JSON-RPC access to Sepolia via Infura.

### 4. Compile & Deploy Contracts

1. **Compile** your Solidity contracts:

   ```bash
   truffle compile
   ```

2. **Deploy** to Sepolia via Truffle (adjust `truffle-config.js` if needed):

   ```bash
   truffle migrate --network sepolia
   ```

   - This will deploy both `CampaignFactory.sol` and its dependent `Campaign.sol`.
   - After deployment, note the factory address printed in your console (or stored in `build/CampaignFactory.json`).

### 5. Run the Next.js App

Once contracts are deployed:

```bash
npm run dev
# or
yarn dev
```

- Open your browser at [http://localhost:3000](http://localhost:3000).
- MetaMask should prompt for account connections when you interact with “Contribute,” “Approve,” or “Finalize” buttons.

---

## Folder Structure

```
kickstart-ethereum/
├── contracts/
│   ├── CampaignFactory.sol
│   └── Campaign.sol
│
├── build/                # Truffle-generated ABIs and bytecode
│   ├── CampaignFactory.json
│   └── Campaign.json
│
│
├── pages/
│   ├── index.js                 # Landing page: lists campaigns
│   ├── campaigns/
│   │   ├── new.js               # Create a new campaign
│   │   └── [address]/
│   │       └── index.js         # Campaign detail & Contribute form
│   │       └── requests/
│   │           ├── index.js     # List all requests for a campaign
│   │           └── new.js       # Create a new spending request
│
├── components/
│   ├── Layout.js                # Site-wide header & footer wrapper
│   ├── ContributeForm.js        # Reusable contribution form
│   ├── RequestRow.js            # Single row in “Requests” table
│   └── Header.js                # Top navigation bar
│
├── ethereum/
│   ├── web3.js                  # Web3 setup (Infura or MetaMask)
│   ├── factory.js               # CampaignFactory instance
│   └── campaign.js              # Helper to create a Campaign contract wrapper
│
├── Deploy.js                    # Script to deploy CampaignFactory via Web3
│
│
├── .env.local                   # (gitignored) environment variables
├── package.json
└── README.md
```

---

## Smart Contract Details

### CampaignFactory.sol

- **`createCampaign(uint minimum)`**  
  Deploys a new `Campaign` instance with a given minimum contribution. Stores the new address in `deployedCampaigns`.

- **`getDeployedCampaigns()`**  
  Returns `address[]` of all deployed campaigns.

### Campaign.sol

- **State Variables**

  - `manager` (address)
  - `minimumContribution` (uint256)
  - `approvers` (mapping)
  - `approversCount` (uint256)
  - `requests` (dynamic array of `Request` structs)

- **`contribute()`**  
  Payable function. Requires `msg.value > minimumContribution`. Marks sender as an approver.

- **`createRequest(string description, uint256 value, address payable recipient)`** (restricted to manager)  
  Adds a new empty `Request` to `requests`.

- **`approveRequest(uint256 index)`**  
  Requires sender is an approver who hasn’t already approved. Increments `approvalCount` for that request.

- **`finalizeRequest(uint256 index)`** (restricted to manager)  
  Requires `approvalCount > approversCount / 2`. Transfers `value` to the designated `recipient` and marks the request complete.

- **View Helpers**
  - `getSummary()` returns `(minimumContribution, contractBalance, requestsLength, approversCount, manager)`
  - `getRequestsCount()` returns the number of requests
  - `getRequest(uint index)` returns details of a single request

---

## Frontend Overview

- **`pages/index.js`**

  - Fetches all deployed campaigns (`factory.methods.getDeployedCampaigns()`).
  - Renders a `Card.Group` of campaign addresses with links to each campaign’s detail page.

- **`pages/campaigns/new.js`**

  - Input for “Minimum Contribution” in **wei** (converted to Ether for display).
  - Submits `factory.methods.createCampaign(minContribution)` on-chain.

- **`pages/campaigns/[address]/index.js`**

  - Loads the campaign’s summary via `campaign(address).methods.getSummary()`.
  - Displays 5 cards: manager address, min contribution, # of requests, # of approvers, contract balance.
  - Includes a `<ContributeForm />` to send contributions.
  - “View Requests” link to `pages/campaigns/[address]/requests/index.js`.

- **`pages/campaigns/[address]/requests/index.js`**

  - Fetches `requestsCount` and `approversCount` from on-chain.
  - Uses `useEffect` + Web3 to load each request’s data.
  - Renders a `RequestRow` for each request, passing down `onRefresh` so the table auto‐updates after approve/finalize.

- **`pages/campaigns/[address]/requests/new.js`**

  - Only accessible by the campaign manager.
  - Collects: request description, Ether amount, recipient address.
  - Calls `campaign(address).methods.createRequest(...)`.

- **`components/ContributeForm.js`**

  - Controlled input for Ether amount.
  - Handles loading, validation, success/error messages.
  - On success, clears input & calls parent’s `onContributionSuccess()` (to refresh summary).

- **`components/RequestRow.js`**
  - Renders one row inside the “Requests” table.
  - Displays ID, description, amount (converted to Ether), recipient, `approvalCount/approversCount`.
  - **Approve** button (disabled if already complete or if more than 50% has already approved).
  - **Finalize** button (enabled only if >50% approvals and not already complete).
  - After each action, calls `onRefresh()` (provided by parent) to reload the entire request list.

---

## Contributing

1. Fork this repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Install dependencies and set up your `.env.local`.
4. Add your changes, including any additional tests.
5. Submit a pull request with a clear description of your changes.

---

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute for both personal and commercial purposes, as long as credit is given and any modifications are also open source under MIT.

---