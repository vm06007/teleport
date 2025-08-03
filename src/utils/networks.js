export const NETWORKS = {
    ethereum: {
        chainId: 1,
        name: "Multichain",
        shortName: "ETH",
        icon: "⟠",
        color: "#627EEA",
        rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
        explorerUrl: "https://etherscan.io",
        nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18
        }
    },
    polygon: {
        chainId: 137,
        name: "Polygon",
        shortName: "MATIC",
        icon: "🟣",
        color: "#8B7FB8",
        rpcUrl: "https://polygon-rpc.com",
        explorerUrl: "https://polygonscan.com",
        nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18
        }
    },
    arbitrum: {
        chainId: 42161,
        name: "Arbitrum",
        shortName: "ARB",
        icon: "🔵",
        color: "#2D374B",
        rpcUrl: "https://arb1.arbitrum.io/rpc",
        explorerUrl: "https://arbiscan.io",
        nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18
        }
    }
};

export const getNetworkById = (chainId) => {
    return Object.values(NETWORKS).find(network => network.chainId === chainId);
};

export const switchNetwork = async (chainId) => {
    if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
    }

    const chainIdHex = `0x${chainId.toString(16)}`;
    
    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chainIdHex }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            const network = getNetworkById(chainId);
            if (!network) {
                throw new Error("Network configuration not found");
            }
            
            try {
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [{
                        chainId: chainIdHex,
                        chainName: network.name,
                        nativeCurrency: network.nativeCurrency,
                        rpcUrls: [network.rpcUrl],
                        blockExplorerUrls: [network.explorerUrl]
                    }],
                });
            } catch (addError) {
                throw new Error("Failed to add network to MetaMask");
            }
        } else {
            throw switchError;
        }
    }
};