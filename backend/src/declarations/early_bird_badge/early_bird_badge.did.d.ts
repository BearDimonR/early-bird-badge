import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Badge {
  'id' : bigint,
  'owner' : Principal,
  'metadata' : string,
  'timestamp' : bigint,
}
export interface _SERVICE {
  'badge_count' : ActorMethod<[], bigint>,
  'claim_badge' : ActorMethod<[string], boolean>,
  'get_all_badges' : ActorMethod<[], Array<[Principal, Badge]>>,
  'get_badge' : ActorMethod<[], [] | [Badge]>,
  'get_nft_id' : ActorMethod<[Principal], [] | [bigint]>,
  'has_badge' : ActorMethod<[], boolean>,
  'has_nft' : ActorMethod<[Principal], boolean>,
  'mint_nft' : ActorMethod<[], { 'Ok' : bigint } | { 'Err' : string }>,
  'set_admin' : ActorMethod<[Principal], undefined>,
  'total_supply' : ActorMethod<[], bigint>,
  'whoami' : ActorMethod<[], Principal>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
