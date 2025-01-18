import React, { useState, useEffect, useRef } from 'react';
import Authentication from "./components/Authentication.jsx";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DateCalendar, PickersDay } from '@mui/x-date-pickers';
import { Container, TextField, Button, Typography, Box, List, ListItem, IconButton, Switch, FormControlLabel, Slider, Paper, Badge, AppBar, Toolbar, Menu, MenuItem } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's styling
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css'; 

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
  const [selectedDate, setSelectedDate] = useState(dayjs()); // Set initial date to current date
  const [notesForSelectedDate, setNotesForSelectedDate] = useState([]);
  const [notes, setNotes] = useState({});
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [editingNoteTitle, setEditingNoteTitle] = useState('');
  const diaryRef = useRef(null);
  const quillRef = useRef(null);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMeditationDates(user.uid);
      fetchNotesForDate(selectedDate, user.uid);
    }
  }, [user, selectedDate]);

  const fetchMeditationDates = async (uid) => {
    try {
      const response = await fetch(`http://localhost:5000/api/meditation-dates?uid=${uid}`);
      const data = await response.json();
      console.log('Fetched meditation dates:', data.dates);
      setMeditationDates(data.dates);
    } catch (error) {
      console.error('Error fetching meditation dates:', error);
    }
  };

  const fetchNotesForDate = async (date, uid) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD'); // Normalize date
    try {
      const response = await fetch(`http://localhost:5000/api/notes?date=${formattedDate}&uid=${uid}`);
      const data = await response.json();
      setNotesForSelectedDate(data.notes);
    } catch (error) {
      console.error('Error fetching notes for selected date:', error);
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    if (user) {
      fetchNotesForDate(date, user.uid);
    }
  };

  const handleViewNote = (note) => {
    setExpandedNoteId(expandedNoteId === note.id ? null : note.id);
  };

  const handleEditNote = (note) => {
    setEditingNoteTitle(note.title);
    setEditingNoteContent(note.content);
    setEditingNoteId(note.id);
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await fetch(`http://localhost:5000/api/notes/${noteId}`, { method: 'DELETE' });
      setNotesForSelectedDate(notesForSelectedDate.filter(note => note.id !== noteId));
      alert('Note deleted successfully.');
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

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
          body: JSON.stringify({ title: editingNoteTitle, content: editingNoteContent, uid: user.uid }),
        });

        const data = await response.json();
        setMessage(data.message);

        // Update the note in local state
        setNotesForSelectedDate(notesForSelectedDate.map(n => n.id === editingNoteId ? { ...n, title: editingNoteTitle, content: editingNoteContent } : n));
      } else {
        // Create new note
        const response = await fetch('http://localhost:5000/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, content: noteContent, date: formattedDate, uid: user.uid }),
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
      setEditingNoteContent('');
      setEditingNoteTitle('');
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

  const scrollToDiary = () => {
    if (diaryRef.current) {
      diaryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNextDay = () => {
    const nextDay = dayjs(selectedDate).add(1, 'day');
    handleDateChange(nextDay);
  };

  const handlePreviousDay = () => {
    const previousDay = dayjs(selectedDate).subtract(1, 'day');
    handleDateChange(previousDay);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setUser(null);
      handleMenuClose();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  function ServerDay(props) {
    const { day, outsideCurrentMonth, ...other } = props;
    const formattedDate = day.format('YYYY-MM-DD');
    const hasMeditations = meditationDates.some(date => dayjs(date).isSame(day, 'day'));
  
    console.log(`Date: ${formattedDate}, Has Meditations: ${hasMeditations}`);
  
    return (
      <Badge
        key={formattedDate}
        overlap="circular"
        color="secondary"
        variant="dot"
        invisible={!hasMeditations} // Show dot only if there are meditations
      >
        <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
      </Badge>
    );
  }

  if (!user) {

    return <Authentication />;

  }

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Meditation App
          </Typography>
          <Button color="inherit" onClick={handleMenuOpen}>
            {user.email}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
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
              slots={{
                day: (dayProps) => <ServerDay {...dayProps} />
              }}
            />
          </LocalizationProvider>
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
              ref={quillRef}
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
          <Paper elevation={3} style={{ backgroundColor: 'white', padding: '20px', marginTop: '20px', position: 'relative' }}>
            <IconButton
              style={{ position: 'absolute', left: '30%', top: '20%', transform: 'translateY(-50%)' }}
              onClick={handlePreviousDay}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" style={{ fontSize: '2rem' }}>Notes for {dayjs(selectedDate).format('DD-MM-YYYY')}</Typography>
            <IconButton
              style={{ position: 'absolute', right: '30%', top: '20%', transform: 'translateY(-50%)' }}
              onClick={handleNextDay}
            >
              <ArrowForwardIcon />
            </IconButton>
            {notesForSelectedDate.length > 0 ? (
              <List>
                {notesForSelectedDate.map((note, index) => (
                  <ListItem key={index} style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Button
                        variant="text"
                        color="primary"
                        onClick={() => handleViewNote(note)}
                        style={{ flexGrow: 1, textAlign: 'left' }}
                      >
                        {note.title}
                      </Button>
                      <IconButton onClick={() => handleEditNote(note)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteNote(note.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    {expandedNoteId === note.id && (
                      <Box mt={2} width="100%">
                        <Typography variant="h6">{note.title}</Typography>
                        <ReactQuill
                          value={note.content}
                          readOnly={true}
                          theme="bubble"
                        />
                      </Box>
                    )}
                    {editingNoteId === note.id && (
                      <Box mt={2} width="100%">
                        <TextField
                          value={editingNoteTitle}
                          onChange={(e) => setEditingNoteTitle(e.target.value)}
                          placeholder="Edit Note Title"
                          fullWidth
                          margin="normal"
                        />
                        <ReactQuill
                          theme="snow"
                          value={editingNoteContent}
                          onChange={setEditingNoteContent}
                          placeholder="Edit your note here..."
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSubmit}
                          style={{ marginTop: '10px' }}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    )}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1">No notes for this date.</Typography>
            )}
          </Paper>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;