import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi } from 'viem';

// Contract configurations for different protocols
const PROTOCOL_CONFIGS = {
    uniswap: {
        // Uniswap V4 Position Manager contract address (placeholder - update with actual address)
        address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        abi: parseAbi([
            'function collect(uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max) external returns (uint256 amount0, uint256 amount1)',
            'function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)'
        ])
    },
    aave: {
        // AAVE Incentives Controller (placeholder - update with actual address)
        address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        abi: parseAbi([
            'function claimRewards(address[] calldata assets, uint256 amount, address to) external returns (uint256)',
            'function getRewardsBalance(address[] calldata assets, address user) external view returns (uint256)'
        ])
    },
    spark: {
        // Spark Protocol Incentives Controller (placeholder - update with actual address)
        address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        abi: parseAbi([
            'function claimRewards(address[] calldata assets, uint256 amount, address to) external returns (uint256)'
        ])
    },
    curve: {
        // Curve Gauge Controller (placeholder - update with actual address)
        address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        abi: parseAbi([
            'function claim_rewards(address addr) external'
        ])
    },
    '1inch': {
        // 1inch Farming Contract (placeholder - update with actual address)
        address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        abi: parseAbi([
            'function claim() external'
        ])
    },
    pendle: {
        // Pendle Market Contract (placeholder - update with actual address)
        address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        abi: parseAbi([
            'function claimRewards(address user) external returns (uint256[] memory)'
        ])
    }
};

export function useCollectInterest(protocol: string) {
    const protocolConfig = PROTOCOL_CONFIGS[protocol.toLowerCase()];
    
    const { 
        data: hash, 
        error, 
        isPending, 
        writeContract 
    } = useWriteContract();

    const { 
        isLoading: isConfirming, 
        isSuccess: isConfirmed 
    } = useWaitForTransactionReceipt({ 
        hash,
    });

    const collectInterest = async (userAddress: string) => {
        if (!protocolConfig) {
            throw new Error(`Protocol ${protocol} not supported`);
        }

        switch (protocol.toLowerCase()) {
            case 'uniswap':
                // TODO: Get user's position tokenIds first, then collect for each
                // For now, this is a placeholder
                console.log('Collecting Uniswap V4 fees...');
                break;

            case 'aave':
            case 'spark':
                // TODO: Get user's aToken addresses first
                // writeContract({
                //     address: protocolConfig.address,
                //     abi: protocolConfig.abi,
                //     functionName: 'claimRewards',
                //     args: [[], BigInt(0), userAddress]
                // });
                console.log(`Claiming ${protocol} rewards...`);
                break;

            case 'curve':
                writeContract({
                    address: protocolConfig.address,
                    abi: protocolConfig.abi,
                    functionName: 'claim_rewards',
                    args: [userAddress]
                });
                break;

            case '1inch':
                writeContract({
                    address: protocolConfig.address,
                    abi: protocolConfig.abi,
                    functionName: 'claim',
                    args: []
                });
                break;

            case 'pendle':
                writeContract({
                    address: protocolConfig.address,
                    abi: protocolConfig.abi,
                    functionName: 'claimRewards',
                    args: [userAddress]
                });
                break;

            default:
                throw new Error(`Protocol ${protocol} not supported`);
        }
    };

    return {
        collectInterest,
        isPending,
        isConfirming,
        isConfirmed,
        error,
        hash
    };
}

// Helper hook to get claimable amounts (can be extended for each protocol)
export function useClaimableRewards(protocol: string, userAddress: string) {
    // TODO: Implement read calls to get claimable amounts for each protocol
    return {
        claimableAmount: 0,
        isLoading: false,
        error: null
    };
}