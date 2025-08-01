import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Grid, Avatar, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import Web3 from "web3";
import { fetchBalances, fetchTokenDetails, fetchSpotPrices } from "../../services/portfolioService";

const GradientCard = styled(Card)(({ theme, $networkColor }) => ({
    background: `linear-gradient(135deg, ${$networkColor} 0%, ${$networkColor}dd 100%)`,
    color: "white",
    marginBottom: theme.spacing(3),
    borderRadius: "20px",
    padding: theme.spacing(2),
}));

const TokenCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(1.5),
    borderRadius: "12px",
    boxShadow: "none",
    border: "1px solid #e0e0e0",
    transition: "all 0.2s",
    "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
}));

const UserPortfolio = ({ address, chainId = 137, networkName = "Polygon", networkColor = "#8B7FB8" }) => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);

    useEffect(() => {
        if (address) {
            fetchPortfolioData();
        }
    }, [address, chainId]);

    const fetchPortfolioData = async () => {
        try {
            setLoading(true);
            console.log("Fetching portfolio data for address:", address, "chainId:", chainId);

            // Fetch balances
            const balanceData = await fetchBalances(address, chainId);
            console.log("Balance data received:", balanceData);

            // Filter out tokens with zero balance
            const nonZeroBalances = Object.entries(balanceData).filter(
                ([_, balance]) => balance !== "0"
            );
            console.log("Non-zero balances:", nonZeroBalances);

            if (nonZeroBalances.length === 0) {
                console.log("No non-zero balances found");
                setBalances([]);
                setTotalPortfolioValue(0);
                setLoading(false);
                return;
            }

            // Get token addresses
            const tokenAddresses = nonZeroBalances.map(([address]) => address);
            console.log("Token addresses to fetch details for:", tokenAddresses);

            // Fetch token details
            const tokenDetails = await fetchTokenDetails(tokenAddresses, chainId);
            console.log("Token details received:", tokenDetails);

            // Fetch spot prices (pass tokenDetails for symbol-based pricing)
            const prices = await fetchSpotPrices(tokenAddresses, chainId, tokenDetails);
            console.log("Prices:", prices);

            // Combine all data
            const portfolioData = nonZeroBalances.map(([tokenAddress, balance]) => {
                const token = tokenDetails[tokenAddress] || {};
                const price = prices[tokenAddress] || 0;
                const decimals = token.decimals || 18;

                // Convert balance based on token decimals
                let balanceInToken;
                if (decimals === 18) {
                    balanceInToken = Web3.utils.fromWei(balance, "ether");
                } else if (decimals === 6) {
                    balanceInToken = (parseFloat(balance) / Math.pow(10, 6)).toString();
                } else if (decimals === 8) {
                    balanceInToken = (parseFloat(balance) / Math.pow(10, 8)).toString();
                } else {
                    balanceInToken = (parseFloat(balance) / Math.pow(10, decimals)).toString();
                }

                const usdValue = parseFloat(balanceInToken) * price;

                console.log(`${token.symbol}: balance=${balanceInToken}, price=$${price}, usdValue=$${usdValue}`);

                return {
                    address: tokenAddress,
                    symbol: token.symbol || "Unknown",
                    name: token.name || "Unknown Token",
                    logo: token.logoURI || null,
                    balance: balanceInToken,
                    price: price,
                    usdValue: usdValue,
                    decimals: decimals,
                };
            });

            // Sort by USD value
            portfolioData.sort((a, b) => b.usdValue - a.usdValue);

            // Calculate total portfolio value
            const total = portfolioData.reduce((sum, token) => sum + token.usdValue, 0);

            setBalances(portfolioData);
            setTotalPortfolioValue(total);
        } catch (error) {
            console.error("Error fetching portfolio data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            backgroundColor: "#f5f5f5",
            borderRadius: "20px",
            padding: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            height: "fit-content"
        }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                User Portfolio
            </Typography>
            <GradientCard elevation={0} $networkColor={networkColor}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Value
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Portfolio Balance
                    </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600, textAlign: "center", my: 2 }}>
                    ${totalPortfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: "center", opacity: 0.8 }}>
                    Available balance
                </Typography>
            </GradientCard>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                Tokens
            </Typography>
            {balances.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography variant="body1" color="textSecondary" align="center">
                            No tokens found in your wallet
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Box sx={{ maxHeight: "500px", overflowY: "auto" }}>
                    {balances.map((token) => (
                        <TokenCard key={token.address}>
                            <CardContent>
                                <Grid container alignItems="center" spacing={2}>
                                    <Grid item>
                                        {token.logo ? (
                                            <Box
                                                component="img"
                                                src={token.logo}
                                                alt={token.symbol}
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    objectFit: 'contain',
                                                    backgroundColor: '#f0f0f0'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                display: token.logo ? 'none' : 'flex',
                                                backgroundColor: token.symbol === 'ETH' ? '#627EEA' :
                                                               token.symbol === 'USDC' ? '#2775CA' :
                                                               token.symbol === 'USDT' ? '#26A17B' :
                                                               token.symbol === 'DAI' ? '#F5AC37' :
                                                               token.symbol === 'POL' || token.symbol === 'MATIC' ? '#8B7FB8' :
                                                               token.symbol === 'LINK' ? '#2A5ADA' : '#ccc',
                                            }}
                                        >
                                            {token.symbol.charAt(0)}
                                        </Avatar>
                                    </Grid>
                                    <Grid item xs>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {token.symbol}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {token.name}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body2" align="right">
                                            {parseFloat(token.balance).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {token.symbol}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary" align="left">
                                            ${token.usdValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </TokenCard>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default UserPortfolio;