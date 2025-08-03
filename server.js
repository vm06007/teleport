import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const port = 5003;
const port = process.env.PORT || 5003;

// Replace with your actual API key from https://portal.1inch.dev/
const API_KEY = process.env.ONEINCH_API_KEY || "YOUR_API_KEY_HERE";

const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
};

app.use(cors());
app.use(express.json());

// Health check endpoint - root path
app.get("/", (req, res) => {
    res.status(200).send("hello-world");
});

// Health check endpoint - explicit health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        message: "Proxy server is running",
        timestamp: new Date().toISOString()
    });
});

// Proxy endpoint for 1inch API
app.get("/proxy", async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ error: "URL parameter is required" });
        }

        if (!url.startsWith("https://api.1inch.dev")) {
            return res.status(400).json({ error: "URL must start with https://api.1inch.dev" });
        }

        console.log("Fetching:", url);

        const response = await fetch(url, {
            headers,
            method: "GET"
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error:", response.status, errorText);
            return res.status(response.status).json({
                error: `API Error: ${response.status}`,
                details: errorText
            });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Proxy error:", error);
        res.status(500).json({
            error: "Error occurred while fetching data",
            details: error.message
        });
    }
});

// Keep the server alive with a ping endpoint
app.get("/ping", (req, res) => {
    res.status(200).send("pong");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});

const server = app.listen(port, () => {
    console.log(`Proxy server running on http://localhost:${port}`);
    console.log(`Health check available at: http://localhost:${port}/health`);
    console.log(`Root endpoint available at: http://localhost:${port}/`);
    console.log(`Make sure to set your API key in the code or ONEINCH_API_KEY environment variable`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

// Keep the process alive
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});