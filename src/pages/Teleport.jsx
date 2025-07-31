import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, Alert, Chip, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useWallet } from '../hooks/useWallet';
import UserPortfolio from '../components/Portfolio/UserPortfolio';
import ProtocolPortfolio from '../components/Portfolio/ProtocolPortfolio';
import { NETWORKS, switchNetwork } from '../utils/networks';

const Teleport = () => {
    const navigate = useNavigate();
    const { account, isConnecting, error, connectWallet, disconnectWallet, isConnected } = useWallet();
    const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS.polygon);
    const [anchorEl, setAnchorEl] = useState(null);
    const [switchingNetwork, setSwitchingNetwork] = useState(false);

    // Protocol configurations
    const protocols = [
        {
            name: "Aave",
            color: "#B6509E",
            icon: "https://cryptologos.cc/logos/aave-aave-logo.png",
            // No mockData - will use real Aave service to fetch live positions
        },
        {
            name: "Compound",
            color: "#00D395",
            icon: "https://cryptologos.cc/logos/compound-comp-logo.png",
            mockData: {
                totalValue: 1890.30,
                balances: [
                    {
                        symbol: "USDT",
                        name: "Tether USD",
                        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
                        balance: "1890.30",
                        usdValue: 1890.30
                    }
                ]
            }
        },
        {
            name: "Uniswap",
            color: "#FF007A",
            icon: "https://cryptologos.cc/logos/uniswap-uni-logo.png",
            mockData: {
                totalValue: 3200.45,
                balances: [
                    {
                        symbol: "ETH",
                        name: "Ethereum",
                        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
                        balance: "1.25",
                        usdValue: 3200.45
                    }
                ]
            }
        }
    ];

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleNetworkClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleNetworkClose = () => {
        setAnchorEl(null);
    };

    const handleNetworkSelect = async (network) => {
        handleNetworkClose();
        if (network.chainId === selectedNetwork.chainId) return;

        setSwitchingNetwork(true);
        try {
            await switchNetwork(network.chainId);
            setSelectedNetwork(network);
        } catch (error) {
            console.error('Failed to switch network:', error);
        } finally {
            setSwitchingNetwork(false);
        }
    };

    // Listen for network changes
    useEffect(() => {
        if (window.ethereum) {
            const handleChainChanged = (chainId) => {
                const networkId = parseInt(chainId, 16);
                const network = Object.values(NETWORKS).find(n => n.chainId === networkId);
                if (network) {
                    setSelectedNetwork(network);
                }
            };

            window.ethereum.on('chainChanged', handleChainChanged);
            
            // Check current network
            window.ethereum.request({ method: 'eth_chainId' }).then(chainId => {
                handleChainChanged(chainId);
            });

            return () => {
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, []);

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            backgroundColor: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            py: 2
        }}>
            <Container maxWidth="lg" sx={{ flex: 1 }}>
                {/* Header with title and controls */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 4
                }}>
                    {/* Title on the left */}
                    <Typography variant="h2" component="h1" sx={{ color: 'white' }}>
                        Teleport Portfolio
                    </Typography>

                    {/* Controls on the right */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Network Selector */}
                        <Button
                            variant="outlined"
                            onClick={handleNetworkClick}
                            endIcon={<ExpandMoreIcon />}
                            disabled={switchingNetwork}
                            sx={{
                                borderColor: selectedNetwork.color,
                                color: selectedNetwork.color,
                                '&:hover': {
                                    borderColor: selectedNetwork.color,
                                    backgroundColor: `${selectedNetwork.color}10`,
                                }
                            }}
                        >
                            <Box component="span" sx={{ mr: 1 }}>{selectedNetwork.icon}</Box>
                            {selectedNetwork.name}
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleNetworkClose}
                        >
                            {Object.values(NETWORKS).map((network) => (
                                <MenuItem 
                                    key={network.chainId}
                                    onClick={() => handleNetworkSelect(network)}
                                    selected={network.chainId === selectedNetwork.chainId}
                                >
                                    <Box component="span" sx={{ mr: 1 }}>{network.icon}</Box>
                                    {network.name}
                                </MenuItem>
                            ))}
                        </Menu>

                        {/* Wallet Connection */}
                        {!isConnected ? (
                            <Button
                                variant="contained"
                                size="medium"
                                startIcon={<AccountBalanceWalletIcon />}
                                onClick={connectWallet}
                                disabled={isConnecting}
                                sx={{
                                    background: `linear-gradient(135deg, ${selectedNetwork.color} 0%, ${selectedNetwork.color}dd 100%)`,
                                    color: 'white',
                                    px: 3,
                                    py: 1,
                                    '&:hover': {
                                        background: `linear-gradient(135deg, ${selectedNetwork.color}dd 0%, ${selectedNetwork.color}bb 100%)`,
                                    }
                                }}
                            >
                                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                            </Button>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                    icon={<AccountBalanceWalletIcon />}
                                    label={formatAddress(account)}
                                    sx={{ 
                                        borderColor: selectedNetwork.color,
                                        color: selectedNetwork.color
                                    }}
                                    variant="outlined"
                                />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={disconnectWallet}
                                    color="error"
                                >
                                    Disconnect
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                        {error}
                    </Alert>
                )}

                {/* Main content */}
                <Box sx={{ flex: 1 }}>
                    {isConnected ? (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, alignItems: 'start' }}>
                            {/* User Portfolio - Leftmost column */}
                            <UserPortfolio 
                                address={account} 
                                chainId={selectedNetwork.chainId}
                                networkName={selectedNetwork.name}
                                networkColor={selectedNetwork.color}
                            />
                            
                            {/* Protocol Portfolios - Right columns */}
                            {protocols.map((protocol) => (
                                <ProtocolPortfolio
                                    key={protocol.name}
                                    protocolName={protocol.name}
                                    protocolColor={protocol.color}
                                    protocolIcon={protocol.icon}
                                    address={account}
                                    chainId={selectedNetwork.chainId}
                                    mockData={protocol.mockData}
                                />
                            ))}
                        </Box>
                    ) : (
                        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                            <Typography variant="h5" gutterBottom>
                                Connect Your Wallet
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                Connect your MetaMask wallet to view your token portfolio on {selectedNetwork.name}.
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Make sure you have MetaMask installed and are connected to {selectedNetwork.name}.
                            </Typography>
                        </Paper>
                    )}
                </Box>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography 
                        variant="body2" 
                        sx={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => navigate('/')}
                    >
                        ← Back to Home
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Teleport;