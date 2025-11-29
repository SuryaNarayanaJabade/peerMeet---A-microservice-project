import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from './middleware/auth';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

// Health check
app.get('/health', (req, res) => {
    res.send('API Gateway is running');
});

// Meeting Service Proxy
app.use('/meetings', authMiddleware, createProxyMiddleware({
    target: 'http://localhost:8001',
    changeOrigin: true,
    pathRewrite: {
        '^/meetings': '', // Remove /meetings prefix when forwarding
    },
}));

// Signaling Service Proxy (optional, usually sockets connect directly but can be proxied)
// For now, we'll let the client connect directly to 8002 for websockets to avoid proxy complexity

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
