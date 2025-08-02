import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SparkFarmABI } from '../abi/SparkFarm';

const SPARK_FARM_ADDRESS = '0x173e314C7635B45322cd8Cb14f44b312e079F3af' as const;

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
    exitPosition,
    isPending,
    isConfirming,
    isConfirmed,
    error: combinedError,
    hash, // Return transaction hash for tracking
    operationType // Return the current operation type
  };
};