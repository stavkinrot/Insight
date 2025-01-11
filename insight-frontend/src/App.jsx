import React, { useState } from 'react';

function App() {
    const [note, setNote] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: note }),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            setMessage(data.message);
        } catch (error) {
            console.error('Error saving note:', error);
            setMessage('Failed to save the note');
        }
    };

    

    return (
        <div>
            <h1>Meditation Notes</h1>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write your note here..."
                />
                <button type="submit">Save Note</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default App;
