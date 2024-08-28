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
    const [selectedFile, setSelectedFile] = useState(null); // New state for selected PDF

    const handleLoginSuccess = (admin) => {
        setIsAuthenticated(true);
        setIsAdmin(admin);
    };

    const handleUploadSuccess = () => {
        console.log('Upload successful, transitioning to QueryPage');
        setUploaded(true); // Ensure this state is updated
    };

    const handleSignup = () => {
        setIsSignup(true);
    };

    const handleSignupSuccess = () => {
        setIsSignup(false);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUploaded(false);
        setSelectedFile(null); // Reset selected file on logout
    };

    const handleSelectPdf = (filename) => {
        setSelectedFile(filename);
        setUploaded(true); // Transition to QueryPage
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
                <QueryPage fileName={selectedFile} /> // Pass the selected filename
            ) : (
                <UploadPage
                    onUploadSuccess={handleUploadSuccess}
                    onSelectPdf={handleSelectPdf} // Pass function to UploadPage
                />
            )}
        </div>
    );
};

export default App;
