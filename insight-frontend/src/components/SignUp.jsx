import React, { useState } from "react";
import { Button, TextField, Typography, Container, Box, Paper, Grid, Divider, ThemeProvider } from "@mui/material";
import { signUpWithEmail, signInWithGoogle } from "../firebase/firebaseAuth";
import { theme } from '../App.jsx'; // Import the theme from App.jsx

const SignUp = ({ email, password, onSignInClick }) => {
  const [newEmail, setNewEmail] = useState(email);
  const [newPassword, setNewPassword] = useState(password);

  const handleSignUp = () => {
    signUpWithEmail(newEmail, newPassword);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h4" gutterBottom>
              Sign Up
            </Typography>
            <form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    sx={{ mb: 2 }} // Add margin bottom
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    variant="outlined"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={{ mb: 2 }} // Add margin bottom
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSignUp}
                    sx={{ mt: 2 }}
                  >
                    Sign Up
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }}>or</Divider>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={signInWithGoogle}
                    sx={{
                      backgroundColor: '#4285F4',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#357ae8',
                      },
                      textTransform: 'none',
                    }}
                  >
                    Sign up with Google
                  </Button>
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="body2" align="center">
                    Already have an account?{" "}
                    <Button
                      variant="text"
                      color="primary"
                      onClick={onSignInClick}
                    >
                      Sign In
                    </Button>
                  </Typography>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default SignUp;