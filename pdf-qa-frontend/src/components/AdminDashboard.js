import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = ({ onLogout }) => {
    const [activeUsers, setActiveUsers] = useState([]);
    const [totalAccounts, setTotalAccounts] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await axios.get('http://localhost:5000/admin/sessions', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });
                setActiveUsers(response.data);
                
                const totalAccountsResponse = await axios.get('http://localhost:5000/admin/total_accounts', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });
                setTotalAccounts(totalAccountsResponse.data.total_accounts);
            } catch (error) {
                console.error('Error fetching summary:', error);
                alert('Failed to fetch data. Please check the console for details.');
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    const handleLogout = async () => {
        try {
            // Call the logout endpoint
            const response = await axios.post('http://localhost:5000/logout', {
                session_id: localStorage.getItem('session_id') // Ensure session_id is available in localStorage
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });

            if (response.status === 200) {
                // Clear the local storage and redirect to login page
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('session_id');
                window.location.href = '/login'; // Redirect to the login page
            } else {
                console.error('Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during logout:', error);
            // setError('Error during logout: ' + error.message);
        }
    };
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <button onClick={handleLogout}>Logout</button>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <h2>Active Users</h2>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                        {activeUsers.length ? (
                            <ul>
                                {activeUsers.map(user => (
                                    <li key={user.user_id}>
                                        User: {user.username}, Login Time: {new Date(user.login_time).toLocaleString()}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No active users</p>
                        )}
                    </div>
                    <h2>Total Accounts</h2>
                    <p>{totalAccounts}</p>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
