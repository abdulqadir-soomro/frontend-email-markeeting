import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import AdminDashboard from '../components/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Define admin emails - in production, this should be stored in Firestore with role-based access
  const ADMIN_EMAILS = [
    'admin@gmail.com',
    'abdulqadir53970@gmail.com',
    // Add more admin emails here
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserProfile(user);
        setIsAuthenticated(true);
        
        // Check if user is admin
        const isUserAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase());
        setIsAdmin(isUserAdmin);
        
        if (!isUserAdmin) {
          console.log('User is not an admin, redirecting...');
          router.push('/');
        }
      } else {
        setUserProfile(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        router.push('/auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('demoUser');
      router.push('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Admin Dashboard | Email Marketing</title>
        </Head>
        <div className="loading-screen">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <>
        <Head>
          <title>Access Denied | Admin Dashboard</title>
        </Head>
        <div className="auth-required">
          <div className="auth-required-content">
            <i className="fas fa-shield-alt"></i>
            <h2>Admin Access Required</h2>
            <p>You don't have permission to access the admin dashboard.</p>
            <button 
              className="btn btn-primary"
              onClick={handleBackToDashboard}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | Email Marketing</title>
      </Head>
      <div className="container admin-container">
        {/* Admin Header */}
        <div className="header admin-header">
          <div className="logo">
            <h1>🛡️ Admin Dashboard</h1>
            <p>System Administration & Management</p>
          </div>
          <div className="user-info">
            <div className="user-details">
              <span>{userProfile?.displayName || userProfile?.email}</span>
              <span className="admin-badge">Administrator</span>
            </div>
            <button className="btn btn-outline" onClick={handleBackToDashboard}>
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
            </button>
            <button className="btn btn-logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>

        {/* Admin Dashboard Component */}
        <AdminDashboard userProfile={userProfile} />
      </div>
    </>
  );
}

