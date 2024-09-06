import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css'; // Import the CSS file

const SignupPage = ({ onSignupSuccess }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async () => {
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            await axios.post('/main/register', {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
            });
            onSignupSuccess();
            navigate('/login');
        } catch (error) {
            console.error('Error during signup:', error);
        }
    };

    
    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2>Create an Account</h2>
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-field"
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input-field"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                />
                <button onClick={handleSignup} className="signup-button">Sign Up</button>
            </div>
        </div>
    );
};

export default SignupPage;
