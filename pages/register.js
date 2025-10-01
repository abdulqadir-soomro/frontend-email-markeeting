import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const formData = new FormData(e.target);
    const userData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      gmailFrom: formData.get('gmailFrom'),
      company: formData.get('company'),
      phone: formData.get('phone'),
      region: formData.get('region'),
      emailsPerDay: formData.get('emailsPerDay')
    };

    // Validation
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.gmailFrom) {
      setErrorMessage('Please fill in all required fields (First Name, Last Name, Email Address, and Gmail for Sending)');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setErrorMessage('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!emailRegex.test(userData.gmailFrom)) {
      setErrorMessage('Please enter a valid Gmail address for sending emails');
      setLoading(false);
      return;
    }

    // Check if Gmail is actually a Gmail address
    if (!userData.gmailFrom.toLowerCase().includes('@gmail.com')) {
      setErrorMessage('Please enter a valid Gmail address (must contain @gmail.com)');
      setLoading(false);
      return;
    }

    // Name validation
    if (userData.firstName.trim().length < 2) {
      setErrorMessage('First name must be at least 2 characters long');
      setLoading(false);
      return;
    }

    if (userData.lastName.trim().length < 2) {
      setErrorMessage('Last name must be at least 2 characters long');
      setLoading(false);
      return;
    }

    // Phone validation (if provided)
    if (userData.phone && userData.phone.trim().length > 0) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(userData.phone.replace(/[\s\-\(\)]/g, ''))) {
        setErrorMessage('Please enter a valid phone number');
        setLoading(false);
        return;
      }
    }

    // Emails per day validation
    const emailsPerDay = parseInt(userData.emailsPerDay);
    if (isNaN(emailsPerDay) || emailsPerDay < 1 || emailsPerDay > 100) {
      setErrorMessage('Emails per day must be a number between 1 and 100');
      setLoading(false);
      return;
    }

    try {
      // Create user data for Firebase
      const firebaseUserData = {
        email: userData.email,
        displayName: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        gmailFrom: userData.gmailFrom,
        company: userData.company || '',
        phone: userData.phone || '',
        emailsPerDay: parseInt(userData.emailsPerDay) || 10,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add timeout wrapper for Firebase operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout. Please try again.')), 10000); // 10 second timeout
      });

      // Save user data to Firebase Firestore with timeout
      const docRef = await Promise.race([
        addDoc(collection(db, 'users'), firebaseUserData),
        timeoutPromise
      ]);
      
      // Also store in localStorage for immediate access (demo mode)
      const localUser = {
        uid: docRef.id,
        ...firebaseUserData,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('demoUser', JSON.stringify(localUser));
      
      setSuccessMessage('Registration successful! Your information has been saved. Redirecting to dashboard...');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Error saving user data:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'permission-denied') {
        setErrorMessage('Permission denied. Please check your Firebase security rules.');
      } else if (error.code === 'unavailable') {
        setErrorMessage('Service temporarily unavailable. Please try again in a few moments.');
      } else if (error.code === 'unauthenticated') {
        setErrorMessage('Authentication required. Please refresh the page and try again.');
      } else if (error.code === 'invalid-argument') {
        setErrorMessage('Invalid data provided. Please check all fields and try again.');
      } else if (error.code === 'already-exists') {
        setErrorMessage('A user with this email already exists. Please use a different email.');
      } else if (error.code === 'resource-exhausted') {
        setErrorMessage('Service quota exceeded. Please try again later.');
      } else if (error.code === 'failed-precondition') {
        setErrorMessage('Precondition failed. Please ensure all required fields are filled.');
      } else if (error.code === 'aborted') {
        setErrorMessage('Operation was aborted. Please try again.');
      } else if (error.code === 'out-of-range') {
        setErrorMessage('Value out of range. Please check your input values.');
      } else if (error.code === 'unimplemented') {
        setErrorMessage('This operation is not implemented. Please contact support.');
      } else if (error.code === 'internal') {
        setErrorMessage('Internal server error. Please try again later.');
      } else if (error.code === 'data-loss') {
        setErrorMessage('Data loss occurred. Please try again.');
      } else if (error.code === 'deadline-exceeded') {
        setErrorMessage('Request timeout. Please check your connection and try again.');
      } else if (error.message && error.message.includes('network')) {
        setErrorMessage('Network error. Please check your internet connection and try again.');
      } else if (error.message && error.message.includes('Firebase')) {
        setErrorMessage('Firebase connection error. Please try again.');
      } else {
        setErrorMessage(`Registration failed: ${error.message || 'Unknown error occurred. Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register | Email Marketing Dashboard</title>
      </Head>
      <div className="auth-container">
        <div className="auth-card register-card">
          <div className="auth-header">
            <h1>📧 Create Account</h1>
            <p>Join our email marketing platform</p>
          </div>
          
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <form onSubmit={handleRegister} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  placeholder="Enter your first name" 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  placeholder="Enter your last name" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Enter your email address" 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="gmailFrom">Gmail for Sending Emails *</label>
              <input 
                type="email" 
                id="gmailFrom" 
                name="gmailFrom" 
                placeholder="your-gmail@gmail.com" 
                required 
              />
              <small>This Gmail will be used to send emails from your campaigns</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input 
                  type="text" 
                  id="company" 
                  name="company" 
                  placeholder="Your company name" 
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  placeholder="Your phone number" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emailsPerDay">Emails Per Day</label>
                <input 
                  type="number" 
                  id="emailsPerDay" 
                  name="emailsPerDay" 
                  min="1" 
                  max="100" 
                  defaultValue="10" 
                />
                <small>Maximum emails to send per day</small>
              </div>
            </div>

            <button type="submit" className="auth-btn btn-primary-auth" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
          
         
        </div>
      </div>
    </>
  );
}
