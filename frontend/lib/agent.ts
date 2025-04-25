// This is a mock implementation of the agent for the frontend demo
// In a real implementation, this would use the actual Internet Computer SDK

import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";
import { AnonymousIdentity } from "@dfinity/agent";
import { idlFactory } from "../src/declarations/early_bird_badge";
import type {
  _SERVICE,
  Badge,
} from "../src/declarations/early_bird_badge/early_bird_badge.did";

const canisterId = process.env.NEXT_PUBLIC_EARLY_BIRD_BADGE_CANISTER_ID!;
const host = process.env.NEXT_PUBLIC_DFX_HOST!;
const identityProvider = process.env.NEXT_PUBLIC_IDENTITY_PROVIDER!;

let authClient: AuthClient | null = null;
// Remove the global actor instance, manage per function call or context
// let actor: _SERVICE | null = null;

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
 * Creates an agent instance.
 * @param {Identity} [identity] - Optional identity to use. Defaults to anonymous.
 * @returns {Promise<HttpAgent>} The agent instance.
 */
const createAgent = async (identity?: Identity): Promise<HttpAgent> => {
  const agent = new HttpAgent({
    host,
    identity: identity ?? new AnonymousIdentity(), // Use provided identity or anonymous
  });

  // Always fetch root key for local development
  if (host.includes("127.0.0.1") || host.includes("localhost")) {
    try {
      await agent.fetchRootKey();
      console.log("Successfully fetched root key for local development");
    } catch (err) {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    }
  }
  return agent;
};

/**
 * Creates an actor instance using an anonymous identity.
 * Suitable for read-only calls that don't require authentication.
 * @returns {Promise<_SERVICE>} The anonymous actor instance.
 */
export const getAnonymousActor = async (): Promise<_SERVICE> => {
  const agent = await createAgent(); // Uses AnonymousIdentity by default
  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId,
  });
};

/**
 * Creates an actor instance using the authenticated user's identity.
 * Throws an error if the user is not authenticated.
 * @returns {Promise<_SERVICE>} The authenticated actor instance.
 * @throws {Error} If the user is not authenticated.
 */
export const getAuthenticatedActor = async (): Promise<_SERVICE> => {
  const client = await getAuthClient();
  const isAuthenticated = await client.isAuthenticated();

  if (!isAuthenticated) {
    // Do NOT automatically login here. Let the UI handle login prompts.
    throw new Error("User is not authenticated. Please log in.");
  }

  const identity = client.getIdentity();
  const agent = await createAgent(identity);

  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId,
  });
};

/**
 * Gets the current authenticated user's principal.
 * @returns {Promise<Principal>}
 * @throws {Error} If the user is not authenticated.
 */
export const getPrincipal = async (): Promise<Principal> => {
  const client = await getAuthClient();
  if (!(await client.isAuthenticated())) {
    throw new Error("User is not authenticated.");
  }
  return client.getIdentity().getPrincipal();
};

/**
 * Checks if the user is currently authenticated.
 * @returns {Promise<boolean>}
 */
export const checkAuthentication = async (): Promise<boolean> => {
  const client = await getAuthClient();
  return await client.isAuthenticated();
};

/**
 * Initiates the login process.
 * @returns {Promise<void>}
 */
export const login = async (): Promise<void> => {
  const client = await getAuthClient();
  await new Promise<void>((resolve, reject) => {
    client.login({
      identityProvider: identityProvider,
      onSuccess: resolve,
      onError: (err) => {
        console.error("AuthClient.login onError:", err);
        reject(err);
      },
    });
  }).catch((err) => {
    console.error("Error during login attempt:", err);
    alert(`Login failed: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  });
  // Optionally, re-check authentication or fetch identity after login attempt
};

/**
 * Logs the user out.
 * @returns {Promise<void>}
 */
export const logout = async (): Promise<void> => {
  const client = await getAuthClient();
  await client.logout();
  // actor = null; // Actor instance is no longer global
  // Don't nullify authClient here, it might be needed again if the user logs back in
  // authClient = null;
};

/**
 * Claims a badge for the current authenticated user.
 * Requires the user to be logged in.
 * @param {string} metadata - Metadata for the badge
 * @returns {Promise<boolean>} Whether the claim was successful
 * @throws {Error} If the user is not authenticated or if claiming fails.
 */
export const claimBadge = async (metadata: string): Promise<boolean> => {
  // No need to check/trigger login here, getAuthenticatedActor handles the auth check
  const badgeActor = await getAuthenticatedActor(); // Will throw if not authenticated
  try {
    return await badgeActor.claim_badge(metadata);
  } catch (e) {
    console.error("Error claiming badge:", e);
    throw e; // Re-throw the error for UI handling
  }
};

/**
 * Checks if the current authenticated user has a badge.
 * Requires the user to be logged in.
 * @returns {Promise<boolean>}
 * @throws {Error} If the user is not authenticated.
 */
export const hasBadge = async (): Promise<boolean> => {
  const badgeActor = await getAuthenticatedActor(); // Will throw if not authenticated
  try {
    return await badgeActor.has_badge();
  } catch (e) {
    console.error("Error checking badge:", e);
    throw e;
  }
};

/**
 * Gets the badge details for the current authenticated user.
 * Requires the user to be logged in.
 * @returns {Promise<Badge | null | undefined>}
 * @throws {Error} If the user is not authenticated.
 */
export const getBadge = async (): Promise<Badge | null | undefined> => {
  const badgeActor = await getAuthenticatedActor(); // Will throw if not authenticated
  try {
    const result = await badgeActor.get_badge();
    if (!result) return null;
    // Ensure result is treated as an optional Badge
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  } catch (e) {
    console.error("Error getting badge:", e);
    throw e;
  }
};

/**
 * Gets the total number of badges issued. (Public access)
 * @returns {Promise<bigint>}
 */
export const getBadgeCount = async (): Promise<bigint> => {
  // Use anonymous actor for public data
  const badgeActor = await getAnonymousActor();
  try {
    return await badgeActor.badge_count();
  } catch (e) {
    console.error("Error getting badge count:", e);
    throw e;
  }
};

/**
 * Mints a new NFT for the current authenticated user.
 * Requires the user to be logged in.
 * @returns {Promise<bigint>} The ID of the minted NFT
 * @throws {Error} If the user is not authenticated or if minting fails.
 */
export const mintNFT = async (): Promise<bigint> => {
  const badgeActor = await getAuthenticatedActor(); // Will throw if not authenticated
  try {
    const result = await badgeActor.mint_nft();
    if ("Ok" in result) {
      return result.Ok;
    } else {
      // Provide more specific error from the canister if available
      throw new Error(`Minting NFT failed: ${result.Err}`);
    }
  } catch (e) {
    console.error("Error minting NFT:", e);
    throw e; // Re-throw the error for UI handling
  }
};

/**
 * Gets the total supply of NFTs. (Public access)
 * @returns {Promise<bigint>}
 */
export const getTotalSupply = async (): Promise<bigint> => {
  // Use anonymous actor for public data
  const badgeActor = await getAnonymousActor();
  try {
    return await badgeActor.total_supply();
  } catch (e) {
    console.error("Error getting total supply:", e);
    throw e;
  }
};

// --- Wrapper functions with basic error handling ---

/**
 * Mints a badge (NFT) for the current authenticated user.
 * Requires the user to be logged in. Provides UI feedback via alert on failure.
 * @returns {Promise<bigint>} The ID of the minted token.
 * @throws {Error} If the user is not authenticated or if minting fails.
 */
export const mintBadge = async (): Promise<bigint> => {
  // getAuthenticatedActor will handle the auth check
  const badgeActor = await getAuthenticatedActor();
  try {
    const result = await badgeActor.mint_nft();
    if ("Ok" in result) {
      console.log("Mint successful, Token ID:", result.Ok);
      return result.Ok;
    } else {
      console.error("Minting failed:", result.Err);
      // Alert the user with the specific error
      alert(`Minting failed: ${result.Err}`);
      throw new Error(`Minting failed: ${result.Err}`);
    }
  } catch (e) {
    console.error("Error calling mint:", e);
    // Alert for network or other unexpected errors
    if (e instanceof Error && !e.message.startsWith("Minting failed:")) {
      alert(`Minting failed: ${e.message}`);
    } else if (!(e instanceof Error)) {
      alert(`An unexpected error occurred during minting: ${String(e)}`);
    }
    // Re-throw the original error after alerting
    throw e;
  }
};

/**
 * Gets the remaining supply of badges. (Public access)
 * Assumes a max supply of 100.
 * @returns {Promise<bigint>} The number of remaining badges.
 */
export const getRemainingSupply = async (): Promise<bigint> => {
  // Use anonymous actor for public data
  const badgeActor = await getAnonymousActor();
  try {
    const totalBadges = await badgeActor.badge_count(); // Use public count
    // Consider fetching max supply from canister if it's dynamic
    const maxSupply = BigInt(100);
    const remaining =
      maxSupply > totalBadges ? maxSupply - totalBadges : BigInt(0);
    return remaining;
  } catch (e) {
    console.error("Error getting remaining supply:", e);
    // Return 0 in case of error, or re-throw based on desired UX
    return BigInt(0);
  }
};

// --- Helper to check if user owns any badge ---
/**
 * Checks if the current authenticated user owns at least one badge.
 * Requires the user to be logged in.
 * @returns {Promise<boolean>} True if the user owns one or more badges, false otherwise.
 * @throws {Error} If the user is not authenticated.
 */
export const checkBadgeOwnership = async (): Promise<boolean> => {
  // Use authenticated actor as ownership is user-specific
  const badgeActor = await getAuthenticatedActor(); // Will throw if not authenticated
  try {
    return await badgeActor.has_badge();
  } catch (error) {
    console.error("Failed to check badge ownership:", error);
    // Re-throw the error instead of returning false,
    // as the inability to check is different from not owning.
    throw error;
  }
};
