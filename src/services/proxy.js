import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const port = 5003;

// You'll need to set your 1inch API authorization header
// Either in environment variables or directly here
const headers = {
    Authorization: `Bearer ${process.env.VITE_ONEINCH_API_KEY || process.env.ONEINCH_API_KEY || "YOUR_API_KEY_HERE"}`,
    "Content-Type": "application/json",
};

app.use(cors());
app.use(express.json());

// Proxy endpoint that matches the portfolio service expectations
app.get("/proxy", async (req, res) => {
    try {
        const { url } = req.query;
        console.log("Proxy request received for URL:", url);

        if (!url) {
            console.log("No URL provided");
            return res.status(400).send("URL parameter is required");
        }

        if (!url.startsWith("https://api.1inch.dev")) {
            console.log("Invalid URL:", url);
            return res.status(400).send("URL must start with https://api.1inch.dev");
        }

        console.log("Making request to:", url);
        const response = await fetch(url, { headers });
        console.log("Response status:", response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error:", response.status, errorText);
            return res.status(response.status).json({
                error: `API Error: ${response.status}`,
                details: errorText
            });
        }

        const data = await response.json();
        console.log("Successfully fetched data for:", url);
        res.json(data);
    } catch (error) {
        console.error("Proxy error:", error);
        res.status(500).send("Error occurred while fetching data");
    }
});

app.listen(port, () => {
    console.log(`Proxy server running on http://localhost:${port}`);
});

export default app;