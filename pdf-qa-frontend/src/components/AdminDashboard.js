import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css'; // Import your CSS file

const AdminDashboard = () => {
    const [activeSessions, setActiveSessions] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPdfs, setUserPdfs] = useState([]);
    const [pdfChats, setPdfChats] = useState([]);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('token'); // Ensure this is the correct token

    useEffect(() => {
        // Fetch active sessions
        axios.get('http://16.171.32.191/admin/active_users', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
        })
        .then(response => setActiveSessions(response.data.active_users))
        .catch(error => setError(error.message));
        
        // Fetch all users
        axios.get('http://16.171.32.191/admin/users', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
        })
        .then(response => setAllUsers(response.data.users))
        .catch(error => setError(error.message));
    }, [token]);

    const handleUserClick = (userId) => {
        setSelectedUser(userId);

        // Fetch PDFs for the selected user
        axios.get('http://16.171.32.191/admin/pdfs', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
        })
        .then(response => setUserPdfs(response.data.pdfs.filter(pdf => pdf.user_id === userId)))
        .catch(error => setError(error.message));
    };

    const handlePdfClick = (pdfId) => {
        setSelectedPdf(pdfId);

        // Fetch chat history for the selected PDF
        axios.get(`http://16.171.32.191/admin/pdf_chats/${pdfId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
        })
        .then(response => setPdfChats(response.data.chats))
        .catch(error => setError(error.message));
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            <div className="section">
                <h2>Active Sessions</h2>
                <ul>
                    {activeSessions.map(session => (
                        <li key={session.user_id}> {/* Ensure user_id is unique */}
                            <p>User: {session.username}</p>
                            <p>Login Time: {new Date(session.login_time).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="section">
                <h2>All Accounts</h2>
                <ul>
                    {allUsers.map(user => (
                        <li key={user.id} onClick={() => handleUserClick(user.id)}> {/* Ensure user.id is unique */}
                            <p>{user.first_name} {user.last_name} ({user.email})</p>
                        </li>
                    ))}
                </ul>
            </div>

            {selectedUser && (
                <div className="section">
                    <h2>User PDFs</h2>
                    <ul>
                        {userPdfs.map(pdf => (
                            <li key={pdf.id} onClick={() => handlePdfClick(pdf.id)}> {/* Ensure pdf.id is unique */}
                                <p>{pdf.filename}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {selectedPdf && (
                <div className="section">
                    <h2>Chat History</h2>
                    <ul>
                        {pdfChats.map(chat => (
                            <li key={chat.id}> {/* Ensure chat.id is unique */}
                                <p><strong>Question:</strong> {chat.question}</p>
                                <p><strong>Answer:</strong> {chat.answer}</p>
                                <p><strong>Timestamp:</strong> {new Date(chat.timestamp).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default AdminDashboard;
