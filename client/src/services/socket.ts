import { io } from 'socket.io-client';

// Connect to Signaling Service directly
const socket = io('http://localhost:8002', {
    autoConnect: false,
});

export default socket;
