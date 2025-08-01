import { useState, useEffect } from "react";

export const useWallet = () => {
    const [account, setAccount] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);

    const connectWallet = async () => {
        if (typeof window.ethereum === "undefined") {
            setError("MetaMask is not installed. Please install MetaMask to use this feature.");
            return;
        }

        try {
            setIsConnecting(true);
            setError(null);

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            });

            if (accounts.length > 0) {
                setAccount(accounts[0]);
            }

            // Get current chain ID
            const chainId = await window.ethereum.request({
                method: "eth_chainId"
            });
            setChainId(parseInt(chainId, 16));

        } catch (error) {
            console.error("Error connecting wallet:", error);
            setError(error instanceof Error ? error.message : "Failed to connect wallet");
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setChainId(null);
    };

    useEffect(() => {
        // Check if wallet is already connected
        const checkConnection = async () => {
            if (typeof window.ethereum !== "undefined") {
                try {
                    const accounts = await window.ethereum.request({
                        method: "eth_accounts"
                    });

                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                    }

                    // Get current chain ID
                    const chainId = await window.ethereum.request({
                        method: "eth_chainId"
                    });
                    setChainId(parseInt(chainId, 16));

                } catch (error) {
                    console.error("Error checking wallet connection:", error);
                }
            }
        };

        checkConnection();

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    setAccount(null);
                }
            });

            window.ethereum.on("chainChanged", (chainId: string) => {
                setChainId(parseInt(chainId, 16));
            });
        }

        return () => {
            if (window.ethereum && window.ethereum.removeListener) {
                window.ethereum.removeListener("accountsChanged", () => {});
                window.ethereum.removeListener("chainChanged", () => {});
            }
        };
    }, []);

    return {
        account,
        isConnecting,
        error,
        chainId,
        connectWallet,
        disconnectWallet,
        isConnected: !!account
    };
}; 