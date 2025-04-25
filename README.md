# Early Bird Badge

This project is split into two main parts:

- Frontend: Next.js application
- Backend: Internet Computer canister written in Rust

## DEMO

https://www.loom.com/share/2cd51bc8a92e4682b442e33f2d0f1fe2?sid=bde251d6-71a8-4bb7-b32c-eebb30039e26

## Project Structure

```
early-bird-badge/
├── backend/           # Backend canister code
│   ├── canister/     # Internet Computer canister
│   ├── src/          # Rust source code
│   └── Cargo.toml    # Rust dependencies
├── frontend/         # Frontend Next.js application
│   ├── app/          # Next.js pages and API routes
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions
│   └── public/       # Static assets
└── dfx.json          # DFX configuration
```

## Project Goal

The goal of this project is to build a minimal 4-screen decentralized application (dApp) that demonstrates key on-chain NFT benefits: verifiable ownership and discount gating. It aims to provide a clear user flow showcasing these features.

## Prerequisites

- Node.js (v16 or later)
- DFX (Internet Computer SDK)
- Rust and Cargo

## Setup

1. Install dependencies:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install
```

2. Start the local Internet Computer replica:

```bash
npm run start
```

3. In a new terminal, deploy the canisters:

```bash
npm run deploy
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Development

- Frontend development: Work in the `frontend` directory
- Backend development: Work in the `backend` directory
- Canister deployment: Use `npm run deploy` from the root directory

## Building for Production

```bash
npm run build
```

## Features

- 🎨 Modern, clean UI with responsive design
- 🏆 NFT Badge minting with limited supply (100 tokens)
- 💰 Discount gating for badge holders
- 🔄 Badge transfer functionality
- 🔐 Secure authentication and identity management

## Tech Stack

- **Backend:**

  - Internet Computer (IC)
  - Rust (1.60+)
  - DIP-721 NFT standard

- **Frontend:**
  - Next.js 15
  - TypeScript
  - Tailwind CSS
  - Radix UI Components
  - React Hook Form
  - Zod Validation

## Core Features

### 1. Landing Page

- Display remaining badge supply
- Claim badge functionality
- Navigation to My Badges and Pricing

### 2. My Badges

- Grid view of owned badges
- Empty state handling
- Badge details and actions

### 3. Badge Details

- Large badge display
- View on Explorer link
- Share/transfer functionality

### 4. Pricing

- Dynamic pricing table
- Automatic discount application for badge holders
- Subscription management

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run linting

### Testing Multiple Identities

For local development, you can test with multiple identities:

```bash
# Create new identities
dfx identity new alice
dfx identity new bob

# Switch between identities
dfx identity use alice
dfx identity use bob
```
