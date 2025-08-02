import { useState } from 'react';

export const useCollectInterest = (protocolName: string) => {
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const collectInterest = async (account: string) => {
    try {
      setIsPending(true);
      setError(null);
      
      console.log(`🔄 Starting interest collection for ${protocolName} on account ${account}`);
      
      // Simulate transaction flow
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsPending(false);
      setIsConfirming(true);
      
      // Simulate confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConfirming(false);
      setIsConfirmed(true);
      
      console.log(`✅ Interest collected successfully for ${protocolName}`);
      
    } catch (err) {
      setError(err as Error);
      setIsPending(false);
      setIsConfirming(false);
    }
  };

  return {
    collectInterest,
    isPending,
    isConfirming,
    isConfirmed,
    error
  };
};