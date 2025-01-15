const express = require('express');
const db = require('./firebase/firestore');
const cors = require('cors');

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.get('/', (req, res) => {
    res.send('Backend with Firebase is running!');
});

// Endpoint to save a note
app.post('/api/notes', async (req, res) => {
    const { title, content, date } = req.body;

    if (!title || !content || !date) {
        return res.status(400).send({ error: 'Title, content, and date are required' });
    }

    try {
        // Save to Firestore
        const docRef = await db.collection('notes').add({ title, content, date });
        console.log('Note saved with ID:', docRef.id);

        // Respond to the client
        res.status(200).send({ message: 'Note saved successfully!', id: docRef.id });
    } catch (error) {
        console.error('Error saving note:', error);
        res.status(500).send({ error: 'Failed to save note' });
    }
});

// Endpoint to update a note
app.put('/api/notes/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).send({ error: 'Title and content are required' });
    }

    try {
        // Update the note in Firestore
        await db.collection('notes').doc(id).update({ title, content });
        console.log('Note updated with ID:', id);

        // Respond to the client
        res.status(200).send({ message: 'Note updated successfully!' });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).send({ error: 'Failed to update note' });
    }
});

// Endpoint to delete a note
app.delete('/api/notes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Delete the note from Firestore
        await db.collection('notes').doc(id).delete();
        console.log('Note deleted with ID:', id);

        // Respond to the client
        res.status(200).send({ message: 'Note deleted successfully!' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).send({ error: 'Failed to delete note' });
    }
});

// Endpoint to fetch meditation dates
app.get('/api/meditation-dates', async (req, res) => {
    try {
        const snapshot = await db.collection('notes').get();
        const dates = snapshot.docs.map(doc => doc.data().date);
        res.status(200).send({ dates });
    } catch (error) {
        console.error('Error fetching meditation dates:', error);
        res.status(500).send({ error: 'Failed to fetch meditation dates' });
    }
});

// Endpoint to fetch notes for a specific date
app.get('/api/notes', async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).send({ error: 'Date is required' });
    }

    try {
        const snapshot = await db.collection('notes').where('date', '==', date).get();
        const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched notes for date:', date, notes);
        res.status(200).send({ notes });
    } catch (error) {
        console.error('Error fetching notes for date:', error);
        res.status(500).send({ error: 'Failed to fetch notes for date' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});