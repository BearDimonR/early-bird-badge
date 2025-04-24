# EarlyBirdBadge dApp

A decentralized application (dApp) built on the Internet Computer that demonstrates on-chain NFT benefits through verifiable ownership and discount gating. This project showcases a minimal 4-screen dApp with a clear user flow and detailed development guidance.

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

## Prerequisites

- Node.js v16+
- DFX v0.14+
- Internet Computer SDK
- Yarn or npm

## Getting Started

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd early-bird-badge
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the local Internet Computer replica**

   ```bash
   dfx start --background
   ```

4. **Deploy the canisters**

   ```bash
   dfx deploy
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Project Structure

```
/
├── app/                    # Next.js application pages
├── components/            # Reusable React components
├── canister/             # Internet Computer canister code
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── public/              # Static assets
└── styles/              # Global styles and Tailwind configuration
```

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

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

## Acknowledgments

- Internet Computer Foundation
- DIP-721 NFT Standard
- Next.js Team
- Radix UI Team
