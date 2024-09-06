import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UploadPage.css'; // Import CSS file

const UploadPage = ({ onUploadSuccess, onSelectPdf }) => {
    const [pdf, setPdf] = useState(null);
    const [pdfs, setPdfs] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPdfs = async () => {
            try {
                const response = await axios.get('http://16.171.32.191/get_user_pdfs', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });
                setPdfs(response.data.pdfs);
            } catch (error) {
                console.error('Error fetching PDFs:', error);
            }
        };

        fetchPdfs();
    }, []);

    const handleFileChange = (event) => {
        setPdf(event.target.files[0]);
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('pdf', pdf);

        setLoading(true);
        try {
            const response = await axios.post('http://16.171.32.191/upload_pdf', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });

            if (response.status === 200) {
                onUploadSuccess();
                // Refresh the list of PDFs
                const newPdfs = await axios.get('http://16.171.32.191/get_user_pdfs', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });
                setPdfs(newPdfs.data.pdfs);
            } else {
                setError('Upload failed. Please try again.');
            }
        } catch (error) {
            setError('Error uploading PDF: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPdf = (filename) => {
        onSelectPdf(filename);
    };

    const handleDeletePdf = async (filename) => {
        try {
            const response = await axios.delete('http://16.171.32.191/delete_pdf', {
                data: { filename },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });

            if (response.status === 200) {
                setPdfs(pdfs.filter(pdf => pdf.filename !== filename));
            } else {
                setError('Delete failed. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting PDF:', error.response || error.message);
            setError('Error deleting PDF: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleLogout = async () => {
        try {
            // Call the logout endpoint
            const response = await axios.post('http://16.171.32.191/logout', {
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
                setError('Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during logout:', error);
            setError('Error during logout: ' + error.message);
        }
    };

    return (
        <div className="upload-container">
            <button onClick={handleLogout} className="logout-button">
                Logout
            </button>

            <h2>Upload PDF</h2>
            <form onSubmit={handleUpload} className="upload-form">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                    className="file-input"
                />
                <button type="submit" disabled={loading} className="upload-button">
                    {loading ? 'Uploading...' : 'Upload'}
                </button>
            </form>

            {loading && (
                <div className="loading-indicator">
                    <div className="spinner"></div>
                </div>
            )}

            <h3>Previously Uploaded PDFs</h3>
            {pdfs.length > 0 ? (
                <ul className="pdf-list">
                    {pdfs.map(pdf => (
                        <li key={pdf.id} className="pdf-item">
                            <span className="pdf-filename">{pdf.filename}</span>
                            <div className="button-group">
                                <button onClick={() => handleSelectPdf(pdf.filename)} className="select-button">
                                    Use for Query
                                </button>
                                <button onClick={() => handleDeletePdf(pdf.filename)} className="delete-button">
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No PDFs uploaded yet.</p>
            )}

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default UploadPage;
