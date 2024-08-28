import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();  // Prevent form from reloading the page
        try {
            const response = await axios.post('http://localhost:5000/login', { email, password });
            localStorage.setItem('jwtToken', response.data.access_token); // Store token in localStorage
            onLoginSuccess(response.data.isAdmin); // Pass isAdmin status to parent component
            navigate('/'); // Navigate to home or another page
        } catch (error) {
            setError('Invalid credentials, please try again.');
        }
    };

    const handleSignupRedirect = () => {
        navigate('/signup');
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <button onClick={handleSignupRedirect}>Sign up here</button></p>
        </div>
    );
};

export default LoginPage;
