import { createConfig, http } from 'wagmi';
import { mainnet, arbitrum, optimism, polygon, base } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Create wagmi config
export const wagmiConfig = createConfig({
    chains: [mainnet, arbitrum, optimism, polygon, base],
    connectors: [
        injected(),
        // walletConnect({ projectId: 'YOUR_WALLETCONNECT_PROJECT_ID' }), // Add your WalletConnect project ID
    ],
    transports: {
        [mainnet.id]: http(),
        [arbitrum.id]: http(),
        [optimism.id]: http(),
        [polygon.id]: http(),
        [base.id]: http(),
    },
});