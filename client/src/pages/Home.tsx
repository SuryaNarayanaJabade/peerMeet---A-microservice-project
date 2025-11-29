import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import api from '../services/api';
import { signOut } from 'firebase/auth';
import { Video, Plus, LogOut, RefreshCw } from 'lucide-react';

export const Home = () => {
    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const user = auth.currentUser;

    const fetchMeetings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await api.get('/meetings', {
                params: { userId: user.uid }
            });
            setMeetings(response.data);
        } catch (error) {
            console.error("Error fetching meetings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, [user]);

    const createMeeting = async () => {
        if (!user) return;

        try {
            const response = await api.post('/meetings', {
                title: `${user.displayName}'s Meeting`,
                hostId: user.uid,
                hostName: user.displayName
            });
            navigate(`/meeting/${response.data.id}`);
        } catch (error) {
            console.error("Error creating meeting:", error);
        }
    };

    const handleLogout = () => {
        signOut(auth);
    };

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Video size={32} color="var(--accent)" />
                    <h1>My Meetings</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>{user?.displayName}</span>
                    <button onClick={fetchMeetings} style={{ background: 'transparent', padding: '0.5rem' }} title="Refresh">
                        <RefreshCw size={20} color="var(--text-secondary)" className={loading ? 'spin' : ''} />
                    </button>
                    <button onClick={handleLogout} style={{ background: 'transparent', padding: '0.5rem' }} title="Logout">
                        <LogOut size={20} color="var(--text-secondary)" />
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div
                    className="card"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        borderStyle: 'dashed',
                        minHeight: '200px'
                    }}
                    onClick={createMeeting}
                >
                    <div style={{
                        background: 'var(--accent)',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }}>
                        <Plus color="white" size={24} />
                    </div>
                    <h3>New Meeting</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Start an instant meeting</p>
                </div>

                <div
                    className="card"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        borderStyle: 'dashed',
                        minHeight: '200px'
                    }}
                    onClick={async () => {
                        const dateStr = prompt("Enter date and time (YYYY-MM-DD HH:MM):");
                        if (dateStr) {
                            const scheduledAt = new Date(dateStr).toISOString();
                            if (!user) return;
                            try {
                                await api.post('/meetings', {
                                    title: `${user.displayName}'s Scheduled Meeting`,
                                    hostId: user.uid,
                                    hostName: user.displayName,
                                    scheduledAt
                                });
                                fetchMeetings(); // Refresh list
                            } catch (error) {
                                console.error("Error scheduling meeting:", error);
                            }
                        }
                    }}
                >
                    <div style={{
                        background: 'var(--accent)',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }}>
                        <Plus color="white" size={24} />
                    </div>
                    <h3>Schedule Meeting</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Plan for later</p>
                </div>

                <div
                    className="card"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        borderStyle: 'dashed',
                        minHeight: '200px'
                    }}
                    onClick={() => {
                        const meetingId = prompt("Enter Meeting ID:");
                        if (meetingId) {
                            navigate(`/meeting/${meetingId}`);
                        }
                    }}
                >
                    <div style={{
                        background: 'var(--accent)',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }}>
                        <Video color="white" size={24} />
                    </div>
                    <h3>Join Meeting</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Enter code to join</p>
                </div>

                {meetings.map(meeting => (
                    <div key={meeting.id} className="card">
                        <h3>{meeting.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            {new Date(meeting.createdAt).toLocaleString()}
                            {meeting.scheduledAt && <br />}
                            {meeting.scheduledAt && `Scheduled: ${new Date(meeting.scheduledAt).toLocaleString()}`}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '1rem',
                                background: meeting.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                color: meeting.status === 'active' ? 'var(--success)' : 'var(--text-secondary)',
                                fontSize: '0.75rem'
                            }}>
                                {meeting.status}
                            </span>
                            <button
                                className="btn-primary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                onClick={() => navigate(`/meeting/${meeting.id}`)}
                            >
                                Join
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};
