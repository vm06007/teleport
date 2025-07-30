import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Grid, Avatar, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import Web3 from "web3";
import { fetchBalances, fetchTokenDetails, fetchSpotPrices } from "../../services/portfolioService";

const GradientCard = styled(Card)(({ theme }) => ({
    background: "linear-gradient(135deg, #8B7FB8 0%, #6366F1 100%)",
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

const UserPortfolio = ({ address }) => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);

    useEffect(() => {
        if (address) {
            fetchPortfolioData();
        }
    }, [address]);

    const fetchPortfolioData = async () => {
        try {
            setLoading(true);

            // Fetch balances
            const balanceData = await fetchBalances(address);

            // Filter out tokens with zero balance
            const nonZeroBalances = Object.entries(balanceData).filter(
                ([_, balance]) => balance !== "0"
            );

            if (nonZeroBalances.length === 0) {
                setBalances([]);
                setTotalPortfolioValue(0);
                setLoading(false);
                return;
            }

            // Get token addresses
            const tokenAddresses = nonZeroBalances.map(([address]) => address);

            // Fetch token details
            const tokenDetails = await fetchTokenDetails(tokenAddresses);

            // Fetch spot prices
            const prices = await fetchSpotPrices(tokenAddresses);
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
            maxWidth: "500px",
            margin: "0 auto",
            backgroundColor: "#f5f5f5",
            borderRadius: "20px",
            padding: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 3, fontWeight: 600 }}>
                User Portfolio
            </Typography>
            <GradientCard elevation={0}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Box sx={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        borderRadius: "50%",
                        p: 1,
                        mr: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <Typography variant="caption" sx={{ fontSize: "10px" }}>🔗</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Polygon Network
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Portfolio Balance
                    </Typography>
                </Box>
                <Typography variant="h2" sx={{ fontWeight: 600, textAlign: "center", my: 2 }}>
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
                                        <Avatar
                                            src={token.logo}
                                            alt={token.symbol}
                                            sx={{ width: 40, height: 40 }}
                                        >
                                            {token.symbol.charAt(0)}
                                        </Avatar>
                                    </Grid>
                                    <Grid item xs>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {token.symbol}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {token.name}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1" align="right">
                                            {parseFloat(token.balance).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {token.symbol}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" align="right">
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