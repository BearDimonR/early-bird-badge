use candid::{CandidType, Deserialize, Nat, Principal};
use ic_cdk::{caller, id, trap};
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};

// State management
thread_local! {
    static BADGE_OWNERS: RefCell<HashMap<Principal, Badge>> = RefCell::new(HashMap::new());
    static CLAIMED: RefCell<HashSet<Principal>> = RefCell::new(HashSet::new());
    static ADMIN: RefCell<Principal> = RefCell::new(Principal::anonymous());
    static NFT_OWNERS: RefCell<HashMap<Principal, Nat>> = RefCell::new(HashMap::new());
    static NEXT_NFT_ID: RefCell<Nat> = RefCell::new(Nat::from(1u64));
}

// Badge data structure
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Badge {
    id: u64,
    owner: Principal,
    metadata: String,
    timestamp: u64,
}

// Query to check if caller has claimed the badge
#[query]
fn has_badge() -> bool {
    let caller = caller();
    if caller == Principal::anonymous() {
        trap("Anonymous principal not allowed");
    }
    
    BADGE_OWNERS.with(|badge_owners| {
        badge_owners.borrow().contains_key(&caller)
    })
}

// Query to get badge details if the caller has one
#[query]
fn get_badge() -> Option<Badge> {
    let caller = caller();
    if caller == Principal::anonymous() {
        trap("Anonymous principal not allowed");
    }
    
    BADGE_OWNERS.with(|badge_owners| {
        badge_owners.borrow().get(&caller).cloned()
    })
}

// Update call to claim the early bird badge
#[update]
fn claim_badge(metadata: String) -> bool {
    let caller = caller();
    if caller == Principal::anonymous() {
        trap("Anonymous principal not allowed");
    }
    
    // Check if the caller has already claimed a badge
    let already_claimed = CLAIMED.with(|claimed| {
        claimed.borrow().contains(&caller)
    });
    
    if already_claimed {
        trap("Badge already claimed");
    }
    
    // Generate a new badge ID (simple increment based on current count)
    let badge_id = BADGE_OWNERS.with(|badge_owners| {
        badge_owners.borrow().len() as u64 + 1
    });
    
    // Current timestamp (IC time in nanoseconds)
    let timestamp = ic_cdk::api::time();
    
    // Create the new badge
    let badge = Badge {
        id: badge_id,
        owner: caller,
        metadata,
        timestamp,
    };
    
    // Add to claimed set and badge owners map
    CLAIMED.with(|claimed| {
        claimed.borrow_mut().insert(caller);
    });
    
    BADGE_OWNERS.with(|badge_owners| {
        badge_owners.borrow_mut().insert(caller, badge);
    });
    
    true
}

// Admin functions
#[update]
fn set_admin(new_admin: Principal) {
    let caller = caller();
    
    // Only the current admin or canister itself can set a new admin
    ADMIN.with(|admin| {
        let current_admin = *admin.borrow();
        if caller != current_admin && caller != id() {
            trap("Only the admin can set a new admin");
        }
        
        *admin.borrow_mut() = new_admin;
    });
}

// Initialize the canister and set the caller as admin
#[init]
fn init() {
    let caller = caller();
    ADMIN.with(|admin| {
        *admin.borrow_mut() = caller;
    });
}

// Query to get all badge owners (admin only)
#[query]
fn get_all_badges() -> Vec<(Principal, Badge)> {
    let caller = caller();
    
    // Verify admin
    ADMIN.with(|admin| {
        if caller != *admin.borrow() {
            trap("Only admin can view all badges");
        }
    });
    
    // Return all badges
    BADGE_OWNERS.with(|badge_owners| {
        badge_owners.borrow().iter().map(|(p, b)| (*p, b.clone())).collect()
    })
}

// Get the total count of badges issued
#[query]
fn badge_count() -> u64 {
    BADGE_OWNERS.with(|badge_owners| {
        badge_owners.borrow().len() as u64
    })
}

// Returns the Principal ID of the caller
#[ic_cdk::query]
fn whoami() -> Principal {
    caller()
}

// Mint a new Early Bird Badge NFT
#[ic_cdk::update]
fn mint_nft() -> Result<Nat, String> {
    let caller = caller();
    
    // Check if the caller already has an NFT
    if has_nft(caller) {
        return Err("You already have an Early Bird Badge NFT".to_string());
    }
    
    // Get the next NFT ID
    let nft_id = NEXT_NFT_ID.with(|id| {
        let current = id.borrow().clone();
        *id.borrow_mut() = current.clone() + Nat::from(1u64);
        current
    });
    
    // Assign the NFT to the caller
    NFT_OWNERS.with(|owners| {
        owners.borrow_mut().insert(caller, nft_id.clone());
    });
    
    Ok(nft_id)
}

// Check if a user has an NFT
#[ic_cdk::query]
fn has_nft(user: Principal) -> bool {
    NFT_OWNERS.with(|owners| owners.borrow().contains_key(&user))
}

// Get the NFT ID for a user
#[ic_cdk::query]
fn get_nft_id(user: Principal) -> Option<Nat> {
    NFT_OWNERS.with(|owners| owners.borrow().get(&user).cloned())
}

// Get the total number of minted NFTs
#[ic_cdk::query]
fn total_supply() -> Nat {
    NEXT_NFT_ID.with(|id| {
        let current = id.borrow().clone();
        if current > Nat::from(0u64) {
            current - Nat::from(1u64)
        } else {
            Nat::from(0u64)
        }
    })
}

// Generate Candid interface
candid::export_service!(); 

#[ic_cdk_macros::query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
} 