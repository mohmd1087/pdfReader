import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Import the CSS file

const LoginPage = ({ onLoginSuccess, onSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', { email, password });
            localStorage.setItem('jwtToken', response.data.access_token);
            localStorage.setItem('sessionId', response.data.session_id); // Store session ID
            onLoginSuccess(response.data.isAdmin);
            navigate('/');
        } catch (error) {
            setError('Invalid credentials, please try again.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login to Ask A PDF</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="input-field"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="input-field"
                    />
                    <button type="submit" className="login-button">Login</button>
                </form>
                <p className="signup-text">Don't have an account? <button onClick={onSignup} className="signup-button">Sign up here</button></p>
            </div>
        </div>
    );
};

export default LoginPage;
