import { Server, Socket } from 'socket.io';

export const setupSocketHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-room', (roomId: string, userId: string) => {
            console.log(`User ${userId} joined room ${roomId}`);
            socket.join(roomId);
            socket.join(userId); // Join a room with the user's ID for direct messaging
            socket.to(roomId).emit('user-connected', userId);

            socket.on('disconnect', () => {
                console.log(`User ${userId} disconnected`);
                socket.to(roomId).emit('user-disconnected', userId);
            });
        });

        socket.on('offer', (payload: { target: string; sdp: any; sender: string }) => {
            console.log(`Relaying OFFER from ${payload.sender} to ${payload.target}`);
            io.to(payload.target).emit('offer', { sdp: payload.sdp, sender: payload.sender });
        });

        socket.on('answer', (payload: { target: string; sdp: any; sender: string }) => {
            console.log(`Relaying ANSWER from ${payload.sender} to ${payload.target}`);
            io.to(payload.target).emit('answer', { sdp: payload.sdp, sender: payload.sender });
        });

        socket.on('ice-candidate', (payload: { target: string; candidate: any; sender: string }) => {
            console.log(`Relaying ICE CANDIDATE from ${payload.sender} to ${payload.target}`);
            io.to(payload.target).emit('ice-candidate', { candidate: payload.candidate, sender: payload.sender });
        });
    });
};
