import axios from 'axios';

const TEST_ADDRESS = '0x641AD78BAca220C5BD28b51Ce8e0F495e85Fe689';
const CHAIN_ID = 1; // Ethereum mainnet
const PROXY_URL = "http://localhost:5003/proxy";

async function testAllProtocols() {
  console.log('Testing all protocols for address:', TEST_ADDRESS);
  console.log('Chain ID:', CHAIN_ID);

  try {
    // Get general portfolio data
    const portfolioResponse = await axios.get(PROXY_URL, {
      params: {
        url: `https://api.1inch.dev/portfolio/portfolio/v5.0/general/current_value?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}&use_cache=true`
      },
      timeout: 10000
    });

    const portfolioData = portfolioResponse.data.result;
    const protocolGroups = portfolioData.by_protocol_group || [];
    
    console.log('\n=== All Protocols Found ===');
    console.log('Total protocols:', protocolGroups.length);
    
    protocolGroups.forEach((protocol, index) => {
      console.log(`\n${index + 1}. ${protocol.protocol_group_name} (${protocol.protocol_group_id})`);
      console.log(`   Value: $${protocol.value_usd.toFixed(2)}`);
      console.log(`   Has value: ${protocol.value_usd > 0 ? 'YES' : 'NO'}`);
    });

    // Test detailed positions for protocols with values
    const protocolsWithValue = protocolGroups.filter(p => p.value_usd > 0);
    
    console.log('\n=== Testing Detailed Positions for Protocols with Values ===');
    
    for (const protocol of protocolsWithValue) {
      console.log(`\n--- Testing ${protocol.protocol_group_name} (${protocol.protocol_group_id}) ---`);
      
      try {
        const positionsResponse = await axios.get(PROXY_URL, {
          params: {
            url: `https://api.1inch.dev/portfolio/portfolio/v5.0/protocols/${protocol.protocol_group_id}/positions?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}&use_cache=true`
          },
          timeout: 10000
        });

        console.log(`✅ ${protocol.protocol_group_name} positions found:`);
        console.log('Status:', positionsResponse.status);
        console.log('Data structure:', JSON.stringify(positionsResponse.data, null, 2));
        
      } catch (error) {
        console.log(`❌ ${protocol.protocol_group_name} positions error:`, error.response?.status, error.response?.data?.detail || error.response?.data);
      }
    }

  } catch (error) {
    console.error('Error testing protocols:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAllProtocols(); 