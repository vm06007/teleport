import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SparkFarmABI } from '../abi/SparkFarm';
import type { UniswapPosition } from '../services/uniswapService';

const SPARK_FARM_ADDRESS = '0x173e314C7635B45322cd8Cb14f44b312e079F3af' as const;
// Uniswap V4 PositionManager - collect fees directly
const POSITION_MANAGER_ADDRESS = '0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e' as const;

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
  const [operationType, setOperationType] = useState<'collect' | 'exit' | null>(null);

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
  if (txConfirmed && !isConfirmed) {
    setIsConfirmed(true);
  }

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

      console.log(`🔄 Starting Uniswap fee collection for ${selectedPositions.length} positions`);

      if (selectedPositions.length === 0) {
        throw new Error('No positions selected');
      }

      // Collect fees from the first position (V4 PositionManager collect function)
      // NOTE: Currently only collecting from first position to demonstrate V4 integration
      // For production: implement multicall for batch collection or sequential collection
      const position = selectedPositions[0];
      
      if (selectedPositions.length > 1) {
        console.log(`⚠️ Multiple positions selected (${selectedPositions.length}), collecting from first position only`);
      }
      
      console.log(`📝 Collecting fees from position ${position.tokenId}`);

      await writeContract({
        address: POSITION_MANAGER_ADDRESS,
        abi: POSITION_MANAGER_ABI,
        functionName: 'collect',
        args: [
          BigInt(position.tokenId),
          account as `0x${string}`,
          BigInt(position.tokensOwed0), // amount0Max - collect all available
          BigInt(position.tokensOwed1)  // amount1Max - collect all available
        ],
      });

      console.log(`📝 Transaction submitted for position ${position.tokenId}`);

    } catch (err) {
      console.error('❌ Error collecting Uniswap fees:', err);
      setError(err as Error);
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