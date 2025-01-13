import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Container, TextField, Button, Typography, Box, List, ListItem, ListItemText, Switch, FormControlLabel, Slider } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css'; // Ensure this file is imported to apply the styles

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
    const [note, setNote] = useState('');
    const [message, setMessage] = useState('');
    const [time, setTime] = useState(0); // Total time in minutes
    const [countdown, setCountdown] = useState(0); // Countdown time in seconds
    const [remainingTime, setRemainingTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [useCountdown, setUseCountdown] = useState(false);
    const [startGong, setStartGong] = useState(false);
    const [endGong, setEndGong] = useState(false);
    const [meditationDates, setMeditationDates] = useState([]);
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

        try {
            const response = await fetch('http://localhost:5000/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: note, date: new Date().toISOString().split('T')[0] }),
            });

            const data = await response.json();
            setMessage(data.message);
            setMeditationDates([...meditationDates, new Date().toISOString().split('T')[0]]);
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
        try {
            const response = await fetch(`http://localhost:5000/api/notes?date=${date.toISOString().split('T')[0]}`);
            const data = await response.json();
            setNotesForSelectedDate(data.notes);
        } catch (error) {
            console.error('Error fetching notes for selected date:', error);
        }
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

                    <Calendar
                        className="calendar"
                        value={selectedDate}
                        onChange={handleDateChange}
                    />
                </Box>

                {!showNoteForm ? (
                    <Box mt={4} textAlign="center">
                        {/* Timer and Sliders are now inline with the Calendar */}
                    </Box>
                ) : (
                    <Box mt={4} component="form" onSubmit={handleSubmit} textAlign="center">
                        <TextField
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Write your insights here..."
                            fullWidth
                            multiline
                            rows={4}
                            margin="normal"
                            className="input"
                        />
                        <Button type="submit" variant="contained" color="primary" className="button">
                            Save Note
                        </Button>
                    </Box>
                )}
                {message && <Typography variant="body1" color="error" mt={2}>{message}</Typography>}

                {selectedDate && (
                    <Box mt={4} textAlign="center">
                        <Typography variant="h4">Notes for {selectedDate.toDateString()}</Typography>
                        {notesForSelectedDate.length > 0 ? (
                            <List>
                                {notesForSelectedDate.map((note, index) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={note.content} />
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