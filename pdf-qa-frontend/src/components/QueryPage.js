import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QueryPage.css'; // Ensure the CSS handles the chat bubble styling and layout

const QueryPage = ({ fileName, onUploadAnother }) => {
    const [query, setQuery] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSubmit = async () => {
        if (!query.trim()) return; // Prevent empty submissions

        // Add the user's query to the chat history
        const newQuery = { role: 'user', content: query };
        setChatHistory([...chatHistory, newQuery]);

        // Add a processing bubble
        setChatHistory((prevHistory) => [
            ...prevHistory,
            { role: 'system', content: 'Processing...', isProcessing: true }
        ]);

        setLoading(true);
        setError('');

        try {
            const res = await axios.post(
                '/query_pdf',
                { query, file_name: fileName },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                    },
                }
            );

            // Replace the processing bubble with the system's response
            const newResponse = { role: 'system', content: res.data.response };
            setChatHistory((prevHistory) =>
                prevHistory.map((item) =>
                    item.isProcessing ? newResponse : item
                )
            );
        } catch (error) {
            setError('Error querying PDF: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
            setQuery(''); // Clear the input field after submission
        }
    };

    useEffect(() => {
        // Fetch chat history when fileName changes
        const fetchChatHistory = async () => {
            try {
                const res = await axios.get(
                    `/get_chat_history`,
                    {
                        params: { file_name: fileName },
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                        },
                    }
                );

                // Convert backend format to frontend format
                const formattedChatHistory = res.data.chat_history.flatMap(msg => [
                    { role: 'user', content: msg.question },
                    { role: 'system', content: msg.answer }
                ]);

                setChatHistory(formattedChatHistory);
            } catch (error) {
                setError('Error fetching chat history: ' + (error.response?.data?.error || error.message));
            }
        };

        if (fileName) {
            fetchChatHistory();
        }
    }, [fileName]);

    useEffect(() => {
        // Scroll to the bottom of the chat on new messages
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [chatHistory]);

    return (
        <div className="query-page-container">
            <div id="chat-container" className="chat-container">
                {chatHistory.map((chat, index) => (
                    <div
                        key={index}
                        className={`chat-bubble ${chat.role === 'user' ? 'user-bubble' : 'system-bubble'} ${chat.isProcessing ? 'processing-bubble' : ''}`}
                    >
                        {chat.content}
                    </div>
                ))}
                {loading && <div className="loading-indicator"></div>}
                {error && <div className="error-text">{error}</div>}
            </div>
            <div className="input-section">
                <input
                    type="text"
                    value={query}
                    onChange={handleQueryChange}
                    placeholder="Enter your query..."
                    className="query-input"
                />
                <button onClick={handleSubmit} className="submit-button" disabled={loading}>
                    Submit Query
                </button>
                <button className="upload-another-button" onClick={onUploadAnother}>
                    Upload Another PDF
                </button>
            </div>
        </div>
    );
};

export default QueryPage;
