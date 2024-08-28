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
                const response = await axios.get('http://localhost:5000/get_user_pdfs', {
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
            const response = await axios.post('http://localhost:5000/upload_pdf', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });

            if (response.status === 200) {
                onUploadSuccess();
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

    return (
        <div className="page-container">
            <div className="upload-content">
                <h1 className="title">Ask A PDF</h1>
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
                        <p>Processing your PDF, please wait...</p>
                    </div>
                )}

                <h3 className="subtitle">Previously Uploaded PDFs</h3>
                {pdfs.length > 0 ? (
                    <ul className="pdf-list">
                        {pdfs.map(pdf => (
                            <li key={pdf.id} className="pdf-item">
                                {pdf.filename}
                                <button onClick={() => handleSelectPdf(pdf.filename)} className="select-button">
                                    Use for Query
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No PDFs uploaded yet.</p>
                )}

                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default UploadPage;
