import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SparkFarmABI } from '../abi/SparkFarm';
import { PayoutFluxABI } from '../abi/PayoutFlux';
import type { UniswapPosition } from '../services/uniswapService';

const SPARK_FARM_ADDRESS = '0x173e314C7635B45322cd8Cb14f44b312e079F3af' as const;
// Uniswap V4 PositionManager
const POSITION_MANAGER_ADDRESS = '0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e' as const;
// PayoutFlux contract for batch fee collection from multiple positions
const PAYOUT_FLUX_ADDRESS = '0x126C0fB2FeB16530a295D3BbA1d9dE08096D4838' as const;
// WETH address for ETH/native token handling
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as const;

// PositionManager ABI for collect function
const POSITION_MANAGER_ABI = [
  {
    "type": "function",
    "name": "collect",
    "inputs": [
      {"name": "tokenId", "type": "uint256"},
      {"name": "recipient", "type": "address"},
      {"name": "amount0Max", "type": "uint128"},
      {"name": "amount1Max", "type": "uint128"}
    ],
    "outputs": [
      {"name": "amount0", "type": "uint256"},
      {"name": "amount1", "type": "uint256"}
    ],
    "stateMutability": "nonpayable"
  }
] as const;

export const useCollectInterest = (protocolName: string) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [operationType, setOperationType] = useState<'collect' | 'exit' | 'withdraw' | null>(null);

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: txConfirmed,
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Update confirmed state when transaction is confirmed
  useEffect(() => {
    if (txConfirmed && !isConfirmed) {
      setIsConfirmed(true);
      // Reset operation type after successful confirmation
      setTimeout(() => {
        setOperationType(null);
      }, 3000); // Show success state for 3 seconds
    }
  }, [txConfirmed, isConfirmed]);

  const collectInterest = async (account: string) => {
    try {
      setError(null);
      setIsConfirmed(false);
      setOperationType('collect');
      reset(); // Reset previous transaction state
      
      console.log(`🔄 Starting interest collection for ${protocolName} on account ${account}`);
      
      // Only handle Spark protocol with the deployed contract
      if (protocolName.toLowerCase() === 'spark') {
        await writeContract({
          address: SPARK_FARM_ADDRESS,
          abi: SparkFarmABI,
          functionName: 'getReward',
        });
        
        console.log(`📝 Transaction submitted for ${protocolName} rewards`);
      } else {
        // For other protocols, simulate the transaction (until their contracts are deployed)
        console.log(`⚠️ ${protocolName} contract not yet deployed, simulating transaction`);
        
        // Simulate transaction flow
        await new Promise(resolve => setTimeout(resolve, 1000));
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsConfirmed(true);
        
        console.log(`✅ Interest collected successfully for ${protocolName} (simulated)`);
      }
      
    } catch (err) {
      console.error(`❌ Error collecting interest for ${protocolName}:`, err);
      setError(err as Error);
    }
  };

  const collectUniswapFees = async (account: string, selectedPositions: UniswapPosition[]) => {
    try {
      setError(null);
      setIsConfirmed(false);
      setOperationType('collect');
      reset();

      console.log(`🔄 Starting Uniswap V4 fee collection for ${selectedPositions.length} positions`);

      if (selectedPositions.length === 0) {
        throw new Error('No positions selected');
      }

      // Calculate total fees from all selected positions for batch collection
      const tokenAmountsMap = new Map<string, bigint>();
      
      // Current token prices (in production, these would come from a price oracle)
      const tokenPrices: { [address: string]: number } = {
        [WETH_ADDRESS]: 3400, // ETH price in USD
        "0x6B175474E89094C44Da98b954EedeAC495271d0F": 1, // DAI price in USD
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": 1, // USDC price in USD
      };
      
      selectedPositions.forEach(position => {
        // Map currency addresses to actual token addresses (use WETH for ETH)
        const token0Address = position.poolKey.currency0 === '0x0000000000000000000000000000000000000000' 
          ? WETH_ADDRESS 
          : position.poolKey.currency0;
        const token1Address = position.poolKey.currency1 === '0x0000000000000000000000000000000000000000' 
          ? WETH_ADDRESS 
          : position.poolKey.currency1;

        // Split the USD fee amount 50/50 between the two tokens in the pair
        const halfFeeUSD = position.feesUSD / 2;
        
        // Calculate token amounts based on USD value and token prices
        const token0PriceUSD = tokenPrices[token0Address] || 1;
        const token1PriceUSD = tokenPrices[token1Address] || 1;
        
        // Convert USD amounts to token amounts (accounting for different decimal precision)
        const token0Decimals = token0Address === "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" ? 6 : 18; // USDC = 6, others = 18
        const token1Decimals = token1Address === "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" ? 6 : 18; // USDC = 6, others = 18
        
        const token0Amount = BigInt(Math.floor((halfFeeUSD / token0PriceUSD) * Math.pow(10, token0Decimals)));
        const token1Amount = BigInt(Math.floor((halfFeeUSD / token1PriceUSD) * Math.pow(10, token1Decimals)));

        // Accumulate amounts for each token across all positions
        if (token0Amount > 0) {
          tokenAmountsMap.set(
            token0Address, 
            (tokenAmountsMap.get(token0Address) || BigInt(0)) + token0Amount
          );
        }
        if (token1Amount > 0) {
          tokenAmountsMap.set(
            token1Address, 
            (tokenAmountsMap.get(token1Address) || BigInt(0)) + token1Amount
          );
        }

        console.log(`📊 Position ${position.tokenId} fee breakdown:`);
        console.log(`   Total USD fees: $${position.feesUSD}`);
        console.log(`   ${position.token0Symbol}: ${token0Amount.toString()} (${token0Decimals} decimals, ≈$${halfFeeUSD.toFixed(2)})`);
        console.log(`   ${position.token1Symbol}: ${token1Amount.toString()} (${token1Decimals} decimals, ≈$${halfFeeUSD.toFixed(2)})`);
      });

      // Convert map to arrays for PayoutFlux batch claim
      const tokenAddresses = Array.from(tokenAmountsMap.keys());
      const tokenAmounts = Array.from(tokenAmountsMap.values());

      console.log('📊 Batch fee collection summary:', tokenAmountsMap);

      // Collect fees from all selected positions using PayoutFlux contract
      console.log(`📝 Collecting fees from ${selectedPositions.length} positions using PayoutFlux`);
      console.log(`💰 Contract: ${PAYOUT_FLUX_ADDRESS}`);
      console.log(`📊 Total accumulated fees:`, tokenAmountsMap);

      // Filter out zero amounts and prepare for claimTokens call
      const nonZeroTokens = tokenAddresses.filter((_, index) => tokenAmounts[index] > 0);
      const nonZeroAmounts = tokenAmounts.filter(amount => amount > 0);

      if (nonZeroTokens.length === 0) {
        throw new Error('No fees available to collect from selected positions');
      }

      console.log(`🎯 Executing batch fee collection:`);
      console.log(`   Token addresses: [${nonZeroTokens.join(', ')}]`);
      console.log(`   Token amounts: [${nonZeroAmounts.map(amt => amt.toString()).join(', ')}]`);

      // Execute batch fee collection through PayoutFlux contract
      await writeContract({
        address: PAYOUT_FLUX_ADDRESS,
        abi: PayoutFluxABI,
        functionName: 'claimTokens',
        args: [
          nonZeroTokens as `0x${string}`[],
          nonZeroAmounts
        ],
      });

      console.log(`✅ Successfully collected fees from ${selectedPositions.length} positions!`);
      
      // Log final token distribution summary
      console.log(`📊 Final token distribution (${tokenAddresses.length} unique tokens):`);
      tokenAddresses.forEach((address, index) => {
        const amount = tokenAmounts[index];
        const tokenSymbol = address === WETH_ADDRESS ? 'WETH' : 
                          address === "0x6B175474E89094C44Da98b954EedeAC495271d0F" ? 'DAI' :
                          address === "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" ? 'USDC' : 'TOKEN';
        const usdValue = tokenPrices[address] || 1;
        const decimals = address === "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" ? 6 : 18; // USDC = 6, others = 18
        const displayAmount = (Number(amount) / Math.pow(10, decimals)).toFixed(decimals === 6 ? 6 : 6);
        const displayUSD = (Number(amount) / Math.pow(10, decimals) * usdValue).toFixed(2);
        console.log(`   ${tokenSymbol}: ${displayAmount} tokens ≈ $${displayUSD}`);
      });

    } catch (err) {
      console.error('❌ Error collecting Uniswap fees:', err);
      setError(err as Error);
      // Reset operation type on error to unlock the button
      setOperationType(null);
      setIsConfirmed(false);
    }
  };

  const exitPosition = async (account: string) => {
    try {
      setError(null);
      setIsConfirmed(false);
      setOperationType('exit');
      reset(); // Reset previous transaction state
      
      console.log(`🔄 Starting position exit for ${protocolName} on account ${account}`);
      
      // Only handle Spark protocol with the deployed contract
      if (protocolName.toLowerCase() === 'spark') {
        await writeContract({
          address: SPARK_FARM_ADDRESS,
          abi: SparkFarmABI,
          functionName: 'exit',
        });
        
        console.log(`📝 Exit transaction submitted for ${protocolName}`);
      } else {
        // For other protocols, simulate the transaction (until their contracts are deployed)
        console.log(`⚠️ ${protocolName} contract not yet deployed, simulating exit`);
        
        // Simulate transaction flow
        await new Promise(resolve => setTimeout(resolve, 1000));
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsConfirmed(true);
        
        console.log(`✅ Position exited successfully for ${protocolName} (simulated)`);
      }
      
    } catch (err) {
      console.error(`❌ Error exiting position for ${protocolName}:`, err);
      setError(err as Error);
    }
  };

  // Combine errors from write and confirmation
  const combinedError = error || writeError || confirmError;

  return {
    collectInterest,
    collectUniswapFees,
    exitPosition,
    isPending,
    isConfirming,
    isConfirmed,
    error: combinedError,
    hash, // Return transaction hash for tracking
    operationType // Return the current operation type
  };
};