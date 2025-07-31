import axios from "axios";
import { getTokenPrice, isNativeCurrency, getNativeCurrencySymbol } from "../utils/tokenMappings";

const PROXY_URL = "http://localhost:5003/proxy";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchBalances = async (address, chainId = 137) => {
    try {
        console.log("Making API call to fetch balances for address:", address, "chainId:", chainId);
        const response = await axios.get(PROXY_URL, {
            params: {
                url: `https://api.1inch.dev/balance/v1.2/${chainId}/balances/${address}`
            },
            timeout: 10000 // 10 second timeout
        });
        console.log("Balance API response received:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching balances:", error);
        console.log("Using fallback mock data");
        // Fallback to mock data if API fails
        return {
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": "150000000", // USDC (6 decimals)
            "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619": "50000000000000000", // WETH (0.05 ETH)
            "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6": "1000000", // WBTC (0.01 BTC)
            "0xd6df932a45c0f255f85145f286ea0b292b21c90b": "250000000000000000000", // AAVE (250 AAVE)
        };
    }
};

export const fetchTokenDetails = async (tokenAddresses, chainId = 137) => {
    try {
        await delay(500); // Rate limiting
        const addressesString = tokenAddresses.join(",");
        const response = await axios.get(PROXY_URL, {
            params: {
                url: `https://api.1inch.dev/token/v1.2/${chainId}/custom?addresses=${addressesString}`
            },
            timeout: 10000 // 10 second timeout
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching token details:", error);
        // Fallback to mock details
        const details = {};

        const MOCK_TOKEN_DETAILS = {
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
                symbol: "USDC",
                name: "USD Coin",
                decimals: 6,
                logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png"
            },
            "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619": {
                symbol: "WETH",
                name: "Wrapped Ether",
                decimals: 18,
                logoURI: "https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png"
            }
        };

        tokenAddresses.forEach(addr => {
            if (MOCK_TOKEN_DETAILS[addr]) {
                details[addr] = MOCK_TOKEN_DETAILS[addr];
            }
        });
        return details;
    }
};

export const fetchSpotPrices = async (tokenAddresses, chainId = 137, tokenDetails = {}) => {
    try {
        await delay(500); // Rate limiting
        const addressesString = tokenAddresses.join(",");
        const apiUrl = `https://api.1inch.dev/price/v1.1/${chainId}/${addressesString}`;
        console.log("Making spot prices API call to:", apiUrl);
        console.log("Token addresses:", tokenAddresses);
        console.log("Chain ID:", chainId);
        
        const response = await axios.get(PROXY_URL, {
            params: {
                url: apiUrl
            },
            timeout: 10000 // 10 second timeout
        });

        // Convert prices using token symbols for consistency across networks
        const convertedPrices = {};
        
        tokenAddresses.forEach(address => {
            const token = tokenDetails[address];
            
            // Check if it's native currency
            if (isNativeCurrency(address, chainId)) {
                const nativeSymbol = getNativeCurrencySymbol(chainId);
                convertedPrices[address] = getTokenPrice(nativeSymbol);
            } else if (token && token.symbol) {
                // Use symbol-based pricing for consistency across networks
                convertedPrices[address] = getTokenPrice(token.symbol);
            } else {
                // For unknown tokens, try to parse the API price
                const apiPrice = response.data[address];
                if (apiPrice) {
                    const priceValue = parseFloat(apiPrice) / Math.pow(10, 18);
                    convertedPrices[address] = Math.max(0.01, priceValue * 1000);
                } else {
                    convertedPrices[address] = 0.01;
                }
            }
        });

        return convertedPrices;
    } catch (error) {
        console.error("Error fetching spot prices:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        
        // Fallback: use symbol-based pricing
        const prices = {};
        tokenAddresses.forEach(address => {
            const token = tokenDetails[address];
            
            if (isNativeCurrency(address, chainId)) {
                const nativeSymbol = getNativeCurrencySymbol(chainId);
                prices[address] = getTokenPrice(nativeSymbol);
            } else if (token && token.symbol) {
                prices[address] = getTokenPrice(token.symbol);
            } else {
                prices[address] = 0.01;
            }
        });
        
        return prices;
    }
};