# EarlyBirdBadge dApp - QA & Demo Guide

This guide outlines the steps to test and demonstrate the core functionality of the EarlyBirdBadge dApp.

**Prerequisites:**

1.  **Repository Cloned:** You have the project code locally.
2.  **Dependencies Installed:**
    - `dfx` (version 0.14+ recommended)
    - Node.js (v16+ recommended)
    - `pnpm` (or `npm`/`yarn` - adjust commands if needed)
3.  **Canister Deployed:** The `early_bird_badge` canister is built and deployed (locally or to a network).
    - _Note:_ Ensure the Rust code includes necessary functions like `total_supply`, `minted_count` or `remaining_supply` for accurate display.
    - _Note:_ Ensure the `.env` file at the project root has the correct `NEXT_PUBLIC_EARLY_BIRD_BADGE_CANISTER_ID`, `NEXT_PUBLIC_DFX_HOST`, and `NEXT_PUBLIC_IDENTITY_PROVIDER` values for your deployment environment.
4.  **Identities (for Sharing Test):** You have multiple `dfx` identities created (e.g., `alice`, `bob`) using `dfx identity new <name>`.

## Demo Flow (Approx. 5 minutes)

### 1. Setup & Launch

- **Start Local Replica (if running locally):**
  ```bash
  dfx start --background --clean
  ```
- **Deploy Canister (using your default/first identity, e.g., 'default' or 'alice'):**
  ```bash
  # Ensure you are using the identity you want to mint with first
  # dfx identity use default
  dfx deploy early_bird_badge
  # Note the canister ID output and update .env if needed
  ```
- **Generate Candid Bindings:**
  ```bash
  dfx generate early_bird_badge
  # Verify the output path matches the import in lib/agent.ts
  ```
- **Install Frontend Dependencies:**
  ```bash
  pnpm install
  ```
- **Start Frontend Dev Server:**
  ```bash
  pnpm dev
  ```
- **Open App:** Navigate to `http://localhost:3000` (or the port specified) in your browser.

### 2. Mint Badge (as Identity 1)

- **Observe Landing Page:**
  - Verify the "Remaining: X / 100" banner shows a number (requires canister function).
  - The "Claim Your Badge" button should be enabled (assuming supply > 0 and you don't own one yet).
- **Claim Badge:**
  - Click "Claim Your Badge".
  - The Internet Identity login window/tab should appear. Authenticate using your _current dfx identity_ (e.g., 'default' or 'alice').
  - After successful authentication and return to the app, the button should show a loading state ("Minting...").
  - A success toast "Your EarlyBirdBadge #X has been minted successfully" should appear.
  - The "Remaining" count should decrease by 1.
  - The button should now be disabled and read "Badge Claimed".
  - A message "You already own an EarlyBirdBadge..." should appear below the button.

### 3. View My Badges (as Identity 1)

- **Navigate:** Click the "My Badges" link in the header.
- **Verify:**
  - The page should load without errors.
  - You should see at least one badge card displayed in the grid, showing "Badge #X" (where X is the ID you minted).
  - Clicking the badge card should navigate you to the Badge Detail page (`/badges/X`).

### 4. Check Pricing (as Identity 1 - Badge Holder)

- **Navigate:** Click the "Pricing" link in the header.
- **Verify:**
  - The pricing plans should load.
  - The text "As an EarlyBirdBadge holder, you get exclusive discounts..." should be displayed.
  - For each plan (Basic, Pro), the **discounted price** (e.g., 8 ICP, 20 ICP) should be displayed prominently in the accent color (`#4F46E5`), and the standard price should be shown crossed out next to it.
  - The "Badge holder discount applied!" message should be visible within each card.
  - Clicking "Subscribe" should show a placeholder alert.

### 5. Share Badge & Re-verify (Requires Identity Switching)

- **Navigate to Badge Detail (as Identity 1):** Go back to "My Badges", click the badge card you own.
- **Initiate Transfer:**
  - In the "Share Badge" section, enter the Principal ID of _another_ identity (e.g., 'bob's principal obtained via `dfx identity get-principal bob`).
  - Click "Transfer Badge".
  - The button should show a loading state ("Transferring...").
  - A toast "Transfer Initiated..." should appear.
  - After a brief moment, you should be redirected back to the "My Badges" page.
- **Verify Transfer (as Identity 1):**
  - On the "My Badges" page, the previously owned badge should now be gone. The "You don't own any..." empty state should appear.
  - Navigate to "Pricing". The standard prices should now be displayed (no discount).
- **Switch Identity (In-App Logout/Login):**
  - _Challenge:_ The current `lib/agent.ts` doesn't explicitly expose a logout button/flow in the UI. To test properly in-app, you would need to:
    1.  Add a "Logout" button to the UI (e.g., in the header) that calls the `logout()` function from `lib/agent.ts`.
    2.  After logging out, clicking "Claim Your Badge" or navigating to protected pages ("My Badges") should trigger the `AuthClient.login()` flow again.
  - _Alternative (Manual):_
    1.  Clear browser application data (Local Storage, IndexedDB) for `http://localhost:3000` AND for the identity provider (`http://127.0.0.1:4943`).
    2.  Refresh the page.
    3.  Attempt to access "My Badges" or "Claim Your Badge". You should be prompted to log in again via Internet Identity. This time, authenticate as your _second_ identity (e.g., 'bob').
- **Verify Ownership & Discount (as Identity 2):**
  - Navigate to "My Badges". The badge transferred earlier should now be displayed.
  - Navigate to "Pricing". The discounted prices should now be shown for this identity.

---

This completes the core demo flow, showcasing minting, ownership verification, discount gating, and transferring NFTs.
