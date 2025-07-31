import axios from 'axios';

const TEST_ADDRESS = '0x641AD78BAca220C5BD28b51Ce8e0F495e85Fe689';
const CHAIN_ID = 1; // Ethereum mainnet
const PROXY_URL = "http://localhost:5003/proxy";

async function testSparkProtocol() {
  console.log('Testing Spark Protocol for address:', TEST_ADDRESS);
  console.log('Chain ID:', CHAIN_ID);

  try {
    // First, let's get the general portfolio data to confirm Spark value
    const portfolioResponse = await axios.get(PROXY_URL, {
      params: {
        url: `https://api.1inch.dev/portfolio/portfolio/v5.0/general/current_value?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}&use_cache=true`
      },
      timeout: 10000
    });

    const portfolioData = portfolioResponse.data.result;
    const protocolGroups = portfolioData.by_protocol_group || [];
    const sparkProtocol = protocolGroups.find(p => p.protocol_group_id === 'spark');

    console.log('\n=== Spark Protocol Overview ===');
    if (sparkProtocol) {
      console.log('Protocol ID:', sparkProtocol.protocol_group_id);
      console.log('Protocol Name:', sparkProtocol.protocol_group_name);
      console.log('Value USD:', `$${sparkProtocol.value_usd.toFixed(2)}`);
      console.log('Value ETH:', sparkProtocol.value_eth);
    } else {
      console.log('Spark protocol not found in portfolio data');
    }

    // Test different possible Spark endpoints
    const sparkEndpoints = [
      'spark',
      'spark_protocol',
      'spark-protocol',
      'sparkv1',
      'spark_v1'
    ];

    console.log('\n=== Testing Spark Protocol Detailed Positions ===');
    
    for (const endpoint of sparkEndpoints) {
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

    // Let's also try to get Spark-specific data using different API endpoints
    console.log('\n=== Testing Alternative Spark Endpoints ===');
    
    const alternativeEndpoints = [
      `https://api.1inch.dev/portfolio/portfolio/v5.0/protocols/spark/overview?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}`,
      `https://api.1inch.dev/portfolio/portfolio/v5.0/protocols/spark/balances?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}`,
      `https://api.1inch.dev/portfolio/portfolio/v5.0/protocols/spark/assets?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}`
    ];

    for (const endpoint of alternativeEndpoints) {
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

  } catch (error) {
    console.error('Error testing Spark Protocol:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testSparkProtocol(); 