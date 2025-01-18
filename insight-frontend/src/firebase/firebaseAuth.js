import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from "./firebaseConfig";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google Sign-In Success:", result.user);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error.message);
    throw error;
  }
};

// Google Sign-Up
export const signUpWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google Sign-Up Success:", result.user);
    return result.user;
  } catch (error) {
    console.error("Google Sign-Up Error:", error.message);
    throw error;
  }
};

// Sign Up with Email and Password
export const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Sign-Up Success:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Sign-Up Error:", error.message);
    throw error;
  }
};

// Sign In with Email and Password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Sign-In Success:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Sign-In Error:", error.message);
    throw error;
  }
};

// Sign Out
export const logOut = async () => {
  try {
    await signOut(auth);
    console.log("Sign-Out Success");
  } catch (error) {
    console.error("Sign-Out Error:", error.message);
    throw error;
  }
};