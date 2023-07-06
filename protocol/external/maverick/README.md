# Non-boosted pool - addLiquidity()

When you create a new position, it gets bucketed into an NFT.

1. Mint an NFT (permissionless)
   https://etherscan.io/address/0x4a3e49f77a2a5b60682a2d6b8899c7c5211eb646#writeContract

2. Call pool.addLiquidity(nftId, mode, bin position, amounts, ...);

   The wETH:swETH pool: 
   https://etherscan.io/address/0x0CE176E1b11A8f88a4Ba2535De80E81F88592bad

# Boosted pool

A boosted pool is a contract which simply holds one of the NFTs -- a specific position in a specific mode

eg `Maverick Position-WETH-swETH-1`
https://etherscan.io/token/0xf917fe742c530bd66bcebf64b42c777b13aac92c#readContract 

This is an ERC20. It holds the NFT position ID: #537

When users add liquidity into the boosted pool, it:
- adds the liquidity into the underlying non-boosted pool for this NFT ID
- mints new position tokens
- by default, stakes this position ERC20.

# Boosted pool staking

This is the thing which gives the 3rd party protocol incentives, eg `swETH`

eg `Maverick Position-WETH-swETH-1 staking`
https://etherscan.io/address/0x7572642b2592c8daeff1dd21c20fd1e958ea2303#readContract

`rewardInfo()` shows the current reward tokens and rewards per second.

It's possible to add new tokens/incentives at any time in the future.

