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

// Endpoint to fetch meditation dates from notes
app.get('/api/meditation-dates', async (req, res) => {
    const { uid } = req.query;
    
    if (!uid) {
        console.log('UID is missing in the request query'); // Log missing UID
        return res.status(400).send({ error: 'UID is required' });
    }

    console.log(`Fetching meditation dates for UID: ${uid}`); // Log the received UID

    try {
        // Query the notes collection to get unique dates for the given UID
        const notesRef = db.collection('notes').where('uid', '==', uid);
        const snapshot = await notesRef.get();
        // Check if any documents are found
        if (snapshot.empty) {
            return res.json({ dates: [] });
        }
        // Extract and log the retrieved dates
        const dates = snapshot.docs.map((doc) => {
            const data = doc.data();
            return data.date; // Assuming `date` is stored in the note data
        });
        // Get unique dates from the list
        const uniqueDates = [...new Set(dates)]; // Remove duplicate dates
        res.json({ dates: uniqueDates });
    } catch (error) {
        console.error('Error fetching meditation dates:', error); // Log the error
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Endpoint to fetch notes
app.get('/api/notes', async (req, res) => {
    const { date, uid } = req.query;
    if (!date || !uid) {
        return res.status(400).send({ error: 'Date and UID are required' });
    }

    try {
        const notesRef = db.collection('notes').where('date', '==', date).where('uid', '==', uid);
        const snapshot = await notesRef.get();
        const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ notes });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Endpoint to save a note
app.post('/api/notes', async (req, res) => {
    const { title, content, date, uid } = req.body;

    if (!title || !content || !date || !uid) {
        return res.status(400).send({ error: 'Title, content, date, and UID are required' });
    }

    try {
        // Save to Firestore
        const docRef = await db.collection('notes').add({ title, content, date, uid });
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
    const { title, content, uid } = req.body;

    if (!title || !content || !uid) {
        return res.status(400).send({ error: 'Title, content, and UID are required' });
    }

    try {
        const noteRef = db.collection('notes').doc(id);
        const note = await noteRef.get();
        if (!note.exists || note.data().uid !== uid) {
            return res.status(404).send({ error: 'Note not found or unauthorized' });
        }

        await noteRef.update({ title, content });
        res.json({ message: 'Note updated successfully' });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Endpoint to delete a note
app.delete('/api/notes/:id', async (req, res) => {
    const { id } = req.params;
    const { uid } = req.body;
    if (!uid) {
        return res.status(400).send({ error: 'UID is required' });
    }

    try {
        const noteRef = db.collection('notes').doc(id);
        const note = await noteRef.get();
        if (!note.exists || note.data().uid !== uid) {
            return res.status(404).send({ error: 'Note not found or unauthorized' });
        }

        await noteRef.delete();
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});