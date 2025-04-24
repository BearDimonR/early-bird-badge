// This is a mock implementation of the agent for the frontend demo
// In a real implementation, this would use the actual Internet Computer SDK

import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";
import { idlFactory } from "../src/declarations/early_bird_badge";
import type {
  _SERVICE,
  Badge,
} from "../src/declarations/early_bird_badge/early_bird_badge.did";

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
 * @returns {Promise<_SERVICE>} The authenticated actor instance.
 */
export const createBadgeActor = async (): Promise<_SERVICE> => {
  if (actor) {
    return actor;
  }

  const client = await getAuthClient();
  const isAuthenticated = await client.isAuthenticated();
  let identity: Identity;

  if (!isAuthenticated) {
    await new Promise<void>((resolve, reject) => {
      client.login({
        identityProvider: identityProvider,
        onSuccess: resolve,
        onError: reject,
      });
    });
    identity = client.getIdentity();
  } else {
    identity = client.getIdentity();
  }

  const agent = new HttpAgent({ host, identity });

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

  actor = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId,
  });

  return actor;
};

/**
 * Gets the current authenticated user's principal.
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
  actor = null;
  authClient = null;
};

/**
 * Claims a badge for the current user.
 * @param {string} metadata - Metadata for the badge
 * @returns {Promise<boolean>} Whether the claim was successful
 */
export const claimBadge = async (metadata: string): Promise<boolean> => {
  const badgeActor = await createBadgeActor();
  try {
    return await badgeActor.claim_badge(metadata);
  } catch (e) {
    console.error("Error claiming badge:", e);
    throw e;
  }
};

/**
 * Checks if the current user has a badge.
 * @returns {Promise<boolean>}
 */
export const hasBadge = async (): Promise<boolean> => {
  const badgeActor = await createBadgeActor();
  try {
    return await badgeActor.has_badge();
  } catch (e) {
    console.error("Error checking badge:", e);
    throw e;
  }
};

/**
 * Gets the badge details for the current user.
 * @returns {Promise<Badge | null | undefined>}
 */
export const getBadge = async (): Promise<Badge | null | undefined> => {
  const badgeActor = await createBadgeActor();
  try {
    const result = await badgeActor.get_badge();
    if (!result) return null;
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  } catch (e) {
    console.error("Error getting badge:", e);
    throw e;
  }
};

/**
 * Gets the total number of badges issued.
 * @returns {Promise<bigint>}
 */
export const getBadgeCount = async (): Promise<bigint> => {
  const badgeActor = await createBadgeActor();
  try {
    return await badgeActor.badge_count();
  } catch (e) {
    console.error("Error getting badge count:", e);
    throw e;
  }
};

/**
 * Mints a new NFT for the current user.
 * @returns {Promise<bigint>} The ID of the minted NFT
 */
export const mintNFT = async (): Promise<bigint> => {
  const badgeActor = await createBadgeActor();
  try {
    const result = await badgeActor.mint_nft();
    if ("Ok" in result) {
      return result.Ok;
    } else {
      throw new Error(result.Err);
    }
  } catch (e) {
    console.error("Error minting NFT:", e);
    throw e;
  }
};

/**
 * Gets the total supply of NFTs.
 * @returns {Promise<bigint>}
 */
export const getTotalSupply = async (): Promise<bigint> => {
  const badgeActor = await createBadgeActor();
  try {
    return await badgeActor.total_supply();
  } catch (e) {
    console.error("Error getting total supply:", e);
    throw e;
  }
};

// --- Wrapper functions with basic error handling ---

/**
 * Mints a badge for the current user.
 * @returns {Promise<bigint>} The ID of the minted token.
 */
export const mintBadge = async (): Promise<bigint> => {
  const badgeActor = await createBadgeActor();
  try {
    const result = await badgeActor.mint_nft();
    if ("Ok" in result) {
      console.log("Mint successful, Token ID:", result.Ok);
      return result.Ok;
    } else {
      console.error("Minting failed:", result.Err);
      throw new Error(`Minting failed: ${result.Err}`);
    }
  } catch (e) {
    console.error("Error calling mint:", e);
    alert(`Minting failed: ${e instanceof Error ? e.message : String(e)}`);
    throw e;
  }
};

/**
 * Gets the remaining supply of badges.
 * NOTE: This function needs to be added to the Rust canister!
 * @returns {Promise<bigint>} The number of remaining badges.
 */
export const getRemainingSupply = async (): Promise<bigint> => {
  const badgeActor = await createBadgeActor();
  try {
    const total = await badgeActor.total_supply();
    return total;
  } catch (e) {
    console.error("Error getting total supply:", e);
    return BigInt(0);
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
    const badgeActor = await createBadgeActor();
    return await badgeActor.has_nft(principal);
  } catch (error) {
    console.error("Failed to check badge ownership:", error);
    return false;
  }
};
