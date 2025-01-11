const express = require('express');
const db = require('./firebase/firestore');
const cors = require('cors');

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type'
}));

app.get('/', (req, res) => {
    res.send('Backend with Firebase is running!');
});

// Example endpoint to save a note
app.post('/api/notes', async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).send({ error: 'Content is required' });
    }

    try {
        // Save to Firestore
        const docRef = await db.collection('notes').add({ content });
        console.log('Note saved with ID:', docRef.id);

        // Respond to the client
        res.status(200).send({ message: 'Note saved successfully!', id: docRef.id });
    } catch (error) {
        console.error('Error saving note:', error);
        res.status(500).send({ error: 'Failed to save note' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});