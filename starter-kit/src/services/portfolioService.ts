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