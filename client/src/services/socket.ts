import { io } from 'socket.io-client';

// Connect to Signaling Service directly
const socket = io(import.meta.env.VITE_SIGNALING_SERVICE_URL || 'http://localhost:8002', {
    autoConnect: false,
});

export default socket;
