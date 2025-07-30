# Portfolio Proxy Setup

To use the portfolio functionality, you need to run the built-in proxy server:

## Steps:

1. The API key is already configured in `server.js` with your key: `jnSBv4cJLnFd4BtiSrxosxaFdasKTMV8`

2. Run the proxy server from the teleport project root:
   ```bash
   bun run server
   ```
   
   Or directly:
   ```bash
   node server.js
   ```

3. In another terminal, run the app:
   ```bash
   bun run dev
   ```

4. Navigate to `/teleport` and connect your wallet

The proxy server will run on http://localhost:5003

## Getting an API Key

Visit https://portal.1inch.dev/ to get your free API key.