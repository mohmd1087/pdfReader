import React, { useState } from 'react';
import axios from 'axios';
import './QueryPage.css'; // Import CSS file

const QueryPage = ({ fileName, onUploadAnother }) => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setResponse('');
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/query_pdf', 
            { query, file_name: fileName }, 
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });
            setResponse(res.data.response);
        } catch (error) {
            setError('Error querying PDF: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="query-page-container">
            <div className="query-box">
                <h2>Ask A PDF</h2>
                <div className="query-input-section">
                    <input
                        type="text"
                        value={query}
                        onChange={handleQueryChange}
                        placeholder="Enter your query..."
                        className="query-input"
                    />
                    <button onClick={handleSubmit} className="submit-button" disabled={loading}>
                        {loading ? 'Processing...' : 'Submit Query'}
                    </button>
                </div>
                <div className="response-section">
                    {loading && <div className="loading-indicator"></div>}
                    {response && <div className="response-text">Response: {response}</div>}
                    {error && <div className="error-text">{error}</div>}
                </div>
                <button className="upload-another-button" onClick={onUploadAnother}>
                    Upload Another PDF
                </button>
            </div>
        </div>
    );
};

export default QueryPage;
