import axios from 'axios';

const TEST_ADDRESS = '0x641AD78BAca220C5BD28b51Ce8e0F495e85Fe689';
const CHAIN_ID = 1; // Ethereum mainnet
const PROXY_URL = "http://localhost:5003/proxy";

async function test1inchCurrentValue() {
  console.log('Testing 1inch current_value endpoint for additional data');
  console.log('Address:', TEST_ADDRESS);
  console.log('Chain ID:', CHAIN_ID);

  try {
    // Test the current_value endpoint with different parameters
    console.log('\n=== Testing current_value endpoint ===');
    
    const response = await axios.get(PROXY_URL, {
      params: {
        url: `https://api.1inch.dev/portfolio/portfolio/v5.0/general/current_value?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}&use_cache=true`
      },
      timeout: 10000
    });

    console.log('Status:', response.status);
    console.log('Full Response:', JSON.stringify(response.data, null, 2));

    // Analyze the response structure
    const data = response.data;
    if (data.result) {
      console.log('\n=== Response Analysis ===');
      
      // Check total value
      console.log('Total Value:', data.result.total);
      
      // Check by_address breakdown
      if (data.result.by_address && data.result.by_address.length > 0) {
        console.log('\nBy Address:');
        data.result.by_address.forEach(addr => {
          console.log(`  ${addr.address}: $${addr.value_usd}`);
        });
      }
      
      // Check by_category breakdown
      if (data.result.by_category && data.result.by_category.length > 0) {
        console.log('\nBy Category:');
        data.result.by_category.forEach(cat => {
          console.log(`  ${cat.category_name} (${cat.category_id}): $${cat.value_usd}`);
        });
      }
      
      // Check by_protocol_group breakdown
      if (data.result.by_protocol_group && data.result.by_protocol_group.length > 0) {
        console.log('\nBy Protocol Group:');
        data.result.by_protocol_group.forEach(protocol => {
          console.log(`  ${protocol.protocol_group_name} (${protocol.protocol_group_id}): $${protocol.value_usd}`);
        });
      }
      
      // Check by_chain breakdown
      if (data.result.by_chain && data.result.by_chain.length > 0) {
        console.log('\nBy Chain:');
        data.result.by_chain.forEach(chain => {
          console.log(`  ${chain.chain_name} (${chain.chain_id}): $${chain.value_usd}`);
        });
      }
      
      // Check meta information
      if (data.meta) {
        console.log('\nMeta Information:');
        console.log('  Cached at:', data.meta.cached_at);
        if (data.meta.system) {
          console.log('  Processing times:');
          console.log(`    Click time: ${data.meta.system.click_time}ms`);
          console.log(`    Node time: ${data.meta.system.node_time}ms`);
          console.log(`    Microservices time: ${data.meta.system.microservices_time}ms`);
          console.log(`    Redis time: ${data.meta.system.redis_time}ms`);
          console.log(`    Total time: ${data.meta.system.total_time}ms`);
        }
      }
    }

    // Test with multiple addresses to see if we get more detailed data
    console.log('\n=== Testing with multiple addresses ===');
    const multiAddressResponse = await axios.get(PROXY_URL, {
      params: {
        url: `https://api.1inch.dev/portfolio/portfolio/v5.0/general/current_value?addresses=${TEST_ADDRESS},0xd470055c6189b921c4d44b3d277ad868f79c0f75&chain_id=${CHAIN_ID}&use_cache=true`
      },
      timeout: 10000
    });

    console.log('Multi-address Status:', multiAddressResponse.status);
    console.log('Multi-address Data:', JSON.stringify(multiAddressResponse.data, null, 2));

  } catch (error) {
    console.error('Error testing 1inch current_value:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

test1inchCurrentValue(); 