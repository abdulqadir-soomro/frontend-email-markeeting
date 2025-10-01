import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export default function Auth() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const email = e.target.loginEmail.value.trim();
    const password = e.target.loginPassword.value;

    // Enhanced validation
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Password length validation
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Add timeout wrapper for Firebase operations
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login request timed out. Please try again.')), 30000); // 30 second timeout
      });

      // Firebase authentication with timeout
      const userCredential = await Promise.race([
        signInWithEmailAndPassword(auth, email, password),
        timeoutPromise
      ]);
      const user = userCredential.user;

      // Get user data from Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      let userData = null;
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || doc.data().displayName,
          ...doc.data()
        };
      } else {
        // If no user data found in Firestore, create basic user object
        userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split('@')[0]
        };
      }

      // Store user in localStorage for immediate access
      localStorage.setItem('demoUser', JSON.stringify(userData));
      
      setSuccessMessage('Login successful! Redirecting...');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        setErrorMessage('No account found with this email address. Please check your email or sign up for a new account.');
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password. Please try again or reset your password.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Invalid email address format. Please enter a valid email.');
      } else if (error.code === 'auth/user-disabled') {
        setErrorMessage('This account has been disabled. Please contact support for assistance.');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage('Too many failed login attempts. Please wait 15 minutes before trying again.');
      } else if (error.code === 'auth/network-request-failed') {
        setErrorMessage('Network connection failed. Please check your internet connection and try again.');
      } else if (error.code === 'auth/invalid-credential') {
        setErrorMessage('Invalid credentials. Please check your email and password.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setErrorMessage('Email/password login is not enabled. Please contact support.');
      } else if (error.code === 'auth/requires-recent-login') {
        setErrorMessage('Please log out and log back in to complete this action.');
      } else if (error.code === 'auth/timeout') {
        setErrorMessage('Request timed out. Please try again.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already registered. Please use login instead.');
      } else if (error.code === 'auth/credential-already-in-use') {
        setErrorMessage('This credential is already associated with a different user account.');
      } else if (error.code === 'auth/invalid-verification-code') {
        setErrorMessage('Invalid verification code. Please try again.');
      } else if (error.code === 'auth/invalid-verification-id') {
        setErrorMessage('Invalid verification ID. Please try again.');
      } else if (error.code === 'auth/missing-email') {
        setErrorMessage('Email address is required.');
      } else if (error.code === 'auth/missing-password') {
        setErrorMessage('Password is required.');
      } else if (error.code === 'auth/quota-exceeded') {
        setErrorMessage('Quota exceeded. Please try again later.');
      } else if (error.code === 'auth/captcha-check-failed') {
        setErrorMessage('Captcha verification failed. Please try again.');
      } else if (error.code === 'auth/invalid-phone-number') {
        setErrorMessage('Invalid phone number format.');
      } else if (error.code === 'auth/missing-phone-number') {
        setErrorMessage('Phone number is required.');
      } else if (error.code === 'auth/invalid-credential') {
        setErrorMessage('Invalid credentials. Please check your email and password.');
      } else if (error.message && error.message.includes('Firebase')) {
        setErrorMessage('Firebase service error. Please try again in a few moments.');
      } else if (error.message && error.message.includes('network')) {
        setErrorMessage('Network error. Please check your internet connection.');
      } else if (error.message && error.message.includes('timeout')) {
        setErrorMessage('Request timeout. Please try again.');
      } else {
        setErrorMessage(`Login failed: ${error.message || 'An unexpected error occurred. Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const email = e.target.signupEmail.value.trim();
    const password = e.target.signupPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    // Enhanced validation
    if (!email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Password validation
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (password.length > 128) {
      setErrorMessage('Password must be less than 128 characters');
      setLoading(false);
      return;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasLowerCase || !hasNumbers) {
      setErrorMessage('Password must contain at least one lowercase letter and one number');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '123456', '123456789', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      setErrorMessage('Please choose a stronger password. This password is too common.');
      setLoading(false);
      return;
    }

    try {
      // Add timeout wrapper for Firebase operations
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Signup request timed out. Please try again.')), 30000); // 30 second timeout
      });

      // Firebase authentication - create user with timeout
      const userCredential = await Promise.race([
        createUserWithEmailAndPassword(auth, email, password),
        timeoutPromise
      ]);
      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, {
        displayName: email.split('@')[0]
      });

      // Create user data for Firestore
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || email.split('@')[0],
        firstName: email.split('@')[0],
        lastName: '',
        gmailFrom: email,
        company: '',
        phone: '',
        region: 'us-east-1',
        emailsPerDay: 10,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Save user data to Firestore
      await addDoc(collection(db, 'users'), userData);

      // Store user in localStorage for immediate access
      localStorage.setItem('demoUser', JSON.stringify({
        ...userData,
        createdAt: new Date().toISOString()
      }));
      
      setSuccessMessage('Account created successfully! Redirecting...');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists. Please use login instead or try a different email.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Invalid email address format. Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please choose a stronger password with at least 6 characters, including letters and numbers.');
      } else if (error.code === 'auth/network-request-failed') {
        setErrorMessage('Network connection failed. Please check your internet connection and try again.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setErrorMessage('Email/password accounts are not enabled. Please contact support for assistance.');
      } else if (error.code === 'auth/invalid-credential') {
        setErrorMessage('Invalid credentials provided. Please check your information.');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage('Too many signup attempts. Please wait 15 minutes before trying again.');
      } else if (error.code === 'auth/user-disabled') {
        setErrorMessage('Account creation is currently disabled. Please contact support.');
      } else if (error.code === 'auth/timeout') {
        setErrorMessage('Request timed out. Please try again.');
      } else if (error.code === 'auth/credential-already-in-use') {
        setErrorMessage('This credential is already associated with a different user account.');
      } else if (error.code === 'auth/invalid-verification-code') {
        setErrorMessage('Invalid verification code. Please try again.');
      } else if (error.code === 'auth/invalid-verification-id') {
        setErrorMessage('Invalid verification ID. Please try again.');
      } else if (error.code === 'auth/missing-email') {
        setErrorMessage('Email address is required for account creation.');
      } else if (error.code === 'auth/missing-password') {
        setErrorMessage('Password is required for account creation.');
      } else if (error.code === 'auth/quota-exceeded') {
        setErrorMessage('Account creation quota exceeded. Please try again later.');
      } else if (error.code === 'auth/captcha-check-failed') {
        setErrorMessage('Captcha verification failed. Please try again.');
      } else if (error.code === 'auth/invalid-phone-number') {
        setErrorMessage('Invalid phone number format.');
      } else if (error.code === 'auth/missing-phone-number') {
        setErrorMessage('Phone number is required.');
      } else if (error.code === 'auth/requires-recent-login') {
        setErrorMessage('Please log out and log back in to complete this action.');
      } else if (error.message && error.message.includes('Firebase')) {
        setErrorMessage('Firebase service error. Please try again in a few moments.');
      } else if (error.message && error.message.includes('network')) {
        setErrorMessage('Network error. Please check your internet connection.');
      } else if (error.message && error.message.includes('timeout')) {
        setErrorMessage('Request timeout. Please try again.');
      } else if (error.message && error.message.includes('Firestore')) {
        setErrorMessage('Database error. Please try again.');
      } else {
        setErrorMessage(`Signup failed: ${error.message || 'An unexpected error occurred. Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Add timeout wrapper for Google sign-in
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Google sign-in request timed out. Please try again.')), 30000); // 30 second timeout
      });

      const provider = new GoogleAuthProvider();
      const result = await Promise.race([
        signInWithPopup(auth, provider),
        timeoutPromise
      ]);
      const user = result.user;

      // Check if user exists in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);
      
      let userData = null;
      if (!querySnapshot.empty) {
        // User exists, get their data
        const doc = querySnapshot.docs[0];
        userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...doc.data()
        };
      } else {
        // New user, create basic profile
        userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          gmailFrom: user.email,
          company: '',
          phone: '',
          region: 'us-east-1',
          emailsPerDay: 10,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        // Save new user to Firestore
        await addDoc(collection(db, 'users'), userData);
      }

      // Store user in localStorage for immediate access
      localStorage.setItem('demoUser', JSON.stringify({
        ...userData,
        createdAt: new Date().toISOString()
      }));
      
      setSuccessMessage('Login successful! Redirecting...');
      
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setErrorMessage('Popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/network-request-failed') {
        setErrorMessage('Network connection failed. Please check your internet connection and try again.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setErrorMessage('Google sign-in is not enabled. Please contact support for assistance.');
      } else if (error.code === 'auth/invalid-credential') {
        setErrorMessage('Invalid Google credentials. Please try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setErrorMessage('An account already exists with this email using a different sign-in method. Please use email/password login instead.');
      } else if (error.code === 'auth/credential-already-in-use') {
        setErrorMessage('This Google account is already associated with another user.');
      } else if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already registered. Please use login instead.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Invalid email address from Google account.');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage('Too many Google sign-in attempts. Please wait 15 minutes before trying again.');
      } else if (error.code === 'auth/user-disabled') {
        setErrorMessage('This Google account has been disabled. Please contact support.');
      } else if (error.code === 'auth/timeout') {
        setErrorMessage('Google sign-in request timed out. Please try again.');
      } else if (error.code === 'auth/requires-recent-login') {
        setErrorMessage('Please log out and log back in to complete this action.');
      } else if (error.code === 'auth/quota-exceeded') {
        setErrorMessage('Google sign-in quota exceeded. Please try again later.');
      } else if (error.code === 'auth/captcha-check-failed') {
        setErrorMessage('Captcha verification failed. Please try again.');
      } else if (error.code === 'auth/invalid-verification-code') {
        setErrorMessage('Invalid verification code from Google. Please try again.');
      } else if (error.code === 'auth/invalid-verification-id') {
        setErrorMessage('Invalid verification ID from Google. Please try again.');
      } else if (error.code === 'auth/missing-email') {
        setErrorMessage('Email address is required from Google account.');
      } else if (error.message && error.message.includes('Firebase')) {
        setErrorMessage('Firebase service error. Please try again in a few moments.');
      } else if (error.message && error.message.includes('network')) {
        setErrorMessage('Network error. Please check your internet connection.');
      } else if (error.message && error.message.includes('timeout')) {
        setErrorMessage('Request timeout. Please try again.');
      } else if (error.message && error.message.includes('Firestore')) {
        setErrorMessage('Database error. Please try again.');
      } else if (error.message && error.message.includes('Google')) {
        setErrorMessage('Google service error. Please try again.');
      } else {
        setErrorMessage(`Google sign-in failed: ${error.message || 'An unexpected error occurred. Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login | Email Marketing Dashboard</title>
      </Head>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>📧 Email Marketing</h1>
            <p>Sign in to access your dashboard</p>
          </div>
          
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} 
              onClick={() => switchTab('login')}
            >
              Login
            </button>
            <button 
              className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`} 
              onClick={() => switchTab('signup')}
            >
              Sign Up
            </button>
          </div>
          
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="loginEmail">Email Address</label>
                <input type="email" id="loginEmail" placeholder="Enter your email" required />
              </div>
              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <input type="password" id="loginPassword" placeholder="Enter your password" required />
              </div>
              <button type="submit" className="auth-btn btn-primary-auth" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}
          
          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label htmlFor="signupEmail">Email Address</label>
                <input type="email" id="signupEmail" placeholder="Enter your email" required />
              </div>
              <div className="form-group">
                <label htmlFor="signupPassword">Password</label>
                <input type="password" id="signupPassword" placeholder="Create a password" required minLength="6" />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" placeholder="Confirm your password" required />
              </div>
              <button type="submit" className="auth-btn btn-primary-auth" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
          
          <div className="divider">
            <span>OR</span>
          </div>
          
          <button 
            className="auth-btn google-btn" 
            disabled={loading}
            onClick={handleGoogleSignIn}
          >
            <i className="fab fa-google"></i>
            Continue with Google
          </button>
        </div>
      </div>
    </>
  );
}