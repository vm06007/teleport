import express from "express";
import cors from "cors";

const app = express();
const port = 5003;

// You'll need to set your 1inch API authorization header
// Either in environment variables or directly here
const headers = {
    Authorization: process.env.ONEINCH_API_KEY || "YOUR_API_KEY_HERE",
    "Content-Type": "application/json",
};

app.use(cors());
app.use(express.json());

// Proxy endpoint that matches the portfolio service expectations
app.get("/proxy", async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).send("URL parameter is required");
        }

        if (!url.startsWith("https://api.1inch.dev")) {
            return res.status(400).send("URL must start with https://api.1inch.dev");
        }

        const response = await fetch(url, { headers });
        const data = await response.json();

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