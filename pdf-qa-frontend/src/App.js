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
    const [userId, setUserId] = useState(null); // State for userId

    const handleLoginSuccess = (admin, id) => {
        setIsAuthenticated(true);
        setIsAdmin(admin);
        setUserId(id); // Set the userId when the user logs in
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
        setUserId(null); // Clear the userId on logout
    };

    const handleSelectPdf = (filename) => {
        setSelectedFile(filename);
        setUploaded(true);
    };

    const handleUploadAnother = () => {
        setUploaded(false); // Reset uploaded state to go back to UploadPage
        setSelectedFile(null); // Optionally clear selected file
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
                <QueryPage
                    fileName={selectedFile}
                    userId={userId} // Pass userId to QueryPage
                    onUploadAnother={handleUploadAnother} // Pass handler to QueryPage
                />
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
