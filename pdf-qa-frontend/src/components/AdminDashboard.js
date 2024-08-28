import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = ({ onLogout }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await axios.get('http://localhost:5000/admin/sessions', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setSessions(response.data);
            } catch (error) {
                console.error('Error fetching sessions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <button onClick={onLogout}>Logout</button>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <h2>Active Sessions</h2>
                    <ul>
                        {sessions.length ? (
                            sessions.map(session => (
                                <li key={session.user_id}>
                                    User: {session.username}, Login Time: {session.login_time}
                                </li>
                            ))
                        ) : (
                            <p>No active sessions</p>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
