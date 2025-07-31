# Teleport Portfolio

A Web3 portfolio tracker that displays your tokens and DeFi positions across multiple protocols using the 1inch API.

## Setup

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Configure 1inch API Key

You need a 1inch API key to fetch portfolio data:

1. Get your API key from https://portal.1inch.dev/
2. Create a `.env.local` file in the project root:
   ```
   VITE_ONEINCH_API_KEY=your_api_key_here
   ```

### 3. Start the Application

Start both the proxy server and the development server:

```bash
# Terminal 1: Start the proxy server with API key
VITE_ONEINCH_API_KEY=your_api_key_here node src/services/proxy.js

# Or if you have the .env.local file set up:
node src/services/proxy.js

# Terminal 2: Start the Vite dev server
npm run dev
```

Visit http://localhost:5173/teleport to view your portfolio.

### How the Proxy Server Works

The application uses a proxy server to handle API calls to the 1inch API. This approach:

- **Handles CORS**: Prevents cross-origin request issues
- **Secures API keys**: Keeps your API key on the server side
- **Adds authentication**: Automatically adds the `Bearer` token to requests
- **Provides logging**: Shows detailed request/response information

**Proxy Server Details:**
- **Port**: 5003 (http://localhost:5003)
- **Endpoint**: `/proxy?url=<1inch_api_url>`
- **Environment Variable**: `VITE_ONEINCH_API_KEY`
- **Authorization**: Automatically adds `Bearer <api_key>` header

**Important Notes:**
- The proxy server must be running on port 5003 for the API calls to work
- Make sure to replace `your_api_key_here` with your actual 1inch API key
- The proxy server handles CORS and adds the proper Authorization headers
- If you see "Unauthorized" errors, check that your API key is correct

## Features

- View token balances across multiple networks
- Track DeFi positions in Aave, Compound, Uniswap, and more
- Switch between Ethereum, Polygon, and Arbitrum networks
- Real-time portfolio value tracking
- Multi-wallet support

## Testing the API

Run the test script to verify your API key is working:

```bash
node test-1inch-api.js
```

## Troubleshooting

### Common Issues

**Unauthorized errors (401)**
- Make sure your API key is set correctly in the `.env.local` file
- Verify the API key is valid at https://portal.1inch.dev/
- Check that the proxy server is using the correct environment variable: `VITE_ONEINCH_API_KEY`

**Proxy server not starting**
- Ensure you have the correct API key
- Check that port 5003 is not already in use: `lsof -i :5003`
- Kill any existing proxy processes: `pkill -f "node src/services/proxy.js"`

**API calls failing (500 errors)**
- Restart the proxy server with the correct API key
- Check the proxy server logs for detailed error messages
- Verify the API key has the correct permissions

**No positions showing**
- Ensure you're on the correct network (mainnet vs polygon)
- Connect your wallet to the application
- Check that your wallet has tokens on the selected network

**CORS errors**
- The proxy server handles CORS automatically
- Make sure the proxy server is running on http://localhost:5003
- Check that the frontend is making requests to the correct proxy URL

### Debug Steps

1. **Test the API directly:**
   ```bash
   curl "http://localhost:5003/proxy?url=https://api.1inch.dev/balance/v1.2/137/balances/0x1234567890123456789012345678901234567890"
   ```

2. **Check proxy server logs:**
   The proxy server will log all requests and errors when running

3. **Verify environment variables:**
   ```bash
   echo $VITE_ONEINCH_API_KEY
   ```

4. **Test with the provided test script:**
   ```bash
   node test-1inch-api.js
   ```
