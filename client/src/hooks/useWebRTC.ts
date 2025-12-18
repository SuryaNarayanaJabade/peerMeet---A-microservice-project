import { useEffect, useRef, useState } from 'react';
import socket from '../services/socket';
import { auth } from '../firebase';

const ICE_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Add TURN server here if needed
    ]
};

export const useWebRTC = (roomId: string) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const user = auth.currentUser;

    const [participants, setParticipants] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        let mounted = true;

        const setupSocket = () => {
            console.log("Setting up socket listeners");

            // Remove existing listeners first to be safe
            socket.off('user-connected');
            socket.off('user-disconnected');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');

            socket.on('user-connected', async (userId) => {
                if (!mounted) return;
                console.log('EVENT: user-connected', userId);
                setParticipants(prev => {
                    if (prev.includes(userId)) return prev;
                    return [...prev, userId];
                });
                createOffer(userId);
            });

            socket.on('user-disconnected', (userId) => {
                if (!mounted) return;
                console.log('EVENT: user-disconnected', userId);
                setParticipants(prev => prev.filter(id => id !== userId));
                if (peerConnection.current) {
                    console.log("Closing peer connection due to user disconnect");
                    peerConnection.current.close();
                    peerConnection.current = null;
                    setRemoteStream(null);
                }
            });

            socket.on('offer', async ({ sdp, sender }) => {
                if (!mounted) return;
                console.log('EVENT: offer received from', sender);
                setParticipants(prev => {
                    if (!prev.includes(sender)) return [...prev, sender];
                    return prev;
                });
                await handleOffer(sdp, sender);
            });

            socket.on('answer', async ({ sdp }) => {
                if (!mounted) return;
                console.log('EVENT: answer received');
                try {
                    await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(sdp));
                } catch (e) {
                    console.error("Error setting remote description (answer):", e);
                }
            });

            socket.on('ice-candidate', async ({ candidate }) => {
                if (!mounted) return;
                console.log('EVENT: ice-candidate received');
                if (peerConnection.current) {
                    try {
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (e) {
                        console.error("Error adding ice candidate:", e);
                    }
                }
            });
        };

        const init = async () => {
            try {
                console.log("Initializing WebRTC hook for room:", roomId);

                // Setup socket listeners immediately
                setupSocket();

                // Detailed Socket connection logging
                socket.on('connect', () => {
                    console.log('SOCKET: Connected with ID:', socket.id);
                });

                socket.on('connect_error', (err) => {
                    console.error('SOCKET: Connection error:', err.message);
                });

                socket.on('disconnect', (reason) => {
                    console.log('SOCKET: Disconnected. Reason:', reason);
                });

                try {
                    console.log("Getting local media stream...");
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    if (mounted) {
                        console.log("Local stream obtained successfully");
                        localStreamRef.current = stream;
                        setLocalStream(stream);

                        // Add tracks to existing peer connection if it exists
                        if (peerConnection.current) {
                            console.log("Adding tracks to existing peer connection");
                            stream.getTracks().forEach(track => {
                                peerConnection.current?.addTrack(track, stream);
                            });
                        }
                    } else {
                        console.log("Hook unmounted during media acquisition, stopping tracks");
                        stream.getTracks().forEach(track => track.stop());
                        return;
                    }
                } catch (mediaErr) {
                    console.error("CRITICAL: Failed to get local media stream:", mediaErr);
                    setError("Media access denied. Please check site permissions.");
                }

                if (!mounted) return;

                console.log("Attempting to connect to signaling server at:", (socket as any).io.uri);
                if (!socket.connected) {
                    socket.connect();
                }

                console.log("Emitting join-room for room:", roomId);
                socket.emit('join-room', roomId, user?.uid);

            } catch (err: any) {
                console.error("Error in WebRTC init:", err);
            }
        };

        init();

        return () => {
            console.log("Cleaning up WebRTC hook");
            mounted = false;
            localStreamRef.current?.getTracks().forEach(track => track.stop());

            socket.off('user-connected');
            socket.off('user-disconnected');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');

            socket.disconnect();
            peerConnection.current?.close();
            peerConnection.current = null;
        };
    }, [roomId]);

    const createPeerConnection = (targetUserId: string) => {
        console.log("Creating PeerConnection for target:", targetUserId);
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("Generated ICE candidate");
                socket.emit('ice-candidate', {
                    target: targetUserId,
                    candidate: event.candidate,
                    sender: user?.uid
                });
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log("ICE Connection State Change:", pc.iceConnectionState);
        };

        pc.onconnectionstatechange = () => {
            console.log("Connection State Change:", pc.connectionState);
        };

        pc.ontrack = (event) => {
            console.log("Track received");
            setRemoteStream(event.streams[0]);
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));
        }

        peerConnection.current = pc;
        return pc;
    };

    const createOffer = async (targetUserId: string) => {
        console.log("Creating offer for:", targetUserId);
        const pc = createPeerConnection(targetUserId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        setError(null);

        console.log("Sending offer...");
        socket.emit('offer', {
            target: targetUserId,
            sdp: offer,
            sender: user?.uid
        });
    };

    const handleOffer = async (sdp: RTCSessionDescriptionInit, senderId: string) => {
        console.log("Handling offer from:", senderId);
        const pc = createPeerConnection(senderId);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        console.log("Sending answer...");
        socket.emit('answer', {
            target: senderId,
            sdp: answer,
            sender: user?.uid
        });
    };

    return { localStream, remoteStream, participants, error };
};
