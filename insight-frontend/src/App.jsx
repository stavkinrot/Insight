import React, { useState, useEffect, useRef } from 'react';
import Authentication from "./components/Authentication.jsx";
import Footer from "./components/footer.jsx";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DateCalendar, PickersDay } from '@mui/x-date-pickers';
import { Container, TextField, Button, Typography, Box, List, ListItem, IconButton, Switch, FormControlLabel, Slider, Paper, Badge, AppBar, Toolbar, Menu, MenuItem, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's styling
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import Grid from '@mui/material/Grid2';
import './App.css'; 

// #f0e4db #8D7B68 #A4907C #C8B6A6 #F1DEC9 #f0e4db
// #5865f2 #336aea #0a66c2 #1877f2 #dcf8f7 #f0e4db #C8B6A6
 









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
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [editingNoteTitle, setEditingNoteTitle] = useState('');
  const diaryRef = useRef(null);
  const quillRef = useRef(null);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
      const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
      method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uid: user.uid }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete note');
    }

      setNotesForSelectedDate(notesForSelectedDate.filter(note => note.id !== noteId));
      alert('Note deleted successfully.');
    } catch (error) {
      console.error('Error deleting note:', error);
      alert(error.message || 'An error occurred while deleting the note.');
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const formattedDate = dayjs(selectedDate || new Date()).format('YYYY-MM-DD'); // Normalize date

  // Set default values for title and content during creation or editing
  const finalTitle = editingNoteId ? (editingNoteTitle?.trim() || "NULL") : (title?.trim() || "NULL");
  const finalContent = editingNoteId ? (editingNoteContent?.trim() || "NULL") : (noteContent?.trim() || "NULL");

  try {
    if (editingNoteId) {
      // Edit existing note
      const response = await fetch(`http://localhost:5000/api/notes/${editingNoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: finalTitle, content: finalContent, uid: user.uid }),
      });

      const data = await response.json();
      setMessage(data.message);

      // Update the note in local state
      setNotesForSelectedDate(
        notesForSelectedDate.map(n =>
          n.id === editingNoteId ? { ...n, title: finalTitle, content: finalContent } : n
        )
      );
    } else {
      // Create new note
      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: finalTitle, content: finalContent, date: formattedDate, uid: user.uid }),
      });

      const data = await response.json();
      setMessage(data.message);
      setShowNoteForm(false);

      // Add the new note to the local state
      setNotesForSelectedDate([...notesForSelectedDate, { id: data.id, title: finalTitle, content: finalContent, date: formattedDate }]);
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

    const handleDiscardChanges = () => {
      setEditingNoteId(null);
      setEditingNoteContent('');
      setEditingNoteTitle('');
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
        setUseCountdown(false);
        if (startGong) playGongSound();
      } else {
        setIsRunning(false);
        setShowNoteForm(true);
        if (endGong) playGongSound();
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, remainingTime, useCountdown, countdown, time, startGong, endGong]);

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
    const hasMeditations = meditationDates.some(date => dayjs(date).format('YYYY-MM-DD') === formattedDate);

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

  const truncateEmail = (email) => {
    const [username, domain] = email.split('@');
    return username.length > 10 ? `${username.substring(0, 10)}...` : username;
  };

  if (!user) {
    return <Authentication />;
  }

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static" >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }} align="left">
            I N S I G H T
          </Typography>
          <Button color="inherit" onClick={handleMenuOpen}>
            {isSmallScreen ? truncateEmail(user.email) : user.email}
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

      <Container sx={{ minHeight: '100vh', width: '100', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <Typography variant={isSmallScreen ? 'h4' : 'h2'} align="center" gutterBottom marginTop={4} sx={{ fontWeight: '400' }}>
          I N S I G H T
        </Typography>

        <Grid container spacing={4} alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
              <Typography variant="h6" gutterBottom>
                Meditation Timer
              </Typography>
              <Typography>Set time (minutes)</Typography>
              <Slider
                value={time}
                onChange={(e, newValue) => setTime(newValue)}
                valueLabelDisplay="auto"
                min={0.05}
                max={120}
                sx={{ mb: 2 }}
              />
              <Typography>Set countdown (seconds)</Typography>
              <Slider
                value={countdown}
                onChange={(e, newValue) => setCountdown(newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={60}
                disabled={!useCountdown}
                sx={{ mb: 2 }}
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
              <Box mt={2}>
                <Button variant="contained" color="primary" fullWidth onClick={startTimer} disabled={isRunning} sx={{ mb: 1 }}>
                  Start
                </Button>
                <Button variant="outlined" color="secondary" fullWidth onClick={stopTimer} disabled={!isRunning}>
                  Stop
                </Button>
              </Box>
              <Typography mt={2} align="center">
                {useCountdown && remainingTime > 0 ? `Get yourself Comfy in: ${formatTime(remainingTime)}` : `Remaining Time: ${formatTime(remainingTime)}`}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  value={selectedDate}
                  onChange={handleDateChange}
                  slots={{
                    day: (dayProps) => <ServerDay {...dayProps} />,
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Grid>
        </Grid>

        {remainingTime === 0 && !isRunning && showNoteForm && (
          <Box mt={4} sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
            <Typography variant="h6" gutterBottom>
              Add a Note
            </Typography>
            <TextField
              label="Note Title"
              fullWidth
              margin="normal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <ReactQuill
              theme="snow"
              value={noteContent}
              onChange={setNoteContent}
              placeholder="Write your note here..."
            />
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit}>
              Save Note
            </Button>
          </Box>
        )}

        {message && <Typography variant="body1" color="error" mt={2}>{message}</Typography>}

        {selectedDate && (
          <Paper elevation={3} className="note-paper" sx={{ mt: 4, p: 2, width: '100%', maxWidth: '800px' }}>
            <Box className="note-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IconButton className="arrow-button left-arrow" onClick={handlePreviousDay}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" className="note-heading">Notes for {dayjs(selectedDate).format('DD-MM-YYYY')}</Typography>
              <IconButton className="arrow-button right-arrow" onClick={handleNextDay}>
                <ArrowForwardIcon />
              </IconButton>
            </Box>
            {notesForSelectedDate.length > 0 ? (
              <List>
                {notesForSelectedDate.map((note, index) => (
                  <ListItem key={index} className="note-list-item">
                    <Box className="note-box" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Button
                        variant="text"
                        color="primary"
                        onClick={() => handleViewNote(note)}
                        className="note-title-button"
                      >
                        {note.title}
                      </Button>
                      <Box>
                        <IconButton onClick={() => handleEditNote(note)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteNote(note.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
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
                        <Box
                          display="flex"
                          justifyContent="flex-start"
                          alignItems="center"
                          mt={1}
                          gap={1} // Add spacing between buttons
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            sx={{ flexGrow: 0 }}
                          >
                            Save Changes
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleDiscardChanges}
                            sx={{ flexGrow: 0 }}
                          >
                            Discard Changes
                          </Button>
                        </Box>
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
      <Footer />
    </ThemeProvider>
  );
}

export default App;