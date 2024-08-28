import React, { useState } from 'react';
import UploadPage from './components/UploadPage';
import QueryPage from './components/QueryPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AdminDashboard from './components/AdminDashboard';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleLoginSuccess = (admin) => {
        setIsAuthenticated(true);
        setIsAdmin(admin);
    };

    const handleUploadSuccess = () => {
        setUploaded(true);
    };

    const handleSignup = () => {
        setIsSignup(true);
    };

    const handleSignupSuccess = () => {
        setIsSignup(false); // Switch back to login page
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUploaded(false);
        setSelectedFile(null);
    };

    const handleSelectPdf = (filename) => {
        setSelectedFile(filename);
        setUploaded(true);
    };

    if (!isAuthenticated) {
        return isSignup ? (
            <SignupPage onSignupSuccess={handleSignupSuccess} />
        ) : (
            <LoginPage onLoginSuccess={handleLoginSuccess} onSignup={handleSignup} />
        );
    }

    if (isAdmin) {
        return <AdminDashboard onLogout={handleLogout} />;
    }

    return (
        <div>
            {uploaded ? (
                <QueryPage fileName={selectedFile} />
            ) : (
                <UploadPage
                    onUploadSuccess={handleUploadSuccess}
                    onSelectPdf={handleSelectPdf}
                />
            )}
        </div>
    );
};

export default App;
