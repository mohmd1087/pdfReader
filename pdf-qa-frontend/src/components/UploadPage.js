import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
                onUploadSuccess(); // Notify App.js of successful upload
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
        onSelectPdf(filename); // Pass selected file to App.js
    };

    return (
        <div>
            <h2>Upload PDF</h2>
            <form onSubmit={handleUpload}>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                />
                <button type="submit" disabled={loading}>Upload</button>
            </form>
            <h3>Previously Uploaded PDFs</h3>
            {pdfs.length > 0 ? (
                <ul>
                    {pdfs.map(pdf => (
                        <li key={pdf.id}>
                            {pdf.filename}
                            <button onClick={() => handleSelectPdf(pdf.filename)}>Use for Query</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No PDFs uploaded yet.</p>
            )}
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    );
};

export default UploadPage;
