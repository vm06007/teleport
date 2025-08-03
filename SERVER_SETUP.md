# Proxy Server Setup Guide

This guide explains how to set up and deploy the 1inch API proxy server for the Teleport DeFi application.

## Local Development

### 1. Install Dependencies
```bash
bun install
```

### 2. Set Environment Variables
Create a `.env` file in the root directory:
```env
ONEINCH_API_KEY=your_1inch_api_key_here
PORT=5003
```

### 3. Start the Server
```bash
bun run server
```

The server will start on `http://localhost:5003`

### 4. Test the Server
```bash
bun run test-server
```

This will test all endpoints to ensure they're working correctly.

## Available Endpoints

### Health Check Endpoints
- `GET /` - Returns "hello-world" (root endpoint)
- `GET /health` - Returns server status and timestamp
- `GET /ping` - Returns "pong" (keep-alive endpoint)

### API Proxy Endpoint
- `GET /proxy?url=<1inch_api_url>` - Proxies requests to 1inch API

## Vercel Deployment

### 1. Deploy the Server
The server is configured to deploy on Vercel using the `vercel.json` configuration:

```json
{
    "version": 2,
    "builds": [
        {
            "src": "server.js",
            "use": "@vercel/node"
        }
    ],
    "routes": [
        {
            "src": "/(.*)",
            "dest": "/server.js"
        }
    ],
    "env": {
        "NODE_ENV": "production"
    }
}
```

### 2. Set Environment Variables on Vercel
In your Vercel dashboard, set the following environment variables:
- `ONEINCH_API_KEY` - Your 1inch API key
- `NODE_ENV` - Set to "production"

### 3. Update Frontend Configuration
In the `starter-kit` directory, update the environment variable:
```env
VITE_PROXY_URL=https://your-vercel-deployment-url.vercel.app/proxy
```

## Health Checks

The server includes multiple health check endpoints to ensure Vercel can verify the deployment is working:

1. **Root Endpoint (`/`)**: Returns "hello-world" - used by Vercel for basic health checks
2. **Health Endpoint (`/health`)**: Returns detailed server status
3. **Ping Endpoint (`/ping`)**: Simple keep-alive endpoint

## Error Handling

The server includes comprehensive error handling:
- Graceful shutdown on SIGTERM/SIGINT
- Uncaught exception handling
- Unhandled rejection handling
- 404 handler for unmatched routes
- CORS support for cross-origin requests

## Troubleshooting

### Health Check Failures
If Vercel reports health check failures:

1. **Check the root endpoint**: Visit `https://your-deployment.vercel.app/` - should return "hello-world"
2. **Check environment variables**: Ensure `ONEINCH_API_KEY` is set in Vercel
3. **Check logs**: Review Vercel function logs for any errors
4. **Test locally**: Run `bun run test-server` to verify local functionality

### Common Issues

1. **API Key Issues**: Ensure your 1inch API key is valid and has the necessary permissions
2. **CORS Issues**: The server includes CORS middleware, but check if your frontend domain is allowed
3. **Timeout Issues**: The server includes proper timeout handling for API calls

## Security Considerations

1. **API Key Protection**: The API key is stored as an environment variable and not exposed in client-side code
2. **URL Validation**: The proxy only accepts URLs starting with `https://api.1inch.dev`
3. **Error Handling**: Sensitive error details are not exposed to clients in production

## Monitoring

The server logs important events:
- Server startup with available endpoints
- API requests and responses
- Errors and exceptions
- Graceful shutdown events

Check Vercel function logs for monitoring in production. 