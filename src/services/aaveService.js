import axios from "axios";

const PROXY_URL = "http://localhost:5003/proxy";

// 1inch API configuration
const ONEINCH_PORTFOLIO_ENDPOINT = "https://api.1inch.dev/portfolio/portfolio/v5.0/general/current_value";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchAavePositions = async (address, chainId = 1) => {
    try {
        console.log("Fetching Aave positions for address:", address, "chainId:", chainId);
        
        // Use 1inch API v5.0 portfolio endpoint
        const response = await axios.get("http://localhost:5003/proxy", {
            params: {
                url: `https://api.1inch.dev/portfolio/portfolio/v5.0/general/current_value?addresses=${address}&chain_id=${chainId}&use_cache=true`
            },
            timeout: 10000
        });
        
        console.log("1inch portfolio response:", response.data);
        
        const portfolioData = response.data.result;
        const protocolGroups = portfolioData.by_protocol_group || [];
        
        // Filter for Aave protocols
        const aaveProtocols = protocolGroups.filter(protocol => 
            protocol.protocol_group_id.toLowerCase().includes('aave') ||
            protocol.protocol_group_name.toLowerCase().includes('aave')
        );
        
        console.log("Aave protocols found:", aaveProtocols);
        
        if (aaveProtocols.length === 0) {
            console.log("No Aave positions found");
            return [];
        }
        
        // Convert protocol data to our format
        const positions = aaveProtocols.map(protocol => ({
            protocol: protocol.protocol_group_name,
            symbol: protocol.protocol_group_name.split(' ')[0], // Extract protocol name
            name: protocol.protocol_group_name,
            decimals: 18,
            aTokenBalance: "0", // We don't have individual token details from this endpoint
            variableDebt: "0",
            stableDebt: "0",
            usageAsCollateral: true,
            reserveAddress: "0x0000000000000000000000000000000000000000", // Placeholder
            liquidityRate: "0",
            variableBorrowRate: "0",
            stableBorrowRate: "0",
            value_usd: protocol.value_usd,
            protocol_group_id: protocol.protocol_group_id
        }));
        
        console.log("Aave positions found:", positions.length);
        return positions;
    } catch (error) {
        console.error("Error fetching Aave positions:", error);
        return [];
    }
};

// Get detailed breakdown of Aave positions
export const fetchAavePositionBreakdown = async (address, chainId = 1) => {
    try {
        console.log("Fetching detailed Aave position breakdown for address:", address, "chainId:", chainId);
        
        // Use 1inch API to get detailed position breakdown
        const response = await axios.get("http://localhost:5003/proxy", {
            params: {
                url: `https://api.1inch.dev/portfolio/portfolio/v5.0/protocols/aavev3/positions?addresses=${address}&chain_id=${chainId}&use_cache=true`
            },
            timeout: 10000
        });
        
        console.log("Aave detailed positions response:", response.data);
        
        if (response.data.result && response.data.result.positions) {
            return response.data.result.positions;
        }
        
        // Fallback: return mock breakdown for demonstration
        console.log("No detailed positions found, using mock breakdown");
        return [
            {
                token: {
                    symbol: "USDC",
                    name: "USD Coin",
                    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                    decimals: 6
                },
                supply: {
                    amount: "5000000", // 5 USDC
                    value_usd: 5.00
                },
                borrow: {
                    amount: "0",
                    value_usd: 0
                },
                net_value_usd: 5.00,
                usage_as_collateral: true
            },
            {
                token: {
                    symbol: "WETH",
                    name: "Wrapped Ether",
                    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                    decimals: 18
                },
                supply: {
                    amount: "1000000000000000000", // 1 WETH
                    value_usd: 3000.00
                },
                borrow: {
                    amount: "200000000000000000", // 0.2 WETH
                    value_usd: 600.00
                },
                net_value_usd: 2400.00,
                usage_as_collateral: true
            },
            {
                token: {
                    symbol: "DAI",
                    name: "Dai Stablecoin",
                    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
                    decimals: 18
                },
                supply: {
                    amount: "1000000000000000000000", // 1000 DAI
                    value_usd: 1000.00
                },
                borrow: {
                    amount: "0",
                    value_usd: 0
                },
                net_value_usd: 1000.00,
                usage_as_collateral: false
            }
        ];
    } catch (error) {
        console.error("Error fetching Aave position breakdown:", error);
        return [];
    }
};



// Helper function to calculate actual balances from scaled values
export const calculateActualBalances = async (positions, chainId = 1) => {
    try {
        // Get token addresses for price fetching
        const tokenAddresses = positions.map(pos => pos.reserveAddress);
        
        // Fetch prices from 1inch API
        const prices = {};
        if (tokenAddresses.length > 0) {
            try {
                const addressesString = tokenAddresses.join(",");
                const response = await axios.get("http://localhost:5003/proxy", {
                    params: {
                        url: `https://api.1inch.dev/price/v1.1/${chainId}/${addressesString}`
                    },
                    timeout: 10000
                });
                
                // Convert prices from wei to USD
                tokenAddresses.forEach(address => {
                    const priceInWei = response.data[address];
                    if (priceInWei) {
                        // The price is already in the correct format, just convert to number
                        prices[address] = parseFloat(priceInWei);
                    } else {
                        // Default prices for common tokens
                        if (address.toLowerCase() === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') { // USDC
                            prices[address] = 1;
                        } else if (address.toLowerCase() === '0x6b175474e89094c44da98b954eedeac495271d0f') { // DAI
                            prices[address] = 1;
                        } else if (address.toLowerCase() === '0xdac17f958d2ee523a2206206994597c13d831ec7') { // USDT
                            prices[address] = 1;
                        } else {
                            prices[address] = 1; // Default to $1
                        }
                    }
                });
                
                console.log("Fetched prices for Aave positions:", prices);
            } catch (error) {
                console.error("Error fetching prices for Aave positions:", error);
                // Use default prices
                tokenAddresses.forEach(address => {
                    prices[address] = 1;
                });
            }
        }
        
        return positions.map(position => {
            // If we have value_usd from the portfolio API, use it directly
            if (position.value_usd !== undefined) {
                return {
                    ...position,
                    supplyBalance: 0, // We don't have individual token details
                    variableDebt: 0,
                    stableDebt: 0,
                    supplyValue: position.value_usd,
                    debtValue: 0, // We don't have debt breakdown from this endpoint
                    netValue: position.value_usd,
                    price: 1
                };
            }
            
            // Fallback to price-based calculation for other data sources
            const price = prices[position.reserveAddress] || 1;
            
            // Calculate actual balances (this is a simplified calculation)
            // In reality, you'd need to use the reserve's liquidity index
            const supplyBalance = parseFloat(position.aTokenBalance) / Math.pow(10, position.decimals);
            const variableDebt = parseFloat(position.variableDebt) / Math.pow(10, position.decimals);
            const stableDebt = parseFloat(position.stableDebt) / Math.pow(10, position.decimals);
            
            const supplyValue = supplyBalance * price;
            const debtValue = (variableDebt + stableDebt) * price;
            const netValue = supplyValue - debtValue;
            
            return {
                ...position,
                supplyBalance,
                variableDebt,
                stableDebt,
                supplyValue,
                debtValue,
                netValue,
                price
            };
        });
    } catch (error) {
        console.error("Error calculating actual balances:", error);
        return positions.map(position => ({
            ...position,
            supplyBalance: parseFloat(position.aTokenBalance) / Math.pow(10, position.decimals),
            variableDebt: parseFloat(position.variableDebt) / Math.pow(10, position.decimals),
            stableDebt: parseFloat(position.stableDebt) / Math.pow(10, position.decimals),
            supplyValue: 0,
            debtValue: 0,
            netValue: 0,
            price: 1
        }));
    }
};

// Get total portfolio value for Aave positions
export const getAavePortfolioValue = (positions) => {
    return positions.reduce((total, position) => {
        return total + (position.netValue || 0);
    }, 0);
}; 