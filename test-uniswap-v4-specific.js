import axios from 'axios';

const TEST_ADDRESS = '0x641AD78BAca220C5BD28b51Ce8e0F495e85Fe689';
const CHAIN_ID = 1; // Ethereum mainnet
const PROXY_URL = "http://localhost:5003/proxy";

async function testUniswapV4Specific() {
  console.log('Testing Uniswap V4 specific endpoints for address:', TEST_ADDRESS);
  console.log('Chain ID:', CHAIN_ID);

  try {
    // Test different possible Uniswap V4 endpoints
    const endpoints = [
      'uniswapv4',
      'uniswap_v4',
      'uniswap-v4',
      'uniswap4',
      'uniswap_v4_positions',
      'uniswapv4_positions'
    ];

    for (const endpoint of endpoints) {
      console.log(`\n--- Testing endpoint: ${endpoint} ---`);
      
      try {
        const response = await axios.get(PROXY_URL, {
          params: {
            url: `https://api.1inch.dev/portfolio/portfolio/v5.0/protocols/${endpoint}/positions?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}&use_cache=true`
          },
          timeout: 10000
        });

        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        
      } catch (error) {
        console.log(`❌ ${endpoint} - Error: ${error.response?.status} - ${error.response?.data?.detail || error.response?.data}`);
      }
    }

    // Let's also try to get more general portfolio breakdown
    console.log('\n=== Testing General Portfolio Breakdown ===');
    try {
      const breakdownResponse = await axios.get(PROXY_URL, {
        params: {
          url: `https://api.1inch.dev/portfolio/portfolio/v5.0/general/breakdown?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}&use_cache=true`
        },
        timeout: 10000
      });

      console.log('Breakdown Status:', breakdownResponse.status);
      console.log('Breakdown Data:', JSON.stringify(breakdownResponse.data, null, 2));
      
    } catch (error) {
      console.log('Breakdown Error:', error.response?.status, error.response?.data);
    }

    // Try to get all positions for the address
    console.log('\n=== Testing All Positions Endpoint ===');
    try {
      const allPositionsResponse = await axios.get(PROXY_URL, {
        params: {
          url: `https://api.1inch.dev/portfolio/portfolio/v5.0/positions?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}&use_cache=true`
        },
        timeout: 10000
      });

      console.log('All Positions Status:', allPositionsResponse.status);
      console.log('All Positions Data:', JSON.stringify(allPositionsResponse.data, null, 2));
      
    } catch (error) {
      console.log('All Positions Error:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('Error testing Uniswap V4:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testUniswapV4Specific(); 