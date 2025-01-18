// src/components/Authentication.js
import React, { useState, useEffect } from "react";
import { Button, TextField, Typography, Container, Grid, Box } from "@mui/material";
import { signInWithGoogle, signUpWithEmail, signInWithEmail, logOut } from "../firebase/firebaseAuth";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Authentication = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null); // State to store the authenticated user

  // Monitor authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set the user state when auth state changes
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Typography variant="h4" gutterBottom>
          {user ? `Welcome, ${user.displayName || user.email}` : "Authentication"}
        </Typography>

        {!user ? (
          <form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => signUpWithEmail(email, password)}
                >
                  Sign Up
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => signInWithEmail(email, password)}
                >
                  Sign In
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={signInWithGoogle}
              >
                Sign in with Google
              </Button>
            </Box>
          </form>
        ) : (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button variant="outlined" color="primary" onClick={logOut}>
              Sign Out
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Authentication;