**EarlyBirdBadge dApp – UI & Dev Spec**

**Goal:**
Build a minimal 4‑screen dApp in under 4 hours that demonstrates on‑chain NFT benefits—verifiable ownership and discount gating—through a clear user flow, with detailed dev guidance.

---

## 1. Brand & Layout
- **Palette:** White background, dark‑gray text, accent (#4F46E5) on CTAs
- **Typography:** Sans‑serif (Inter)
- **Icons:** Simple line icons for minting, sharing, pricing

---

## 2. Core Screens

### A. Landing
- **Header:** Logo + “EarlyBirdBadge”
- **Supply Banner:** “🏆 Remaining: X / 100” (live from canister query)
- **Primary CTA:** “Claim Your Badge” (disabled when X=0 or user already owns one)
- **Nav Links:** “My Badges” | “Pricing”

### B. My Badges
- **Grid Layout:** Cards showing each owned badge (image + “#ID”)
- **Empty State:** “No badges yet. Click Claim to mint one.”

### C. Badge Details
- **Image & Title:** Large badge image + “Badge #ID”
- **Actions:** 
  - **View on Explorer** (opens NFT page)
  - **Share** form (input principal → `transfer`)

### D. Pricing
- **Pricing Table:**
  | Plan         | Standard Price | Badge Holder Price |
  |--------------|----------------|--------------------|
  | Basic Access | 10 ICP / mo    | 8 ICP / mo         |
  | Pro Access   | 25 ICP / mo    | 20 ICP / mo        |
- **Logic:** If user owns ≥1 badge (`tokensOf(principal).length ≥ 1`), show Holder Price in accent color
- **CTA:** “Subscribe” (placeholder)

---

## 3. Demo Flow (5 min)
1. **Setup & Launch**
   ```bash
   dfx start --background
   dfx deploy
   cd frontend && npm install && npm start
   ```
2. **Mint Badge**
   - Landing: observe “Remaining” count
   - Click **Claim Your Badge**, see success toast + updated count
3. **View My Badges**
   - Navigate to **My Badges**, confirm minted badge card
4. **Check Pricing**
   - As anonymous: see standard prices
   - After mint/login: see discounted prices highlighted
5. **Share & Re‑verify**
   - In **Badge Details**: transfer badge to another principal
   - Switch identity, revisit **My Badges** & **Pricing** → discount applies

---

## 4. Dev Overview

### Tech Stack
- **Canister:** Rust (1.60+) using DIP‑721 NFT example
- **Frontend:** React (create‑react‑app), TypeScript, `@dfinity/agent`, `@dfinity/auth-client`
- **Tools:** DFX v0.14+, Node.js v16+, Yarn or npm

### Folder Structure
```
/canister/early_bird_badge/    # lib.rs, Cargo.toml, dfx.json
/frontend/                     # React source, package.json
/README.md                     # Project overview, setup, screenshots & video link
/docs/screenshots/             # Annotated PNGs
```

### dfx.json (excerpt)
```json
{
  "canisters": {
    "early_bird_badge": {
      "main": "canister/early_bird_badge/src/lib.rs",
      "type": "rust",
      "candid": "canister/early_bird_badge/early_bird_badge.did"
    },
    "frontend": {
      "type": "assets",
      "source": ["frontend/build"]
    }
  }
}
```

---

## 5. Detailed Developer Guide

### 5.1 Canister Implementation
- **lib.rs**: paste DIP‑721 example, then:
  ```rust
  const MAX_SUPPLY: u64 = 100;
  #[init]
  fn init() {
    nft::init(
      NFTInitArgs {
        name: "EarlyBirdBadge".to_string(),
        symbol: "EBB".to_string(),
        max_supply: MAX_SUPPLY,
        ..Default::default()
      }
    );
  }

  #[update]
  fn mint(principal: Principal) -> Result<u64, String> {
    let token_id = nft::mint(principal)?;
    Ok(token_id)
  }

  #[query]
  fn tokens_of(owner: Principal) -> Vec<u64> {
    nft::tokens_of(owner)
  }

  #[update]
  fn transfer(to: Principal, token_id: u64) -> Result<(), String> {
    nft::transfer(to, token_id)
  }
  ```
- **Build & Deploy**:
  ```bash
  dfx build early_bird_badge
  dfx deploy early_bird_badge
  ```

### 5.2 Frontend Setup
1. **Initialize**:
   ```bash
   cd frontend
   yarn create react-app . --template typescript
   yarn add @dfinity/agent @dfinity/auth-client
   ```
2. **Agent & Actor** (`src/agent.ts`):
   ```ts
   import { Actor, HttpAgent } from "@dfinity/agent";
   import { idlFactory } from "../../../canister/early_bird_badge/early_bird_badge.did";
   import { authClient } from "@dfinity/auth-client";

   // Initialize a HttpAgent pointing to local or remote IC
   const agent = new HttpAgent({ host: DFX_HOST });
   
   export const createBadgeActor = async () => {
     // Log in or reuse existing session
     await authClient.login({ identityProvider: "http://localhost:4943/#authorize" });
     const identity = await authClient.getIdentity();
     agent.setIdentity(identity!);
     return Actor.createActor(idlFactory, {
       agent,
       canisterId: process.env.REACT_APP_CANISTER_ID!,
     });
   };
   ```

### 5.3 Identity Management & Switching
To test share & re-verify flows with multiple principals, you can switch identities both via CLI and in-browser:

**CLI (Local Development)**
1. Create or select identities:
   ```bash
   dfx identity new alice
   dfx identity new bob
   ```
2. Switch identity before deploying or running REPL:
   ```bash
   dfx identity use alice
   dfx deploy early_bird_badge
   # Perform mint/test as Alice
   dfx identity use bob
   # Run REPL or frontend to test Bob's view
   ```

**In-App (Frontend)**
- Use `authClient.logout()` to clear the current session, then call `authClient.login()` again:  
  ```ts
  // Sign out current user:
  await authClient.logout();
  // Prompt login for new user:
  await authClient.login({ identityProvider: "http://localhost:4943/#authorize" });
  ```
- After re-login, rebuild actor via `createBadgeActor()` so the new principal is used.  
- Invoke `tokens_of` and pricing logic again to reflect the new identity's badge ownership.

---

### 5.4 Key Components
bash
   cd frontend
   yarn create react-app . --template typescript
   yarn add @dfinity/agent @dfinity/auth-client
   ```
2. **Agent & Actor** (`src/agent.ts`):
   ```ts
   import { Actor, HttpAgent } from "@dfinity/agent";
   import { idlFactory } from "../../../canister/early_bird_badge/early_bird_badge.did";
   import { authClient } from "@dfinity/auth-client";

   const agent = new HttpAgent({ host: DFX_HOST });
   export const createBadgeActor = async () => {
     await authClient.login();
     const identity = await authClient.getIdentity();
     agent.setIdentity(identity!);
     return Actor.createActor(idlFactory, {
       agent,
       canisterId: process.env.REACT_APP_CANISTER_ID!,
     });
   };
   ```

### 5.3 Key Components

**ClaimButton.tsx**
```tsx
import React, { useState } from "react";
import { createBadgeActor } from "./agent";

export const ClaimButton: React.FC<{ onMint: () => void }> = ({ onMint }) => {
  const [loading, setLoading] = useState(false);
  const handleMint = async () => {
    setLoading(true);
    const actor = await createBadgeActor();
    await actor.mint((await actor.getPrincipal()) as any);
    onMint();
    setLoading(false);
  };
  return (
    <button disabled={loading} onClick={handleMint}>
      {loading ? "Minting..." : "Claim Your Badge"}
    </button>
  );
};
```

**MyBadges.tsx**
```tsx
import React, { useEffect, useState } from "react";
import { createBadgeActor } from "./agent";

export const MyBadges: React.FC = () => {
  const [badges, setBadges] = useState<number[]>([]);
  useEffect(() => {
    (async () => {
      const actor = await createBadgeActor();
      const principal = await actor.getPrincipal();
      const tokens = await actor.tokens_of(principal as any);
      setBadges(tokens);
    })();
  }, []);
  return (
    <div className="badge-grid">
      {badges.length === 0 && <p>No badges yet.</p>}
      {badges.map(id => (
        <div key={id} className="badge-card">#{id}</div>
      ))}
    </div>
  );
};
```

**PricingPage.tsx**
```tsx
import React, { useEffect, useState } from "react";
import { createBadgeActor } from "./agent";

export const PricingPage: React.FC = () => {
  const [hasBadge, setHasBadge] = useState(false);
  useEffect(() => {
    (async () => {
      const actor = await createBadgeActor();
      const principal = await actor.getPrincipal();
      const tokens = await actor.tokens_of(principal as any);
      setHasBadge(tokens.length > 0);
    })();
  }, []);
  const plans = [
    { name: "Basic Access", standard: 10, discount: 8 },
    { name: "Pro Access", standard: 25, discount: 20 },
  ];
  return (
    <table>
      <thead><tr><th>Plan</th><th>Standard</th><th>Holder</th></tr></thead>
      <tbody>
        {plans.map(p => (
          <tr key={p.name}>
            <td>{p.name}</td>
            <td>{p.standard} ICP/mo</td>
            <td style={{ color: hasBadge ? '#4F46E5' : '#999' }}>
              {p.discount} ICP/mo
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

**BadgeDetail.tsx**
```tsx
import React from "react";
export const BadgeDetail: React.FC<{ id: number }> = ({ id }) => {
  const url = `https://dashboard.internetcomputer.org/canister/${process.env.REACT_APP_CANISTER_ID}/nft/${id}`;
  return (
    <div>
      <img src={`/images/badges/${id}.png`} alt={`Badge #${id}`} />
      <button onClick={() => window.open(url, '_blank')}>View on Explorer</button>
      {/* Transfer form omitted for brevity */}
    </div>
  );
};
```

### 5.4 State & Routing
- Use React Router for `/`, `/badges`, `/pricing`, `/badge/:id`
- Lift state for `remaining` and `badges` up to App.tsx
- Pass `onMint` callback to refresh state after minting

### 5.5 Styling
- CSS grid for `.badge-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }`
- Buttons: `padding: 12px 24px; background: #4F46E5; color: #fff; border-radius: 8px;`

### 5.6 Testing & Validation
- **Canister REPL**: `balance_of`, `mint`, `tokens_of`, `transfer`
- **Frontend**: manual smoke test for each flow
- **Linting**: `cargo fmt`, `npm run lint`

---

Implementers can follow these code snippets and steps to deliver a working EarlyBirdBadge dApp, showcasing NFT minting, ownership display, and discount gating logic in a rapid 4‑hour hackathon sprint.

---

## 6. FAQ & Troubleshooting

**Q1: Where do I set `DFX_HOST` and `REACT_APP_CANISTER_ID`?**  
A: Create a `.env` file in your `frontend/` folder with:
```env
REACT_APP_CANISTER_ID=<your-canister-id-here>
DFX_HOST=http://127.0.0.1:4943
```
`REACT_APP_CANISTER_ID` comes from `dfx deploy --network=local`; `DFX_HOST` ensures the agent points to your local replica.

**Q2: Why do images load from `/images/badges/:id.png`?**  
Ensure you place badge assets under `frontend/public/images/badges/` so they’re served statically. Filenames must match `tokenId` (e.g. `1.png`, `2.png`).

**Q3: I get CORS errors when calling canister from React—how to fix?**  
Make sure your local replica (`dfx start`) is running with CORS enabled. In `dfx.json`, add:
```json
"networks": {
  "local": {
    "bind": "127.0.0.1:4943",
    "type": "ephemeral"
  }
}
```
And launch with authentication HEADERS allowed by default.

**Q4: How do I catch errors from `mint()` or `transfer()`?**  
Wrap calls in `try/catch` and display user-friendly messages:
```ts
try {
  const result = await actor.mint(principal as any);
} catch(e) {
  console.error(e);
  alert("Minting failed: " + e.toString());
}
```

**Q5: Frontend seems stuck on `authClient.login()`—what now?**  
Check that you’re using the correct identity provider URL. For local dev, it’s `http://localhost:4943/#authorize`. Verify your replica port matches.

**Q6: Can I deploy to the ICP Playground instead of local?**  
Yes. Set up a wallet and deploy with `dfx deploy --network ic`. Update `DFX_HOST` in `.env` to `https://ic0.app` and use `--network ic` in your CLI commands.  

**Q7: How do I preview on the mainnet or testnet?**  
Switch network flags (`--network ic` or `--network test`) and update environment variables accordingly.  

**Q8: Where is the candid interface located?**  
After build, find it at `canister/early_bird_badge/early_bird_badge.did`. Import that path correctly in `src/agent.ts`.

---

With these FAQs, developers have quick references for common pitfalls, ensuring smoother implementation and demo.

