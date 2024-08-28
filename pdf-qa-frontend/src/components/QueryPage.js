import React, { useState } from 'react';
import axios from 'axios';

const QueryPage = ({ fileName }) => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSubmit = async () => {
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
        }
    };

    return (
        <div>
            <h2>Query PDF</h2>
            <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Enter your query"
            />
            <button onClick={handleSubmit}>Submit Query</button>
            {response && <div>Response: {response}</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    );
};

export default QueryPage;
