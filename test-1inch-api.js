import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_KEY = process.env.ONEINCH_API_KEY || 'YOUR_API_KEY_HERE';
const TEST_ADDRESS = '0x641AD78BAca220C5BD28b51Ce8e0F495e85Fe689';
const CHAIN_ID = 1; // Ethereum mainnet

console.log('Testing 1inch API with key:', API_KEY.substring(0, 10) + '...');

// Test different endpoints
const endpoints = [
    {
        name: 'Portfolio V3 Details',
        url: `https://api.1inch.dev/portfolio/v3/overview/evm/details?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}`
    },
    {
        name: 'Portfolio V4 Details',
        url: `https://api.1inch.dev/portfolio/v4/overview/evm/details?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}`
    },
    {
        name: 'Portfolio Overview',
        url: `https://api.1inch.dev/portfolio/portfolio/v4/overview/evm/details?wallet_addresses=${TEST_ADDRESS}&chain_ids=${CHAIN_ID}`
    },
    {
        name: 'Balance API',
        url: `https://api.1inch.dev/balance/v1.2/${CHAIN_ID}/balances/${TEST_ADDRESS}`
    }
];

async function testEndpoint(endpoint) {
    console.log(`\n--- Testing ${endpoint.name} ---`);
    console.log(`URL: ${endpoint.url}`);
    
    try {
        // Test direct API call
        const directResponse = await axios.get(endpoint.url, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Direct API call successful');
        console.log('Response:', JSON.stringify(directResponse.data, null, 2).substring(0, 500) + '...');
        
        // Test through proxy
        const proxyResponse = await axios.get('http://localhost:5003/proxy', {
            params: { url: endpoint.url }
        });
        
        console.log('✅ Proxy API call successful');
        
    } catch (error) {
        console.log('❌ API call failed');
        console.log('Error status:', error.response?.status);
        console.log('Error message:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('⚠️  Unauthorized - Check your API key');
        }
    }
}

async function runTests() {
    // First check if proxy is running
    try {
        await axios.get('http://localhost:5003/proxy?url=https://api.1inch.dev/');
        console.log('✅ Proxy server is running');
    } catch (error) {
        console.log('❌ Proxy server is not running. Start it with: node src/services/proxy.js');
        return;
    }
    
    // Test all endpoints
    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }
    
    console.log('\n--- Test Complete ---');
    console.log('If all tests failed with 401, you need to set a valid API key.');
    console.log('Set it in .env file as: ONEINCH_API_KEY=your_api_key_here');
}

// Run the tests
runTests().catch(console.error);