export const idlFactory = ({ IDL }) => {
  const Badge = IDL.Record({
    'id' : IDL.Nat64,
    'owner' : IDL.Principal,
    'metadata' : IDL.Text,
    'timestamp' : IDL.Nat64,
  });
  return IDL.Service({
    'badge_count' : IDL.Func([], [IDL.Nat64], ['query']),
    'claim_badge' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'get_all_badges' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, Badge))],
        ['query'],
      ),
    'get_badge' : IDL.Func([], [IDL.Opt(Badge)], ['query']),
    'get_nft_id' : IDL.Func([IDL.Principal], [IDL.Opt(IDL.Nat)], ['query']),
    'has_badge' : IDL.Func([], [IDL.Bool], ['query']),
    'has_nft' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'mint_nft' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : IDL.Text })],
        [],
      ),
    'set_admin' : IDL.Func([IDL.Principal], [], []),
    'total_supply' : IDL.Func([], [IDL.Nat], ['query']),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
