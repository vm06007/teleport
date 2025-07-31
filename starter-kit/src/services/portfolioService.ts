import axios from "axios";

const PROXY_URL = "http://localhost:5003/proxy";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface PortfolioData {
    totalValue: number;
    aaveValue: number;
    compoundValue: number;
    uniswapValue: number;
    curveValue: number;
}

export const fetchPortfolioData = async (address: string, chainId: number = 1): Promise<PortfolioData> => {
    try {
        console.log("Fetching portfolio data for address:", address, "chainId:", chainId);
        
        // Use 1inch API v5.0 portfolio endpoint
        const response = await axios.get(PROXY_URL, {
            params: {
                url: `https://api.1inch.dev/portfolio/portfolio/v5.0/general/current_value?addresses=${address}&chain_id=${chainId}&use_cache=true`
            },
            timeout: 10000
        });
        
        console.log("Portfolio response:", response.data);
        
        const portfolioData = response.data.result;
        const protocolGroups = portfolioData.by_protocol_group || [];
        
        // Extract values for different protocols
        const aaveProtocol = protocolGroups.find((p: any) => 
            p.protocol_group_id.toLowerCase().includes('aave')
        );
        
        const compoundProtocol = protocolGroups.find((p: any) => 
            p.protocol_group_id.toLowerCase().includes('compound')
        );
        
        const uniswapProtocol = protocolGroups.find((p: any) => 
            p.protocol_group_id.toLowerCase().includes('uniswap')
        );
        
        const curveProtocol = protocolGroups.find((p: any) => 
            p.protocol_group_id.toLowerCase().includes('curve')
        );
        
        return {
            totalValue: portfolioData.total || 0,
            aaveValue: aaveProtocol?.value_usd || 0,
            compoundValue: compoundProtocol?.value_usd || 0,
            uniswapValue: uniswapProtocol?.value_usd || 0,
            curveValue: curveProtocol?.value_usd || 0
        };
        
    } catch (error) {
        console.error("Error fetching portfolio data:", error);
        
        // Return mock data for demonstration
        return {
            totalValue: 287071.62,
            aaveValue: 33288.73,
            compoundValue: 0.000046,
            uniswapValue: 0,
            curveValue: 122650.93
        };
    }
}; 