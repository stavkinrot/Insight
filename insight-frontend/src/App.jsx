import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Container, TextField, Button, Typography, Box, List, ListItem, ListItemText, Switch, FormControlLabel, Slider } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's styling
import './App.css'; // Ensure this file is imported to apply the styles
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const theme = createTheme({
typography: {
        fontFamily: 'Quicksand, Arial, sans-serif',
      },
  palette: {
    primary: {
      main: '#8D7B68',
    },
    secondary: {
      main: '#A4907C',
    },
    accent: {
      main: '#C8B6A6',
    },
    background: {
      default: '#F1DEC9',
    },
  },
});

function App() {
    const [noteContent, setNoteContent] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [time, setTime] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [useCountdown, setUseCountdown] = useState(false);
    const [startGong, setStartGong] = useState(false);
    const [endGong, setEndGong] = useState(false);
    const [meditationDates, setMeditationDates] = useState([]);
    const [expandedNoteId, setExpandedNoteId] = useState(null);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [notesForSelectedDate, setNotesForSelectedDate] = useState([]);


    useEffect(() => {
        // Fetch meditation dates from Firestore
        const fetchMeditationDates = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/meditation-dates');
                const data = await response.json();
                setMeditationDates(data.dates);
            } catch (error) {
                console.error('Error fetching meditation dates:', error);
            }
        };

        fetchMeditationDates();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedDate = dayjs(selectedDate || new Date()).format('YYYY-MM-DD'); // Normalize date
        try {
            if (editingNoteId) {
                const response = await fetch(`http://localhost:5000/api/notes/${editingNoteId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title, content: noteContent }),
                });
    
                const data = await response.json();
                setMessage(data.message);
    
                // Update the note in local state
                setNotesForSelectedDate(notesForSelectedDate.map(n => n.id === editingNoteId ? { ...n, title, content: noteContent } : n));
            } else {
                //Create new note
                const response = await fetch('http://localhost:5000/api/notes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title, content: noteContent, date: formattedDate }),
                });
    
            const data = await response.json();
            setMessage(data.message);

            // Add the new note to local state
            setNotesForSelectedDate([...notesForSelectedDate, { id: data.id, title, content: noteContent }]);
            }

            // Reset the form
            setTitle('');
            setNoteContent('');
            setEditingNoteId(null);
            setShowNoteForm(false);

        } catch (error) {
            console.error('Error saving note:', error);
            setMessage('Failed to save the note');
        }
    };

    const startTimer = () => {
        setIsRunning(true);
        if (useCountdown && countdown > 0) {
            setRemainingTime(countdown);
        } else {
            setRemainingTime(time * 60); // Convert minutes to seconds
        }
        setShowNoteForm(false);
    };

    const stopTimer = () => {
        setIsRunning(false);
    };

    useEffect(() => {
        let timer;
        if (isRunning && remainingTime > 0) {
            timer = setInterval(() => {
                setRemainingTime((prevTime) => prevTime - 1);
            }, 1000);
        } else if (remainingTime === 0 && isRunning) {
            if (useCountdown && countdown > 0) {
                setRemainingTime(time * 60); // Start meditation timer after countdown
                setCountdown(0);
                if (startGong) playGongSound();
            } else {
                setIsRunning(false);
                setShowNoteForm(true);
                if (endGong) playGongSound();
            }
        }
        return () => clearInterval(timer);
    }, [isRunning, remainingTime]);

    const playGongSound = () => {
        const audio = new Audio('/gong.mp3');
        audio.play();
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const handleDateChange = async (date) => {
        setSelectedDate(date);
        
        const formattedDate = dayjs(date).format('YYYY-MM-DD'); // Normalize date
        try {
            const response = await fetch(`http://localhost:5000/api/notes?date=${formattedDate}`);
            const data = await response.json();
            setNotesForSelectedDate(data.notes);
        } catch (error) {
            console.error('Error fetching notes for selected date:', error);
        }
    };

    const renderDiary = () => {
        const groupedNotes = meditationDates.reduce((acc, date) => {
            acc[date] = notesForSelectedDate.filter(note => note.date === date);
            return acc;
        }, {});
    
        return Object.keys(groupedNotes).map(date => (
            <Accordion key={date}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{date}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List>
                        {groupedNotes[date].map(note => (
                            <ListItem key={note.id}>
                                <ListItemText
                                    primary={note.title}
                                    secondary={
                                        <Box>
                                            <Button
                                                variant="text"
                                                onClick={() => handleEdit(note)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="text"
                                                color="secondary"
                                                onClick={() => handleDelete(note.id)}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </AccordionDetails>
            </Accordion>
        ));
    };

    return (
        <ThemeProvider theme={theme}>
            <Container className="app-container">
                <Typography variant="h2" className="heading">
                    Meditation App
                </Typography>

                <Box className="inline-container">
                    <Box className="sliders-container">
                        <Typography variant="h5" gutterBottom>
                            Timer
                        </Typography>
                        <Typography gutterBottom>Set time in minutes</Typography>
                        <Slider
                            value={time}
                            onChange={(e, newValue) => setTime(newValue)}
                            valueLabelDisplay="auto"
                            min={0.05}
                            max={120}
                        />
                        <Typography gutterBottom>Set countdown in seconds</Typography>
                        <Slider
                            value={countdown}
                            onChange={(e, newValue) => setCountdown(newValue)}
                            valueLabelDisplay="auto"
                            min={0}
                            max={60}
                            disabled={!useCountdown}
                        />
                        <FormControlLabel
                            control={<Switch checked={useCountdown} onChange={(e) => setUseCountdown(e.target.checked)} />}
                            label="Use Countdown"
                        />
                        <FormControlLabel
                            control={<Switch checked={startGong} onChange={(e) => setStartGong(e.target.checked)} disabled={!useCountdown} />}
                            label="Start Gong"
                        />
                        <FormControlLabel
                            control={<Switch checked={endGong} onChange={(e) => setEndGong(e.target.checked)} />}
                            label="End Gong"
                        />
                        <Box className="button-container">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={startTimer}
                                className="button"
                                disabled={isRunning}
                            >
                                Start Timer
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={stopTimer}
                                className="button"
                                disabled={!isRunning}
                            >
                                Stop Timer
                            </Button>
                        </Box>
                        <Typography mt={2}>Remaining Time: {formatTime(remainingTime)}</Typography>
                    </Box>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateCalendar
                            className="calendar"
                            value={selectedDate}
                            onChange={handleDateChange}
                        />
                        </LocalizationProvider>
                </Box>

                <Box>
                <Typography variant="h4">Diary</Typography>
                {renderDiary()}
            </Box>

                {!showNoteForm ? (
                    <Box mt={4} textAlign="center">
                        {/* Timer and Sliders are now inline with the Calendar */}
                    </Box>
                ) : (
                    <Box mt={4} component="form" onSubmit={handleSubmit} textAlign="center">
                        <TextField
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Note Title"
                            fullWidth
                            margin="normal"
                        />
                        <ReactQuill
                            theme="snow"
                            value={noteContent}
                            onChange={setNoteContent}
                            placeholder="Write your note here..."
                        />
                        <Button type="submit" variant="contained" color="primary" className="button">
                            Save Note
                        </Button>
                    </Box>
                )}
                {message && <Typography variant="body1" color="error" mt={2}>{message}</Typography>}

                {selectedDate && (
                    <Box mt={4} textAlign="center">
                        <Typography variant="h4">Notes for {dayjs(selectedDate).format('DD-MM-YYYY')}</Typography>
                        {notesForSelectedDate.length > 0 ? (
                            <List>
                                {notesForSelectedDate.map((note, index) => (
                                    <ListItem key={index}>
                                        <ListItemText
                                         primary={note.title}
                                         secondary={
                                            <Button
                                                variant="text"
                                                color="primary"
                                                onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)}
                                                >
                                            View Note
                                            </Button>
                                            }
                                          />
                                    {expandedNoteId === note.id && (
                                        <Box mt={2}>
                                            <Typography
                                                component="div"
                                                dangerouslySetInnerHTML={{ __html: note.content }}
                                            />
                                        </Box>
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body1">No notes for this date.</Typography>
                    )}
                    </Box>
                    )}
            </Container>
        </ThemeProvider>
    );
}

export default App;