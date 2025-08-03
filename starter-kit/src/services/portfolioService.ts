import axios from "axios";

const PROXY_URL = "http://localhost:5003/proxy";

export interface PortfolioData {
    totalValue: number;
    aaveValue: number;
    sparkValue: number;
    uniswapValue: number;
    curveValue: number;
    oneInchValue: number;
    pendleValue: number;
    protocolsValue: number;
    walletValue: number;
}

export interface WalletToken {
    symbol: string;
    name: string;
    amount: number;
    valueUSD: number;
    icon: string;
    decimals: number;
    address: string;
}

export const fetchWalletTokens = async (address: string, chainId: number = 1): Promise<WalletToken[]> => {
    try {
        console.log("Fetching detailed wallet tokens for address:", address, "chainId:", chainId);

        // Use the tokens snapshot endpoint which gives us clean token data
        const response = await axios.get(PROXY_URL, {
            params: {
                url: `https://api.1inch.dev/portfolio/portfolio/v5.0/tokens/snapshot?addresses=${address}&chain_id=${chainId}`
            },
            timeout: 10000
        });

        console.log("Tokens snapshot response:", response.data);

        const tokensData = response.data.result || [];
        const tokens: WalletToken[] = [];

        // Process each token from the snapshot
        for (const tokenSnapshot of tokensData) {
            // Skip tokens with zero value
            if (!tokenSnapshot.value_usd || tokenSnapshot.value_usd <= 0) {
                continue;
            }

            // Get the underlying token data (this contains the actual amounts and prices)
            const underlyingTokens = tokenSnapshot.underlying_tokens || [];
            if (underlyingTokens.length === 0) {
                continue;
            }

            // For simple tokens, there should be one underlying token
            const underlyingToken = underlyingTokens[0];

            // Create WalletToken object
            const walletToken: WalletToken = {
                symbol: tokenSnapshot.contract_symbol || underlyingToken.symbol || 'UNKNOWN',
                name: tokenSnapshot.contract_name || underlyingToken.name || 'Unknown Token',
                amount: underlyingToken.amount || 0,
                valueUSD: tokenSnapshot.value_usd,
                icon: getTokenIcon(underlyingToken.address, underlyingToken.symbol),
                decimals: underlyingToken.decimals || 18,
                address: underlyingToken.address || tokenSnapshot.contract_address
            };

            // Only include tokens with meaningful value (> $1)
            if (walletToken.valueUSD > 1) {
                tokens.push(walletToken);
            }
        }

        // Sort by USD value (descending) and return top 5
        const sortedTokens = tokens
            .sort((a, b) => b.valueUSD - a.valueUSD)
            .slice(0, 5);

        console.log("Final wallet tokens:", sortedTokens);
        return sortedTokens;

    } catch (error) {
        console.error("Error fetching wallet tokens:", error);
        
        // Return empty array if API fails
        console.warn("API failed, returning empty wallet tokens. Connect a wallet to see real data.");
        return [];
    }
};

// Token icon mapping for common tokens
const TOKEN_ICON_MAP: { [key: string]: string } = {
    // Native tokens
    'ETH': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    'BNB': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png',
    'MATIC': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
    
    // Major stablecoins
    'USDT': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    'USDC': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    'DAI': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
    'BUSD': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x4Fabb145d64652a948d72533023f6E7A623C7C53/logo.png',
    'USDS': 'https://assets.coingecko.com/coins/images/39926/standard/usds.webp',
    
    // Major tokens
    'WETH': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    'WBTC': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
    'LINK': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dFF83E8264EcF986CA/logo.png',
    'UNI': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
    'AAVE': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png',
    '1INCH': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x111111111117dC0aa78b770fA6A738034120C302/logo.png',
    'ENS': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC18360217d8f7ab5e7c516566761ea12ce7f9d72/logo.png',
    
    // DeFi tokens
    'CRV': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png',
    'COMP': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc00e94Cb662C3520282E6f5717214004A7f26888/logo.png',
    'SNX': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F/logo.png',
    'MKR': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2/logo.png',
    'YFI': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/logo.png',
    'SUSHI': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B3595068778DD592e39A122f4f5a5cF09C90fE2/logo.png',
    'PENDLE': 'https://cryptologos.cc/logos/pendle-pendle-logo.png?v=040',
    
    // Other popular tokens
    'BAT': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x0D8775F648430679A709E98d2b0Cb6250d2887EF/logo.png',
    'ZRX': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xE41d2489571d322189246DafA5ebDe1F4699F498/logo.png',
    'MANA': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x0F5D2fB29fb7d3CFeE444a200298f468908cC942/logo.png',
    'SAND': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x3845badAde8e6dFF049820680d1F14bD3903a5d0/logo.png',
    'APE': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x4d224452801ACEd8B2F0aebE155379bb5D594381/logo.png',
    'GRT': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc944E90C64B2c07662A292be6244BDf05Cda44a7/logo.png',
    
    // Stablecoin variants and newer tokens
    'FRAX': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x853d955aCEf822Db058eb8505911ED77F175b99e/logo.png',
    'LUSD': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x5f98805A4E8be255a32880FDeC7F6728C6568BA0/logo.png',
    'TUSD': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x0000000000085d4780B73119b644AE5ecd22b376/logo.png',
    'UST': 'https://assets.coingecko.com/coins/images/12681/standard/UST.png',
    'IMUSD': 'https://holder.io/wp-content/cache/thumb/48/7e472820e0adc48_150x150.webp',
    'LVLUSD': 'https://holder.io/wp-content/cache/thumb/48/7e472820e0adc48_150x150.webp',
    'USDP': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x8E870D67F660D95d5be530380D0eC0bd388289E1/logo.png',
    'GUSD': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd/logo.png',
    'SUSD': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x57Ab1E02fEE23774580C119740129eAC7081e9D3/logo.png',
    
    // Missing tokens from common sets
    'SHIB': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE/logo.png',
    'PEPE': 'https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg',
    'FLOKI': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E/logo.png',
};

// Helper function to get token icon URL with multiple fallbacks
const getTokenIcon = (address: string, symbol: string): string => {
    // Handle native ETH
    if (address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        return TOKEN_ICON_MAP['ETH'];
    }
    
    // Check symbol mapping first
    const symbolUpper = symbol?.toUpperCase();
    if (symbolUpper && TOKEN_ICON_MAP[symbolUpper]) {
        return TOKEN_ICON_MAP[symbolUpper];
    }
    
    // Try address-specific mapping for special cases
    const addressLower = address.toLowerCase();
    
    // Special mappings for tokens with different symbols or addresses
    const addressMappings: { [key: string]: string } = {
        '0xdac17f958d2ee523a2206206994597c13d831ec7': TOKEN_ICON_MAP['USDT'], // USDT
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': TOKEN_ICON_MAP['USDC'], // USDC
        '0x6b175474e89094c44da98b954eedeac495271d0f': TOKEN_ICON_MAP['DAI'], // DAI
        '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72': TOKEN_ICON_MAP['ENS'], // ENS
        '0x111111111117dc0aa78b770fa6a738034120c302': TOKEN_ICON_MAP['1INCH'], // 1INCH
        '0xdc035d45d973e3ec169d2276ddab16f1e407384f': TOKEN_ICON_MAP['USDS'], // USDS
        '0x17fc002b466eec40dae837fc4be5c67993ddbd6f': TOKEN_ICON_MAP['FRAX'], // FRAX
        '0x853d955acef822db058eb8505911ed77f175b99e': TOKEN_ICON_MAP['FRAX'], // FRAX alternative
        '0x5f98805a4e8be255a32880fdec7f6728c6568ba0': TOKEN_ICON_MAP['LUSD'], // LUSD
        '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': TOKEN_ICON_MAP['SHIB'], // SHIB
        '0x808507121b80c02388fad14726482e061b8da827': TOKEN_ICON_MAP['PENDLE'], // Pendle
        // Add any specific token addresses from the user's wallet
        '0x3b484b82567a09e2588a13d54d032153f0c0aee0': TOKEN_ICON_MAP['IMUSD'], // IMUSD/lvlUSD
    };
    
    if (addressMappings[addressLower]) {
        return addressMappings[addressLower];
    }
    
    // Try TrustWallet assets with proper checksum address
    if (address && address.length === 42) {
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
    }
    
    // Ultimate fallback - a generic token icon
    return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';
};

// Interface for protocol positions  
export interface ProtocolPosition {
    protocolId: string;
    protocolName: string;
    tokens: WalletToken[];
    totalValueUSD: number;
}

export const fetchProtocolPositions = async (address: string, chainId: number = 1): Promise<ProtocolPosition[]> => {
    try {
        console.log("Fetching detailed protocol positions for address:", address, "chainId:", chainId);

        // Fetch detailed protocol snapshot data
        const response = await axios.get(PROXY_URL, {
            params: {
                url: `https://api.1inch.dev/portfolio/portfolio/v5.0/protocols/snapshot?addresses=${address}&chain_id=${chainId}`
            },
            timeout: 10000
        });

        console.log("Protocol positions response:", response.data);

        const protocolsData = response.data.result || [];
        const protocolPositions: ProtocolPosition[] = [];

        // Group protocols by protocol_group_id
        const protocolGroups = new Map<string, any[]>();
        
        protocolsData.forEach((protocol: any) => {
            const groupId = protocol.protocol_group_id;
            if (!protocolGroups.has(groupId)) {
                protocolGroups.set(groupId, []);
            }
            protocolGroups.get(groupId)!.push(protocol);
        });

        // Process each protocol group
        for (const [groupId, protocols] of protocolGroups) {
            if (protocols.length === 0) continue;

            const firstProtocol = protocols[0];
            const protocolName = firstProtocol.protocol_group_name;
            
            // Skip if no significant value
            const totalValue = protocols.reduce((sum, p) => sum + (p.value_usd || 0), 0);
            if (totalValue < 1) continue;

            const tokens: WalletToken[] = [];

            // Process all protocols in this group
            for (const protocol of protocols) {
                // Only process underlying tokens (what user has deposited/supplied)
                // Skip reward tokens as we only want to show supplied positions
                const underlyingTokens = protocol.underlying_tokens || [];
                for (const token of underlyingTokens) {
                    if (token.amount > 0 && token.value_usd > 0) {
                        const tokenSymbol = token.symbol || 'UNKNOWN';
                        
                        // Exclude specific tokens from display
                        const excludedTokens = ['USD0', 'slvlUSD'];
                        if (excludedTokens.includes(tokenSymbol)) {
                            console.log(`Excluding token ${tokenSymbol} from display`);
                            continue;
                        }
                        
                        tokens.push({
                            symbol: tokenSymbol,
                            name: token.name || token.symbol || 'Unknown Token',
                            amount: token.amount,
                            valueUSD: token.value_usd || 0,
                            icon: getTokenIcon(token.address, token.symbol),
                            decimals: token.decimals || 18,
                            address: token.address
                        });
                    }
                }
                
                // Note: Skipping reward_tokens to only show supplied tokens
            }

            // Only add protocols that have tokens
            if (tokens.length > 0) {
                protocolPositions.push({
                    protocolId: groupId,
                    protocolName: protocolName,
                    tokens: tokens,
                    totalValueUSD: totalValue
                });
            }
        }

        console.log("Processed protocol positions:", protocolPositions);
        return protocolPositions;

    } catch (error) {
        console.error("Error fetching protocol positions:", error);
        return [];
    }
};

export const fetchPortfolioData = async (address: string, chainId: number = 1): Promise<PortfolioData> => {
    try {
        console.log("Fetching portfolio data for address:", address, "chainId:", chainId);

        // Fetch both current value and detailed protocol snapshot
        const [currentValueResponse, snapshotResponse] = await Promise.all([
            axios.get(PROXY_URL, {
                params: {
                    url: `https://api.1inch.dev/portfolio/portfolio/v5.0/general/current_value?addresses=${address}&chain_id=${chainId}&use_cache=true`
                },
                timeout: 10000
            }),
            axios.get(PROXY_URL, {
                params: {
                    url: `https://api.1inch.dev/portfolio/portfolio/v5.0/protocols/snapshot?addresses=${address}&chain_id=${chainId}`
                },
                timeout: 10000
            })
        ]);

        console.log("Portfolio current value response:", currentValueResponse.data);
        console.log("Portfolio snapshot response:", snapshotResponse.data);

        const portfolioData = currentValueResponse.data.result;
        const categories = portfolioData.by_category || [];
        const protocols = snapshotResponse.data.result || [];

        // Stablecoin list for consistent calculations
        const stablecoins = ['usds', 'usdc', 'usdt', 'dai', 'busd', 'frax', 'usdp', 'tusd', 'usdn'];

        // Helper function to calculate protocol value using the same logic as modal
        const calculateProtocolValue = (protocolNames: string[]) => {
            const matchingProtocols = protocols.filter((protocol: any) => {
                const protocolName = protocol.protocol_group_name?.toLowerCase() || '';
                return protocolNames.some(name => 
                    protocolName.includes(name) || name.includes(protocolName)
                );
            });

            let totalSupplied = 0;
            let totalRewards = 0;

            matchingProtocols.forEach((protocol: any) => {
                // Calculate supplied using stablecoin logic
                const suppliedAmount = (protocol.underlying_tokens || []).reduce((sum: number, token: any) => {
                    const tokenSymbol = (token.symbol || '').toLowerCase();
                    const isStablecoin = stablecoins.some(stable => tokenSymbol.includes(stable));
                    
                    if (isStablecoin) {
                        return sum + (token.amount || 0); // 1:1 conversion
                    } else {
                        return sum + (token.value_usd || 0); // Market price
                    }
                }, 0);

                // Calculate rewards
                const rewardsAmount = (protocol.reward_tokens || []).reduce((sum: number, token: any) => {
                    return sum + (token.value_usd || 0);
                }, 0);

                totalSupplied += suppliedAmount;
                totalRewards += rewardsAmount;
            });

            return totalSupplied + totalRewards;
        };

        // Calculate values for different protocols using corrected logic
        const aaveValue = calculateProtocolValue(['aave']);
        const sparkValue = calculateProtocolValue(['spark']);
        const uniswapValue = calculateProtocolValue(['uniswap']);
        const curveValue = calculateProtocolValue(['curve']);
        const oneInchValue = calculateProtocolValue(['1inch']);
        const pendleValue = calculateProtocolValue(['pendle']);

        // Calculate protocols value vs wallet value
        const tokensCategory = categories.find((c: any) => c.category_id === 'tokens');
        const nativeCategory = categories.find((c: any) => c.category_id === 'native');

        const protocolsValue = aaveValue + sparkValue + uniswapValue + curveValue + oneInchValue + pendleValue;
        const walletValue = (tokensCategory?.value_usd || 0) + (nativeCategory?.value_usd || 0);

        return {
            totalValue: protocolsValue + walletValue,
            aaveValue,
            sparkValue,
            uniswapValue,
            curveValue,
            oneInchValue,
            pendleValue,
            protocolsValue,
            walletValue
        };

    } catch (error) {
        console.error("Error fetching portfolio data:", error);

        // Return zero values if API fails - no mock data
        console.warn("API failed, returning zero values. Connect a wallet with DeFi positions to see real data.");
        return {
            totalValue: 0,
            aaveValue: 0,
            sparkValue: 0,
            uniswapValue: 0,
            curveValue: 0,
            oneInchValue: 0,
            pendleValue: 0,
            protocolsValue: 0,
            walletValue: 0
        };
    }
};