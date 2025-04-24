# Early Bird Badge Canister

This directory contains the Internet Computer canister implementation for the Early Bird Badge dApp.

## Overview

The Early Bird Badge canister is a Rust-based smart contract that manages NFT badges on the Internet Computer blockchain. It provides functionality for minting, transferring, and querying badge ownership.

## Key Components

### State Management

The canister uses thread-local storage to maintain state:

```rust
thread_local! {
    static BADGE_OWNERS: RefCell<HashMap<Principal, Badge>> = RefCell::new(HashMap::new());
    static CLAIMED: RefCell<HashSet<Principal>> = RefCell::new(HashSet::new());
    static ADMIN: RefCell<Principal> = RefCell::new(Principal::anonymous());
    static NFT_OWNERS: RefCell<HashMap<Principal, Nat>> = RefCell::new(HashMap::new());
    static NEXT_NFT_ID: RefCell<Nat> = RefCell::new(Nat::from(1u64));
}
```

### Badge Data Structure

```rust
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Badge {
    id: u64,
    owner: Principal,
    metadata: String,
    timestamp: u64,
}
```

## API Functions

### Badge Management

- `has_badge()`: Check if the caller has claimed a badge
- `get_badge()`: Get badge details for the caller
- `claim_badge(metadata: String)`: Claim a new badge with metadata

### NFT Functionality

- `mint_nft()`: Mint a new NFT badge
- `has_nft(user: Principal)`: Check if a user has an NFT
- `get_nft_id(user: Principal)`: Get the NFT ID for a user
- `total_supply()`: Get the total number of minted NFTs

### Admin Functions

- `set_admin(new_admin: Principal)`: Set a new admin
- `get_all_badges()`: Get all badges (admin only)

### Utility Functions

- `whoami()`: Get the caller's principal
- `badge_count()`: Get the total count of badges issued

## Development

### Prerequisites

- Rust 1.60+
- DFX v0.14+
- Internet Computer SDK

### Building

```bash
dfx build early_bird_badge
```

### Deploying

```bash
dfx deploy early_bird_badge
```

### Testing

You can test the canister using the DFX REPL:

```bash
dfx canister call early_bird_badge whoami
dfx canister call early_bird_badge mint_nft
dfx canister call early_bird_badge has_nft '(principal "YOUR_PRINCIPAL_ID")'
```

## Integration with Frontend

The frontend interacts with this canister through the Internet Computer SDK. The main integration points are in the `lib/agent.ts` file, which provides functions to:

1. Create an authenticated actor
2. Mint badges
3. Check badge ownership
4. Transfer badges
5. Query badge information

## Candid Interface

The canister's public interface is defined in `early_bird_badge.did`. This interface is used to generate TypeScript bindings for the frontend.

## Limitations

- The current implementation uses in-memory storage, which means state is reset when the canister is upgraded
- There is no persistent storage for badge metadata
- The maximum supply is hardcoded to 100 badges
