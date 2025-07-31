import axios from 'axios';

const TEST_ADDRESS = '0x641AD78BAca220C5BD28b51Ce8e0F495e85Fe689';
const CHAIN_ID = 1; // Ethereum mainnet
const PROXY_URL = "http://localhost:5003/proxy";

async function testUniswapPositions() {
  console.log('Testing Uniswap positions for address:', TEST_ADDRESS);
  console.log('Chain ID:', CHAIN_ID);

  try {
    // First, let's get the general portfolio data to see all protocols
    const portfolioResponse = await axios.get(PROXY_URL, {
      params: {
        url: `https://api.1inch.dev/portfolio/portfolio/v5.0/general/current_value?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}&use_cache=true`
      },
      timeout: 10000
    });

    console.log('\n=== General Portfolio Response ===');
    console.log('Status:', portfolioResponse.status);
    console.log('Data:', JSON.stringify(portfolioResponse.data, null, 2));

    const portfolioData = portfolioResponse.data.result;
    const protocolGroups = portfolioData.by_protocol_group || [];
    
    // Find Uniswap protocols
    const uniswapProtocols = protocolGroups.filter(protocol =>
      protocol.protocol_group_id.toLowerCase().includes('uniswap') ||
      protocol.protocol_group_name.toLowerCase().includes('uniswap')
    );

    console.log('\n=== Uniswap Protocols Found ===');
    console.log('Count:', uniswapProtocols.length);
    uniswapProtocols.forEach((protocol, index) => {
      console.log(`\nProtocol ${index + 1}:`);
      console.log('  ID:', protocol.protocol_group_id);
      console.log('  Name:', protocol.protocol_group_name);
      console.log('  Value USD:', protocol.value_usd);
      console.log('  Value ETH:', protocol.value_eth);
    });

    // Now let's try to get detailed Uniswap positions
    console.log('\n=== Fetching Detailed Uniswap Positions ===');
    try {
      const uniswapPositionsResponse = await axios.get(PROXY_URL, {
        params: {
          url: `https://api.1inch.dev/portfolio/portfolio/v5.0/protocols/uniswapv3/positions?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}&use_cache=true`
        },
        timeout: 10000
      });

      console.log('Uniswap Positions Response Status:', uniswapPositionsResponse.status);
      console.log('Uniswap Positions Data:', JSON.stringify(uniswapPositionsResponse.data, null, 2));
    } catch (uniswapError) {
      console.log('Error fetching Uniswap positions:', uniswapError.response?.status, uniswapError.response?.data);
    }

    // Let's also try Uniswap V2
    console.log('\n=== Fetching Uniswap V2 Positions ===');
    try {
      const uniswapV2PositionsResponse = await axios.get(PROXY_URL, {
        params: {
          url: `https://api.1inch.dev/portfolio/portfolio/v5.0/protocols/uniswapv2/positions?addresses=${TEST_ADDRESS}&chain_id=${CHAIN_ID}&use_cache=true`
        },
        timeout: 10000
      });

      console.log('Uniswap V2 Positions Response Status:', uniswapV2PositionsResponse.status);
      console.log('Uniswap V2 Positions Data:', JSON.stringify(uniswapV2PositionsResponse.data, null, 2));
    } catch (uniswapV2Error) {
      console.log('Error fetching Uniswap V2 positions:', uniswapV2Error.response?.status, uniswapV2Error.response?.data);
    }

  } catch (error) {
    console.error('Error testing Uniswap positions:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testUniswapPositions(); 