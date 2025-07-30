// Token addresses for common tokens across different networks
export const TOKEN_ADDRESSES = {
    // Ethereum Mainnet (Chain ID: 1)
    1: {
        USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        DAI: "0x6b175474e89094c44da98b954eedeac495271d0f",
        WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        WBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        LINK: "0x514910771af9ca656af840dff83e8264ecf986ca",
        UNI: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        AAVE: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
        MATIC: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
        ETH: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" // Native ETH
    },
    // Polygon (Chain ID: 137)
    137: {
        USDC: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "USDC.e": "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
        USDT: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
        DAI: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
        WETH: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
        WBTC: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
        LINK: "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39",
        AAVE: "0xd6df932a45c0f255f85145f286ea0b292b21c90b",
        MANA: "0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4",
        MATIC: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native MATIC
        REVV: "0xb77e62709e39ad1cbeebe77cf493745aec0f453a",
        ICE: "0xc6c855ad634dcdad23e64da71ba85b8c51e5ad7c"
    },
    // Arbitrum (Chain ID: 42161)
    42161: {
        USDC: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
        "USDC.e": "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
        USDT: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
        DAI: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
        WETH: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        WBTC: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
        LINK: "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
        UNI: "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
        ARB: "0x912ce59144191c1204e64559fe8253a0e49e6548",
        ETH: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" // Native ETH
    }
};

// Get a normalized token symbol (handles variations like USDC vs USDC.e)
export const getNormalizedSymbol = (symbol) => {
    // Remove .e suffix and convert to uppercase
    return symbol.replace(/\.e$/i, '').toUpperCase();
};

// Standard token prices (in USD) - these should be similar across networks
export const STANDARD_TOKEN_PRICES = {
    USDC: 1.00,
    USDT: 1.00,
    DAI: 1.00,
    WETH: 3400.00,
    ETH: 3400.00,
    WBTC: 65000.00,
    LINK: 22.50,
    UNI: 15.00,
    AAVE: 280.00,
    MATIC: 0.95,
    ARB: 1.80,
    MANA: 0.85,
    REVV: 0.15,
    ICE: 0.02
};

// Get price for a token based on its symbol
export const getTokenPrice = (symbol) => {
    const normalizedSymbol = getNormalizedSymbol(symbol);
    return STANDARD_TOKEN_PRICES[normalizedSymbol] || 0.01;
};

// Check if an address is the native currency for a given chain
export const isNativeCurrency = (address, chainId) => {
    return address.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
};

// Get native currency symbol for a chain
export const getNativeCurrencySymbol = (chainId) => {
    switch (chainId) {
        case 1:
        case 42161:
            return "ETH";
        case 137:
            return "MATIC";
        default:
            return "ETH";
    }
};