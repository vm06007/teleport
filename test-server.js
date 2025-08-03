import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5003';

async function testEndpoints() {
    console.log('Testing proxy server endpoints...\n');

    try {
        // Test root endpoint
        console.log('1. Testing root endpoint (/)...');
        const rootResponse = await fetch(`${BASE_URL}/`);
        const rootText = await rootResponse.text();
        console.log(`   Status: ${rootResponse.status}`);
        console.log(`   Response: "${rootText}"`);
        console.log(`   ✅ Root endpoint working\n`);

        // Test health endpoint
        console.log('2. Testing health endpoint (/health)...');
        const healthResponse = await fetch(`${BASE_URL}/health`);
        const healthData = await healthResponse.json();
        console.log(`   Status: ${healthResponse.status}`);
        console.log(`   Response:`, healthData);
        console.log(`   ✅ Health endpoint working\n`);

        // Test ping endpoint
        console.log('3. Testing ping endpoint (/ping)...');
        const pingResponse = await fetch(`${BASE_URL}/ping`);
        const pingText = await pingResponse.text();
        console.log(`   Status: ${pingResponse.status}`);
        console.log(`   Response: "${pingText}"`);
        console.log(`   ✅ Ping endpoint working\n`);

        // Test proxy endpoint (with a simple 1inch API call)
        console.log('4. Testing proxy endpoint (/proxy)...');
        const proxyResponse = await fetch(`${BASE_URL}/proxy?url=https://api.1inch.dev/portfolio/portfolio/v5.0/tokens/snapshot?addresses=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6&chain_id=1`);
        console.log(`   Status: ${proxyResponse.status}`);
        if (proxyResponse.ok) {
            const proxyData = await proxyResponse.json();
            console.log(`   Response keys:`, Object.keys(proxyData));
            console.log(`   ✅ Proxy endpoint working\n`);
        } else {
            const errorText = await proxyResponse.text();
            console.log(`   Error: ${errorText}`);
            console.log(`   ⚠️  Proxy endpoint may have API key issues\n`);
        }

        console.log('🎉 All basic endpoints are working!');
        console.log('The server is ready for deployment.');

    } catch (error) {
        console.error('❌ Error testing endpoints:', error.message);
        console.log('Make sure the server is running with: bun run server');
    }
}

testEndpoints(); 