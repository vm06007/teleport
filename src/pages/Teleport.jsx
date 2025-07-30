import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Teleport = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h2" component="h1" gutterBottom>
                    Teleport Demo
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                    Welcome to the Teleport Demo
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    This is a demonstration of the Teleport functionality. In a real implementation, 
                    this would include the actual teleport interface with token selection, 
                    price quotes, and transaction execution.
                </Typography>
            </Box>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Teleport Interface
                </Typography>
                <Typography variant="body1" paragraph>
                    This demo page shows where the actual teleport interface would be implemented.
                    Features would include:
                </Typography>
                <Box component="ul" sx={{ pl: 4 }}>
                    <Typography component="li" variant="body1" paragraph>
                        Token selection and input fields
                    </Typography>
                    <Typography component="li" variant="body1" paragraph>
                        Price quotes and slippage settings
                    </Typography>
                    <Typography component="li" variant="body1" paragraph>
                        Transaction execution and confirmation
                    </Typography>
                    <Typography component="li" variant="body1" paragraph>
                        Cross-chain bridge functionality
                    </Typography>
                </Box>
            </Paper>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography 
                    variant="body2" 
                    color="primary" 
                    sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => navigate('/')}
                >
                    ← Back to Home
                </Typography>
            </Box>
        </Container>
    );
};

export default Teleport;