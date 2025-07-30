import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Grid, Avatar, CircularProgress, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";

const GradientCard = styled(Card)(({ theme, protocolColor }) => ({
    background: `linear-gradient(135deg, ${protocolColor} 0%, ${protocolColor}dd 100%)`,
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

const ProtocolPortfolio = ({ 
    protocolName, 
    protocolColor, 
    protocolIcon, 
    address, 
    chainId = 137,
    mockData = null // For demo purposes
}) => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalProtocolValue, setTotalProtocolValue] = useState(0);

    useEffect(() => {
        if (address) {
            fetchProtocolData();
        }
    }, [address, chainId, protocolName]);

    const fetchProtocolData = async () => {
        try {
            setLoading(true);

            // For demo purposes, use mock data if provided
            if (mockData) {
                setBalances(mockData.balances);
                setTotalProtocolValue(mockData.totalValue);
                setLoading(false);
                return;
            }

            // TODO: Implement actual protocol data fetching
            // This would involve calling specific protocol APIs
            // For now, we'll simulate loading
            setTimeout(() => {
                setBalances([]);
                setTotalProtocolValue(0);
                setLoading(false);
            }, 1000);

        } catch (error) {
            console.error(`Error fetching ${protocolName} data:`, error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
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
                {protocolName}
            </Typography>
            
            <GradientCard elevation={0} protocolColor={protocolColor}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Value
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Chip 
                        label="Active" 
                        size="small" 
                        sx={{ 
                            backgroundColor: "rgba(255,255,255,0.2)",
                            color: "white",
                            fontSize: "0.7rem"
                        }} 
                    />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600, textAlign: "center", my: 2 }}>
                    ${totalProtocolValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: "center", opacity: 0.8 }}>
                    Liquidity provided
                </Typography>
            </GradientCard>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                Positions
            </Typography>
            
            {balances.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography variant="body1" color="textSecondary" align="center">
                            No positions in {protocolName}
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
                    {balances.map((token, index) => (
                        <TokenCard key={index}>
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
                                                               token.symbol === 'DAI' ? '#F5AC37' : '#ccc',
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

export default ProtocolPortfolio; 