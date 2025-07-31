import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Grid, Avatar, CircularProgress, Chip, Button, Collapse } from "@mui/material";
import { styled } from "@mui/material/styles";
import { fetchAavePositions, calculateActualBalances, fetchAavePositionBreakdown } from "../../services/aaveService";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

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
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [detailedPositions, setDetailedPositions] = useState([]);
    const [loadingBreakdown, setLoadingBreakdown] = useState(false);

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

            // Fetch real Aave positions if this is the Aave protocol
            if (protocolName.toLowerCase().includes('aave')) {
                console.log("Fetching real Aave positions for:", address);
                const positions = await fetchAavePositions(address, chainId);
                console.log("Aave positions received:", positions);
                
                if (positions.length > 0) {
                    // Calculate actual balances and values
                    const calculatedPositions = await calculateActualBalances(positions, chainId);
                    console.log("Calculated positions:", calculatedPositions);
                    
                    // Convert to the format expected by the component
                    const formattedBalances = calculatedPositions.map(position => ({
                        symbol: position.protocol.split(' ')[0], // Use protocol name as symbol
                        name: position.protocol,
                        logo: null, // We'll add logo fetching later
                        balance: position.supplyBalance > 0 ? position.supplyBalance.toFixed(4) : "N/A",
                        usdValue: position.supplyValue || 0,
                        debt: position.variableDebt + position.stableDebt,
                        debtValue: position.debtValue || 0,
                        netValue: position.netValue || 0,
                        protocol: position.protocol,
                        usageAsCollateral: position.usageAsCollateral,
                        isProtocolPosition: true // Flag to indicate this is a protocol-level position
                    }));
                    
                    setBalances(formattedBalances);
                    setTotalProtocolValue(formattedBalances.reduce((sum, pos) => sum + pos.netValue, 0));
                } else {
                    setBalances([]);
                    setTotalProtocolValue(0);
                }
            } else {
                // For other protocols, use mock data for now
                setTimeout(() => {
                    setBalances([]);
                    setTotalProtocolValue(0);
                    setLoading(false);
                }, 1000);
            }

        } catch (error) {
            console.error(`Error fetching ${protocolName} data:`, error);
            setBalances([]);
            setTotalProtocolValue(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetailedBreakdown = async () => {
        if (!address || !protocolName.toLowerCase().includes('aave')) return;
        
        try {
            setLoadingBreakdown(true);
            const breakdown = await fetchAavePositionBreakdown(address, chainId);
            setDetailedPositions(breakdown);
        } catch (error) {
            console.error("Error fetching detailed breakdown:", error);
        } finally {
            setLoadingBreakdown(false);
        }
    };

    const handleToggleBreakdown = () => {
        if (!showBreakdown && detailedPositions.length === 0) {
            fetchDetailedBreakdown();
        }
        setShowBreakdown(!showBreakdown);
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
                    {protocolName.toLowerCase().includes('aave') ? 'Net Value (Supply - Debt)' : 'Liquidity provided'}
                </Typography>
            </GradientCard>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    Positions
                </Typography>
                {protocolName.toLowerCase().includes('aave') && balances.length > 0 && (
                    <Button
                        size="small"
                        onClick={handleToggleBreakdown}
                        endIcon={showBreakdown ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{ color: protocolColor }}
                    >
                        {showBreakdown ? 'Hide' : 'Show'} Breakdown
                    </Button>
                )}
            </Box>
            
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
                                        {token.isProtocolPosition ? (
                                            <>
                                                <Typography variant="body2" align="right">
                                                    Protocol Position
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" align="right">
                                                    ${token.usdValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Typography>
                                                {token.usageAsCollateral && (
                                                    <Chip 
                                                        label="Active" 
                                                        size="small" 
                                                        sx={{ 
                                                            backgroundColor: "green",
                                                            color: "white",
                                                            fontSize: "0.6rem",
                                                            mt: 0.5
                                                        }} 
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <Typography variant="body2" align="right">
                                                    {parseFloat(token.balance).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {token.symbol}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" align="right">
                                                    ${token.usdValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Typography>
                                                {token.debt && token.debt > 0 && (
                                                    <>
                                                        <Typography variant="caption" color="error" align="right" display="block">
                                                            Debt: {parseFloat(token.debt).toFixed(4)} {token.symbol}
                                                        </Typography>
                                                        <Typography variant="caption" color="error" align="right">
                                                            ${token.debtValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </Typography>
                                                    </>
                                                )}
                                                {token.usageAsCollateral && (
                                                    <Chip 
                                                        label="Collateral" 
                                                        size="small" 
                                                        sx={{ 
                                                            backgroundColor: "green",
                                                            color: "white",
                                                            fontSize: "0.6rem",
                                                            mt: 0.5
                                                        }} 
                                                    />
                                                )}
                                            </>
                                        )}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </TokenCard>
                    ))}
                    
                    {/* Detailed Breakdown for Aave */}
                    {protocolName.toLowerCase().includes('aave') && (
                        <Collapse in={showBreakdown}>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                                    Detailed Breakdown
                                </Typography>
                                {loadingBreakdown ? (
                                    <Box display="flex" justifyContent="center" py={2}>
                                        <CircularProgress size={20} />
                                    </Box>
                                ) : (
                                    detailedPositions.map((position, index) => (
                                        <TokenCard key={`breakdown-${index}`}>
                                            <CardContent>
                                                <Grid container alignItems="center" spacing={2}>
                                                    <Grid item>
                                                        <Avatar
                                                            sx={{ 
                                                                width: 32, 
                                                                height: 32,
                                                                backgroundColor: position.token.symbol === 'WETH' ? '#627EEA' : 
                                                                               position.token.symbol === 'USDC' ? '#2775CA' :
                                                                               position.token.symbol === 'DAI' ? '#F5AC37' : '#ccc',
                                                            }}
                                                        >
                                                            {position.token.symbol.charAt(0)}
                                                        </Avatar>
                                                    </Grid>
                                                    <Grid item xs>
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            {position.token.symbol}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {position.token.name}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item>
                                                        <Typography variant="body2" align="right">
                                                            Supply: ${position.supply.value_usd.toFixed(2)}
                                                        </Typography>
                                                        {position.borrow.value_usd > 0 && (
                                                            <Typography variant="caption" color="error" align="right" display="block">
                                                                Borrow: ${position.borrow.value_usd.toFixed(2)}
                                                            </Typography>
                                                        )}
                                                        <Typography variant="caption" color="textSecondary" align="right">
                                                            Net: ${position.net_value_usd.toFixed(2)}
                                                        </Typography>
                                                        {position.usage_as_collateral && (
                                                            <Chip 
                                                                label="Collateral" 
                                                                size="small" 
                                                                sx={{ 
                                                                    backgroundColor: "green",
                                                                    color: "white",
                                                                    fontSize: "0.6rem",
                                                                    mt: 0.5
                                                                }} 
                                                            />
                                                        )}
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </TokenCard>
                                    ))
                                )}
                            </Box>
                        </Collapse>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default ProtocolPortfolio; 