import axios from 'axios';

const TEST_ADDRESS = '0x641AD78BAca220C5BD28b51Ce8e0F495e85Fe689';
const CHAIN_ID = 1; // Ethereum mainnet
const PROXY_URL = "http://localhost:5003/proxy";

async function testProtocolRewards() {
  console.log('Testing additional protocol data for APY and rewards');
  console.log('Address:', TEST_ADDRESS);
  console.log('Chain ID:', CHAIN_ID);

  try {
    // Test 1inch API for any additional endpoints
    console.log('\n=== Testing 1inch API Additional Endpoints ===');
    
    const oneInchEndpoints = [
      `https://api.1inch.dev/portfolio/portfolio/v5.0/general/rewards?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}`,
      `https://api.1inch.dev/portfolio/portfolio/v5.0/general/apy?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}`,
      `https://api.1inch.dev/portfolio/portfolio/v5.0/general/yields?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}`
    ];

    for (const endpoint of oneInchEndpoints) {
      console.log(`\n--- Testing: ${endpoint.split('/').pop()} ---`);
      
      try {
        const response = await axios.get(PROXY_URL, {
          params: { url: endpoint },
          timeout: 10000
        });

        console.log(`✅ Status: ${response.status}`);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        
      } catch (error) {
        console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.detail || error.response?.data}`);
      }
    }

    // Test DeFi Llama API for APY data
    console.log('\n=== Testing DeFi Llama API ===');
    try {
      const defiLlamaResponse = await axios.get('https://api.llama.fi/protocols');
      console.log('DeFi Llama protocols available:', defiLlamaResponse.data.length);
      
      // Check for specific protocols
      const protocols = defiLlamaResponse.data;
      const aaveProtocol = protocols.find(p => p.name.toLowerCase().includes('aave'));
      const curveProtocol = protocols.find(p => p.name.toLowerCase().includes('curve'));
      const sparkProtocol = protocols.find(p => p.name.toLowerCase().includes('spark'));
      
      console.log('Aave protocol found:', aaveProtocol ? 'Yes' : 'No');
      console.log('Curve protocol found:', curveProtocol ? 'Yes' : 'No');
      console.log('Spark protocol found:', sparkProtocol ? 'Yes' : 'No');
      
    } catch (error) {
      console.log('DeFi Llama Error:', error.response?.status, error.response?.data);
    }

    // Test Aave API for specific data
    console.log('\n=== Testing Aave API ===');
    try {
      const aaveResponse = await axios.get('https://api.thegraph.com/subgraphs/name/aave/protocol-v3', {
        params: {
          query: `{
            reserves {
              id
              name
              symbol
              liquidityRate
              variableBorrowRate
              stableBorrowRate
              averageStableRate
              liquidityIndex
              variableBorrowIndex
              lastUpdateTimestamp
            }
          }`
        }
      });
      
      console.log('Aave GraphQL Status:', aaveResponse.status);
      console.log('Aave reserves found:', aaveResponse.data?.data?.reserves?.length || 0);
      
    } catch (error) {
      console.log('Aave API Error:', error.response?.status, error.response?.data);
    }

    // Test Curve API
    console.log('\n=== Testing Curve API ===');
    try {
      const curveResponse = await axios.get('https://api.curve.fi/api/getPools/ethereum/main');
      console.log('Curve API Status:', curveResponse.status);
      console.log('Curve pools found:', curveResponse.data?.data?.poolData?.length || 0);
      
    } catch (error) {
      console.log('Curve API Error:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('Error testing protocol rewards:', error);
  }
}

testProtocolRewards(); 