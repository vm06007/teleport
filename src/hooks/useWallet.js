import { useState, useEffect } from "react";

export const useWallet = () => {
    const [account, setAccount] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

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
        } catch (error) {
            console.error("Error connecting wallet:", error);
            setError(error.message || "Failed to connect wallet");
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
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
                } catch (error) {
                    console.error("Error checking wallet connection:", error);
                }
            }
        };

        checkConnection();

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    setAccount(null);
                }
            });
        }

        return () => {
            if (window.ethereum && window.ethereum.removeListener) {
                window.ethereum.removeListener("accountsChanged", () => {});
            }
        };
    }, []);

    return {
        account,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        isConnected: !!account
    };
};