import axios from 'axios';

const PROXY_URL = "https://proxy-lion-app-naii8.ondigitalocean.app/proxy";

async function testDeployedProxy() {
    console.log('🧪 Testing deployed proxy server...\n');

    try {
        // Test with a sample wallet address
        const testAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        const chainId = 1;

        console.log(`Testing proxy with address: ${testAddress}`);
        console.log(`Proxy URL: ${PROXY_URL}\n`);

        const response = await axios.get(PROXY_URL, {
            params: {
                url: `https://api.1inch.dev/portfolio/portfolio/v5.0/tokens/snapshot?addresses=${testAddress}&chain_id=${chainId}`
            },
            timeout: 10000
        });

        console.log('✅ Proxy connection successful!');
        console.log(`Status: ${response.status}`);
        console.log(`Data keys: ${Object.keys(response.data)}`);
        
        if (response.data.result) {
            console.log(`Found ${response.data.result.length} tokens`);
            response.data.result.forEach((token, index) => {
                console.log(`  ${index + 1}. ${token.contract_symbol} (${token.contract_name}) - $${token.value_usd?.toFixed(2) || 'N/A'}`);
            });
        }

        console.log('\n🎉 Deployed proxy is working correctly!');
        console.log('The frontend can now connect to the Digital Ocean proxy server.');

    } catch (error) {
        console.error('❌ Proxy test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testDeployedProxy(); 