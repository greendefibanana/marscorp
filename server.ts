import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { getExchangeTable, addCompanyToIndexer } from './services/exchangeIndexer';
import { fetchKalshiMarkets } from './services/kalshiService';

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS Configuration
app.use(cors({
  origin: '*', // Allow all origins for hackathon demo
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Endpoint for Exchange Dashboard
app.get('/api/companies', async (req, res) => {
    try {
        const data = await getExchangeTable();
        res.json(data);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: "Internal Server Error during data retrieval" });
    }
});

// API Endpoint to Add New Company (In-Memory for Demo)
app.post('/api/companies', (req, res) => {
    try {
        const { name, ticker, sector, description, region } = req.body;
        if (!name || !ticker) {
            res.status(400).json({ error: "Missing name or ticker" });
            return;
        }
        addCompanyToIndexer({ 
            name, 
            ticker, 
            sector: sector || 'Tech', 
            desc: description || 'New launch', 
            region: region || 'Global' 
        });
        res.status(201).json({ success: true });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// API Endpoint for Prediction Markets (Kalshi) - Coming Soon
app.get('/api/kalshi/markets', (req, res) => {
    res.status(200).json({ message: "Kalshi markets coming soon!" });
});

// Export for Vercel
export default app;

// Only listen if running locally
if (import.meta.url === `file://${process.argv[1]}`) {
   app.listen(PORT, () => {
       console.log(`MarsCorp Exchange Indexer running on port ${PORT}`);
   });
}
