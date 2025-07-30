import React from 'react';
import { Container, Typography, Box, Paper, Button, Alert, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useWallet } from '../hooks/useWallet';
import UserPortfolio from '../components/Portfolio/UserPortfolio';

const Teleport = () => {
    const navigate = useNavigate();
    const { account, isConnecting, error, connectWallet, disconnectWallet, isConnected } = useWallet();

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            backgroundColor: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4
        }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h2" component="h1" gutterBottom sx={{ color: 'white' }}>
                        Teleport Portfolio
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)' }} paragraph>
                        View your Web3 portfolio on Polygon Network
                    </Typography>
                
                <Box sx={{ mt: 4, mb: 4 }}>
                    {!isConnected ? (
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AccountBalanceWalletIcon />}
                            onClick={connectWallet}
                            disabled={isConnecting}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                px: 4,
                                py: 1.5,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                }
                            }}
                        >
                            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                        </Button>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                            <Chip
                                icon={<AccountBalanceWalletIcon />}
                                label={formatAddress(account)}
                                color="primary"
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

                {error && (
                    <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                        {error}
                    </Alert>
                )}
            </Box>

            {isConnected ? (
                <UserPortfolio address={account} />
            ) : (
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        Connect Your Wallet
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Connect your MetaMask wallet to view your token portfolio on Polygon Network.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Make sure you have MetaMask installed and are connected to Polygon Network.
                    </Typography>
                </Paper>
            )}

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