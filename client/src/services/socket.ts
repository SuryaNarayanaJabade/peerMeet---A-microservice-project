import { io } from 'socket.io-client';

// Connect to Signaling Service directly
const socket = io(import.meta.env.VITE_SIGNALING_SERVICE_URL || 'http://34.41.108.250', {
    autoConnect: false,
});

export default socket;
