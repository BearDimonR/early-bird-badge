// This is a mock implementation of the agent for the frontend demo
// In a real implementation, this would use the actual Internet Computer SDK

import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";
// Assuming the candid interface is generated at this location relative to the workspace root
// Adjust the path if necessary after running 'dfx generate'
import {
  idlFactory,
  _SERVICE,
} from "../declarations/early_bird_badge/early_bird_badge.did"; // Adjust path as needed

const canisterId = process.env.NEXT_PUBLIC_EARLY_BIRD_BADGE_CANISTER_ID!;
const host = process.env.NEXT_PUBLIC_DFX_HOST!;
const identityProvider = process.env.NEXT_PUBLIC_IDENTITY_PROVIDER!;

let authClient: AuthClient | null = null;
let actor: _SERVICE | null = null;

/**
 * Initializes the AuthClient
 * @returns {Promise<AuthClient>}
 */
const getAuthClient = async (): Promise<AuthClient> => {
  if (!authClient) {
    authClient = await AuthClient.create();
  }
  return authClient;
};

/**
 * Creates an actor instance for the early_bird_badge canister
 * Requires the user to be authenticated.
 * @returns {Promise<_SERVICE>} The authenticated actor instance.
 */
export const createBadgeActor = async (): Promise<_SERVICE> => {
  if (actor) {
    // Return existing actor if already created and authenticated
    return actor;
  }

  const client = await getAuthClient();
  const isAuthenticated = await client.isAuthenticated();
  let identity: Identity;

  if (!isAuthenticated) {
    // User is not authenticated, initiate login flow
    await new Promise<void>((resolve, reject) => {
      client.login({
        identityProvider: identityProvider,
        onSuccess: resolve,
        onError: reject,
        // Optional: Set a maximum time to wait for login
        // maxTimeToLive: BigInt(60 * 60 * 1000 * 1000 * 1000), // 1 hour in nanoseconds
      });
    });
    identity = client.getIdentity();
  } else {
    // User is already authenticated
    identity = client.getIdentity();
  }

  // Create the agent
  const agent = new HttpAgent({ host, identity });

  // Fetch root key for local development environments (optional, remove for mainnet)
  if (process.env.NODE_ENV !== "production") {
    try {
      await agent.fetchRootKey();
    } catch (err) {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    }
  }

  // Create the actor instance
  actor = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId,
  });

  console.log("Actor created successfully.");
  return actor;
};

/**
 * Gets the current authenticated user's principal.
 * Requires the user to be authenticated.
 * @returns {Promise<Principal>}
 */
export const getPrincipal = async (): Promise<Principal> => {
  const client = await getAuthClient();
  if (!(await client.isAuthenticated())) {
    throw new Error("User is not authenticated.");
  }
  return client.getIdentity().getPrincipal();
};

/**
 * Logs the user out.
 * @returns {Promise<void>}
 */
export const logout = async (): Promise<void> => {
  const client = await getAuthClient();
  await client.logout();
  actor = null; // Clear the actor instance on logout
  authClient = null; // Clear the auth client instance
};

// --- Wrapper functions with basic error handling ---

/**
 * Mints a badge for the current user.
 * @returns {Promise<bigint>} The ID of the minted token.
 */
export const mintBadge = async (): Promise<bigint> => {
  const badgeActor = await createBadgeActor();
  const principal = await getPrincipal();
  try {
    const result = await badgeActor.mint(principal);
    if ("Ok" in result) {
      console.log("Mint successful, Token ID:", result.Ok);
      // The spec used u64 which corresponds to bigint in JS/TS Candid
      return result.Ok;
    } else {
      console.error("Minting failed:", result.Err);
      throw new Error(`Minting failed: ${result.Err}`);
    }
  } catch (e) {
    console.error("Error calling mint:", e);
    alert(`Minting failed: ${e instanceof Error ? e.message : String(e)}`);
    throw e; // Re-throw after logging/alerting
  }
};

/**
 * Gets the list of token IDs owned by a principal.
 * @param {Principal} owner - The principal to query.
 * @returns {Promise<bigint[]>} A list of token IDs.
 */
export const getTokensOf = async (owner: Principal): Promise<bigint[]> => {
  // Use a non-authenticating agent for this query if desired,
  // or just use the standard authenticated actor.
  const badgeActor = await createBadgeActor(); // Or create a separate query actor
  try {
    // The spec used Vec<u64>, which corresponds to bigint[]
    return await badgeActor.tokens_of(owner);
  } catch (e) {
    console.error("Error calling tokens_of:", e);
    // Depending on context, might not want to alert on read failures
    throw e;
  }
};

/**
 * Transfers a token to another principal.
 * @param {Principal} to - The recipient principal.
 * @param {bigint} tokenId - The ID of the token to transfer.
 * @returns {Promise<void>}
 */
export const transferBadge = async (
  to: Principal,
  tokenId: bigint
): Promise<void> => {
  const badgeActor = await createBadgeActor();
  try {
    const result = await badgeActor.transfer(to, tokenId);
    if ("Ok" in result) {
      console.log(`Transfer successful: Token ${tokenId} to ${to.toText()}`);
      alert(`Transfer successful!`); // Provide user feedback
    } else {
      console.error("Transfer failed:", result.Err);
      throw new Error(`Transfer failed: ${result.Err}`);
    }
  } catch (e) {
    console.error("Error calling transfer:", e);
    alert(`Transfer failed: ${e instanceof Error ? e.message : String(e)}`);
    throw e;
  }
};

/**
 * Gets the remaining supply of badges.
 * NOTE: This function needs to be added to the Rust canister!
 * @returns {Promise<bigint>} The number of remaining badges.
 */
export const getRemainingSupply = async (): Promise<bigint> => {
  const badgeActor = await createBadgeActor(); // Or a query actor
  try {
    // Assuming a 'remaining_supply' function exists that returns u64 (bigint)
    // This needs to be added to the canister's lib.rs and candid file!
    if (typeof badgeActor.remaining_supply === "function") {
      const remaining = await badgeActor.remaining_supply(); // Ideal case
      // Ensure the result is a bigint, convert if necessary (e.g., if it returns number)
      return typeof remaining === "bigint" ? remaining : BigInt(remaining);
    } else if (
      typeof badgeActor.total_supply === "function" &&
      typeof badgeActor.minted_count === "function"
    ) {
      // Fallback calculation if specific function isn't available but others are
      console.warn(
        "`remaining_supply` function not found on actor. Calculating from total_supply and minted_count."
      );
      const total = await badgeActor.total_supply(); // Assuming returns max supply (u64 -> bigint)
      const minted = await badgeActor.minted_count(); // Assuming returns current count (u64 -> bigint)
      // Ensure results are bigints before calculation
      const totalBigInt = typeof total === "bigint" ? total : BigInt(total);
      const mintedBigInt = typeof minted === "bigint" ? minted : BigInt(minted);
      return totalBigInt - mintedBigInt;
    } else {
      // Final fallback or placeholder if essential functions don't exist yet
      console.warn(
        "Essential supply functions (`remaining_supply`, `total_supply`, `minted_count`) not found on actor. Returning placeholder 100."
      );
      return BigInt(100); // Placeholder based on spec's MAX_SUPPLY
    }
  } catch (e) {
    console.error(
      "Error calling getRemainingSupply (or fallback calculation):",
      e
    );
    // Return a default/safe value or re-throw
    return BigInt(0); // Example fallback indicating an error or zero remaining
  }
};

// --- Helper to check if user owns any badge ---
/**
 * Checks if the current authenticated user owns at least one badge.
 * @returns {Promise<boolean>} True if the user owns one or more badges, false otherwise.
 */
export const checkBadgeOwnership = async (): Promise<boolean> => {
  try {
    const principal = await getPrincipal();
    const tokens = await getTokensOf(principal);
    return tokens.length > 0;
  } catch (error) {
    // If user is not authenticated, getPrincipal() will throw.
    // Also handle errors from getTokensOf.
    console.error(
      "Failed to check badge ownership (might be unauthenticated):",
      error
    );
    // Assume no badge if check fails or user isn't logged in
    return false;
  }
};
