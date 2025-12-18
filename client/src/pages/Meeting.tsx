import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
import { PhoneOff } from 'lucide-react';

export const Meeting = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { localStream, remoteStream, participants } = useWebRTC(id || '');

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Removed blocking error UI to allow passive joining

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>
            <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
                {/* Remote Video (Full Screen) */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {remoteStream || participants.length > 0 ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{ color: 'white' }}>Waiting for participant...</div>
                    )}
                </div>

                {/* Local Video (Picture in Picture) */}
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    width: '200px',
                    height: '150px',
                    background: '#333',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {localStream ? (
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                        />
                    ) : (
                        <div style={{ color: '#aaa', fontSize: '0.8rem' }}>Camera Off</div>
                    )}
                </div>
            </div>

            {/* Meeting ID display */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'rgba(0,0,0,0.6)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                zIndex: 10
            }}>
                <span>ID: {id}</span>
                <button
                    onClick={() => navigator.clipboard.writeText(id || '')}
                    style={{ background: 'transparent', padding: '0.25rem', border: '1px solid white' }}
                >
                    Copy
                </button>
            </div>

            {/* Controls */}
            <div style={{
                padding: '1rem',
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                background: 'rgba(0,0,0,0.8)'
            }}>
                <button className="btn-primary" style={{ borderRadius: '50%', padding: '1rem', background: '#ef4444' }} onClick={() => navigate('/')}>
                    <PhoneOff color="white" />
                </button>
            </div>
        </div>
    );
};
