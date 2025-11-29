import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSocketHandlers } from './socket/handler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for now, restrict in production
        methods: ["GET", "POST"]
    }
});

setupSocketHandlers(io);

server.listen(PORT, () => {
    console.log(`Signaling Service running on port ${PORT}`);
});
