export const PayoutFluxABI = [
  {
    "type": "function",
    "name": "claimTokens",
    "inputs": [
      {"name": "tokenAddresses", "type": "address[]"},
      {"name": "tokenAmounts", "type": "uint256[]"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "admin",
    "inputs": [],
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transferAdmin",
    "inputs": [
      {"name": "newAdmin", "type": "address"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "TokensClaimed",
    "inputs": [
      {"name": "claimer", "type": "address", "indexed": true},
      {"name": "funder", "type": "address", "indexed": true}
    ]
  }
] as const;