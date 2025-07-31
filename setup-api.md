# Setting up 1inch API Key

## 1. Get your API Key

1. Go to https://portal.1inch.dev/
2. Sign up or log in
3. Create a new API key
4. Copy the API key

## 2. Set the API Key

### Option A: Using Environment Variable (Recommended)

Create a `.env` file in the project root:

```bash
echo "ONEINCH_API_KEY=your_api_key_here" > .env
```

### Option B: Using Command Line

Start the proxy server with the API key:

```bash
ONEINCH_API_KEY=your_api_key_here node src/services/proxy.js
```

### Option C: Update proxy.js directly

Edit `src/services/proxy.js` line 9:
```javascript
const API_KEY = process.env.ONEINCH_API_KEY || "your_actual_api_key_here";
```

## 3. Test the API

Run the test script:

```bash
node test-1inch-api.js
```

This will test various endpoints and show you if the API key is working correctly.

## 4. Start the Application

1. Start the proxy server:
   ```bash
   node src/services/proxy.js
   ```

2. In another terminal, start the Vite dev server:
   ```bash
   npm run dev
   ```

## Troubleshooting

- If you see "Unauthorized" errors, your API key is not set correctly
- Make sure the proxy server is running on port 5003
- Check the browser console for detailed error messages
- The 1inch API has rate limits, so don't make too many requests quickly