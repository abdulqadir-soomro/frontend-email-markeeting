import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import TemplateManager from '../components/TemplateManager';
import EmailScheduler from '../components/EmailScheduler';

// Main Dashboard Component
const EmailMarketingDashboard = () => {
  const router = useRouter();
  
  // Authentication state
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Define admin emails - must match admin page
  const ADMIN_EMAILS = [
    'admin@gmail.com',
    'abdulqadir53970@gmail.com',
    // Add more admin emails here
  ];

  // Email campaign state
  const [emailList, setEmailList] = useState([]);
  const [emailFrom, setEmailFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [emailContent, setEmailContent] = useState({
    subject: '',
    htmlContent: ''
  });

  // Campaign state
  const [isSending, setIsSending] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [realTimeEmails, setRealTimeEmails] = useState([]);
  const [emailHistory, setEmailHistory] = useState([]);
  const [emailDetails, setEmailDetails] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState('compose');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [expandedCampaigns, setExpandedCampaigns] = useState(new Set());

  // Error handling
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserProfile(user);
        setIsAuthenticated(true);
        
        // Check if user is admin
        const isUserAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase());
        setIsAdmin(isUserAdmin);
        
        loadUserData(user);
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

  const loadUserData = async (user) => {
    try {
      // Load demo user data from localStorage
      const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
      if (demoUser.email) {
        setEmailFrom(demoUser.email);
      }

      // Load email history from database
      await loadEmailHistoryFromDatabase(user.uid);
    } catch (error) {
      console.error('Error loading user data:', error);
      console.error('Error loading user data');
    }
  };

  const loadEmailHistoryFromDatabase = async (userId) => {
    try {
      if (!db || !userId) {
        console.log('Database not initialized or no user ID');
        return;
      }

      const campaignsRef = collection(db, 'campaigns');
      const q = query(
        campaignsRef,
        where('userId', '==', userId),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      const history = [];

      // Load campaigns and their email records
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const campaignId = doc.id;
        
        // Fetch email records for this campaign
        const emailRecordsRef = collection(db, 'emailRecords');
        const emailQuery = query(
          emailRecordsRef,
          where('campaignId', '==', campaignId),
          where('userId', '==', userId)
        );
        
        const emailSnapshot = await getDocs(emailQuery);
        const emailRecords = [];
        
        emailSnapshot.forEach((emailDoc) => {
          const emailData = emailDoc.data();
          emailRecords.push({
            id: emailDoc.id,
            email: emailData.email,
            name: emailData.name,
            status: emailData.status,
            error: emailData.error,
            timestamp: emailData.timestamp?.toDate?.()?.toISOString() || emailData.createdAt?.toDate?.()?.toISOString()
          });
        });

        history.push({
          id: campaignId,
          ...data,
          timestamp: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          startTime: data.startTime?.toDate?.()?.toISOString() || data.startTime,
          endTime: data.endTime?.toDate?.()?.toISOString() || data.endTime,
          emailRecords: emailRecords
        });
      }

      history.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB - dateA;
      });

      setEmailHistory(history.slice(0, 50));
      console.log(`Loaded ${history.length} campaigns from database`);
      
      // Debug logging for email records
      history.forEach((campaign, index) => {
        console.log(`Campaign ${index + 1}:`, {
          id: campaign.id,
          subject: campaign.subject,
          emailRecordsCount: campaign.emailRecords ? campaign.emailRecords.length : 0,
          emailRecords: campaign.emailRecords
        });
      });
    } catch (error) {
      console.error('Error loading email history from database:', error);
      console.error('Error loading email history');
    }
  };

  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Please upload a CSV file');
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const text = await file.text();
      const parsed = parseCSV(text);
      setEmailList(parsed);
      console.log(`Successfully loaded ${parsed.length} email addresses`);
    } catch (error) {
      console.error('Error uploading file:', error);
      console.error(`Error uploading file: ${error.message}`);
    }
  };

  const parseCSV = (csvText) => {
    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      const emails = [];
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Find email and name columns
      const emailIndex = headers.findIndex(h => h.includes('email'));
      const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('first'));

      if (emailIndex === -1) {
        throw new Error('No email column found in CSV');
      }

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const email = values[emailIndex];
        const name = nameIndex !== -1 ? values[nameIndex] : '';

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
          emails.push({ email, name: name || email.split('@')[0] });
        }
      }

      if (emails.length === 0) {
        throw new Error('No valid email addresses found in CSV');
      }

      return emails;
    } catch (error) {
      throw new Error(`Error parsing CSV: ${error.message}`);
    }
  };

  const handleTemplateSelect = (template) => {
    try {
      console.log('Template selected:', template);
      setSelectedTemplate(template);
      setEmailContent({
        subject: template.subject,
        htmlContent: template.htmlContent
      });
      setSubject(template.subject);
      console.log(`Template "${template.name}" selected`);
    } catch (error) {
      console.error('Error selecting template:', error);
      console.error('Error selecting template');
    }
  };

  const handleEmailContentChange = (field, value) => {
    try {
      setEmailContent(prev => ({
        ...prev,
        [field]: value
      }));
      
      if (field === 'subject') {
        setSubject(value);
      }
    } catch (error) {
      console.error('Error updating email content:', error);
      console.error('Error updating email content');
    }
  };

  const handlePreviewEmail = () => {
    try {
      if (!emailContent.subject || !emailContent.subject.trim()) {
        alert('Please enter an email subject before previewing');
        return;
      }
      if (!emailContent.htmlContent || !emailContent.htmlContent.trim()) {
        alert('Please enter email content before previewing');
        return;
      }
      setShowPreview(true);
    } catch (error) {
      console.error('Error previewing email:', error);
      alert('Error opening preview. Please try again.');
    }
  };

  const handleSaveEmailContent = () => {
    try {
      if (!emailContent.subject || !emailContent.htmlContent) {
        console.error('Please enter both subject and content');
        return;
      }
      console.log('Email content saved successfully');
    } catch (error) {
      console.error('Error saving email content:', error);
      console.error('Error saving email content');
    }
  };

  const generatePersonalizedContent = (htmlContent, name) => {
    try {
      return htmlContent.replace(/\[Name\]/g, name || 'Valued Customer');
    } catch (error) {
      console.error('Error generating personalized content:', error);
      return htmlContent;
    }
  };

  const sendEmailsWithProgress = async () => {
    const results = { sent: 0, failed: 0, errors: [], emailRecords: [] };
    
    for (let i = 0; i < emailList.length; i++) {
      const email = emailList[i];
      const progress = Math.round(((i + 1) / emailList.length) * 100);
      
      try {
        const personalizedContent = generatePersonalizedContent(
          emailContent.htmlContent, 
          email.name
        );

        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email.email,
            from: emailFrom,
            subject: emailContent.subject,
            htmlContent: personalizedContent
          })
        });

        const result = await response.json();
        
        const emailRecord = {
          email: email.email,
          name: email.name,
          status: result.success ? 'sent' : 'failed',
          timestamp: new Date().toISOString(),
          error: result.success ? null : result.error
        };
        
        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push({ email: email.email, error: result.error });
        }
        
        results.emailRecords.push(emailRecord);
        setRealTimeEmails(prev => [...prev, emailRecord]);
      } catch (error) {
        results.failed++;
        results.errors.push({ email: email.email, error: error.message });
        
        const emailRecord = {
          email: email.email,
          name: email.name,
          status: 'failed',
          timestamp: new Date().toISOString(),
          error: error.message
        };
        
        results.emailRecords.push(emailRecord);
        setRealTimeEmails(prev => [...prev, emailRecord]);
      }

      setCurrentProgress(progress);
      
      // Add delay between emails
      if (i < emailList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  };

  const saveCampaignToDatabase = async (campaignData, emailRecordsToSave) => {
    try {
      if (!db || !userProfile?.uid) {
        throw new Error('Database not initialized or user not found');
      }

      if (!campaignData || typeof campaignData !== 'object') {
        throw new Error('Invalid campaign data');
      }

      const requiredFields = ['subject', 'sentCount', 'failedCount', 'startTime', 'endTime'];
      for (const field of requiredFields) {
        if (campaignData[field] === undefined || campaignData[field] === null) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const campaignRecord = {
        userId: userProfile.uid,
        subject: campaignData.subject,
        from: campaignData.from,
        sentCount: campaignData.sentCount,
        failedCount: campaignData.failedCount,
        totalEmails: campaignData.totalEmails,
        startTime: campaignData.startTime,
        endTime: campaignData.endTime,
        duration: campaignData.duration,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timed out')), 15000)
      );

      const addDocPromise = addDoc(collection(db, 'campaigns'), campaignRecord);
      const docRef = await Promise.race([addDocPromise, timeoutPromise]);

      console.log('Campaign saved with ID:', docRef.id);
      console.log('Email records to save:', emailRecordsToSave?.length || 0);

      // Save individual email records
      if (emailRecordsToSave && emailRecordsToSave.length > 0) {
        const emailRecords = emailRecordsToSave.map(email => ({
          campaignId: docRef.id,
          userId: userProfile.uid,
          email: email.email,
          name: email.name,
          status: email.status,
          error: email.error,
          timestamp: serverTimestamp(),
          createdAt: serverTimestamp()
        }));

        console.log('Saving', emailRecords.length, 'email records...');

        for (const record of emailRecords) {
          try {
            await addDoc(collection(db, 'emailRecords'), record);
          } catch (error) {
            console.error('Error saving email record:', error);
          }
        }
        
        console.log('Email records saved successfully');
      } else {
        console.warn('No email records to save!');
      }

      return docRef.id;
    } catch (error) {
      console.error('Error saving campaign to database:', error);
      throw error;
    }
  };

  const startSending = async () => {
    try {
      // Validation
      if (!emailFrom || !emailFrom.includes('@')) {
        throw new Error('Please enter a valid sender email address');
      }
      if (!subject || subject.trim().length === 0) {
        throw new Error('Please enter an email subject');
      }
      if (!emailList || emailList.length === 0) {
        throw new Error('Please upload an email list first');
      }
      if (emailList.length > 1000) {
        throw new Error('Email list cannot exceed 1000 recipients');
      }

      // Validate individual email data
      for (const email of emailList) {
        if (!email.email || !email.email.includes('@')) {
          throw new Error(`Invalid email address: ${email.email}`);
        }
      }

      setIsSending(true);
      setCurrentProgress(0);
      setRealTimeEmails([]);
      setErrorMessage('');

      const startTime = new Date();
      setEmailDetails({
        startTime,
        totalEmails: emailList.length,
        sentCount: 0,
        failedCount: 0
      });

      console.log('Starting email campaign...');

      const result = await sendEmailsWithProgress();
      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / 1000);

      console.log('Campaign completed!');

      // Save to database
      try {
        const campaignData = {
          subject: emailContent.subject,
          from: emailFrom,
          sentCount: result.sent,
          failedCount: result.failed,
          totalEmails: emailList.length,
          startTime: startTime,
          endTime: endTime,
          duration: duration
        };

        console.log('Saving campaign with', result.emailRecords?.length || 0, 'email records');
        const campaignId = await saveCampaignToDatabase(campaignData, result.emailRecords);
        console.log('Campaign saved to database with ID:', campaignId);
        
        await loadEmailHistoryFromDatabase(userProfile.uid);
        console.log(`Campaign completed! Sent: ${result.sent}, Failed: ${result.failed}. Data saved to database.`);
      } catch (error) {
        console.error('Failed to save campaign to database:', error);
        console.error(`Campaign completed but failed to save to database: ${error.message}`);
      }

      if (result.sent > 0) {
        console.log(`Email campaign completed! Sent: ${result.sent}, Failed: ${result.failed}`);
      } else {
        console.error('Email campaign failed - no emails were sent successfully.');
      }

    } catch (error) {
      console.error('Error in startSending:', error);
      console.error(`Error starting campaign: ${error.message}`);
    } finally {
      setIsSending(false);
      setCurrentProgress(0);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('demoUser');
      router.push('/auth');
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      console.error('Error logging out');
    }
  };

  const clearEmailHistoryFromDatabase = () => {
    try {
      setEmailHistory([]);
      console.log('Email history cleared from display. Database records remain intact.');
    } catch (error) {
      console.error('Error clearing history:', error);
      console.error('Error clearing history');
    }
  };

  const toggleCampaignExpansion = (campaignId) => {
    setExpandedCampaigns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId);
      } else {
        newSet.add(campaignId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <div className="auth-required-content">
          <i className="fas fa-lock"></i>
          <h2>Authentication Required</h2>
          <p>Please log in to access the email marketing dashboard.</p>
          <button 
            className="btn btn-primary"
            onClick={() => router.push('/auth')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div className="logo">
          <h1>📧 Email Marketing Dashboard</h1>
          <p>Powered by INFLUITIVE ZONE</p>
        </div>
        <div className="user-info">
          <div className="user-details">
            <span>{userProfile?.displayName || userProfile?.email}</span>
            <span>Email Marketing Pro</span>
          </div>
          {isAdmin && (
            <button className="btn btn-outline" onClick={() => router.push('/admin')}>
              <i className="fas fa-shield-alt"></i>
              Admin
            </button>
          )}
          <button className="btn btn-register" onClick={() => router.push('/register')}>
            <i className="fas fa-user-plus"></i>
            Register
          </button>
          <button className="btn btn-logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'compose' ? 'active' : ''}`}
          onClick={() => setActiveTab('compose')}
        >
          <i className="fas fa-edit"></i>
          Compose
        </button>
        <button 
          className={`nav-tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <i className="fas fa-file-alt"></i>
          Templates
        </button>
        <button 
          className={`nav-tab ${activeTab === 'scheduler' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduler')}
        >
          <i className="fas fa-clock"></i>
          Scheduler
        </button>
        <button 
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <i className="fas fa-chart-line"></i>
          Analytics
        </button>
        <button 
          className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <i className="fas fa-history"></i>
          History
        </button>
      </div>

      {/* Error and Success Messages */}
      {errorMessage && (
        <div className="message error">
          <i className="fas fa-exclamation-circle"></i>
          {errorMessage}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'compose' && (
        <div className="main-content">
          {/* Email Configuration */}
          <section>
            <h2>
              <i className="fas fa-cog"></i>
              Email Configuration
            </h2>
            <div className="config-form">
              <div className="form-group">
                <label>Sender Email Address *</label>
                <input
                  type="email"
                  value={emailFrom}
                  onChange={(e) => setEmailFrom(e.target.value)}
                  placeholder="your-email@domain.com"
                  required
                />
              </div>
            </div>
          </section>

          {/* Email List Upload */}
          <section>
            <h2>
              <i className="fas fa-upload"></i>
              Email List Upload
            </h2>
            <div className="upload-area" onClick={() => document.getElementById('csvFile').click()}>
              <i className="fas fa-cloud-upload-alt"></i>
              <p>Click to upload CSV file or drag and drop</p>
              <p>CSV should contain 'email' and 'name' columns</p>
              <button className="upload-btn">Choose File</button>
              <input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
            {emailList.length > 0 && (
              <div className="file-info">
                <i className="fas fa-check-circle"></i>
                <div>
                  <strong>{emailList.length} email addresses loaded</strong>
                  <p>Ready to send emails</p>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => setEmailList([])}
                >
                  Remove
                </button>
              </div>
            )}
          </section>

          {/* Email Content */}
          <section>
            <h2>
              <i className="fas fa-envelope"></i>
              Email Content
            </h2>
            <div className="email-content-form">
              <div className="form-group">
                <label>Email Subject *</label>
                <input
                  type="text"
                  value={emailContent.subject}
                  onChange={(e) => handleEmailContentChange('subject', e.target.value)}
                  placeholder="Enter email subject"
                  maxLength="200"
                  required
                />
              </div>
              <div className="form-group">
                <label>HTML Content *</label>
                <textarea
                  value={emailContent.htmlContent}
                  onChange={(e) => handleEmailContentChange('htmlContent', e.target.value)}
                  placeholder="Enter your HTML email content here. Use [Name] for personalization."
                  rows="10"
                  required
                />
              </div>
              <div className="preview-controls">
                <button 
                  className="btn btn-secondary"
                  onClick={handlePreviewEmail}
                >
                  <i className="fas fa-eye"></i>
                  Preview Email
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={handleSaveEmailContent}
                >
                  <i className="fas fa-save"></i>
                  Save Content
                </button>
              </div>
            </div>
          </section>

          {/* Send Emails */}
          <section>
            <h2>
              <i className="fas fa-paper-plane"></i>
              Send Emails
            </h2>
            <div className="send-controls">
              <button 
                className="btn btn-primary btn-lg"
                onClick={startSending}
                disabled={isSending || emailList.length === 0}
              >
                {isSending ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Sending Emails...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Send {emailList.length} Emails
                  </>
                )}
              </button>
            </div>

            {/* Progress Display */}
            {isSending && (
              <div className="progress-section">
                <div className="progress-stats">
                  <div className="stat">
                    <span className="stat-label">Progress</span>
                    <span className="stat-value">{currentProgress}%</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Sent</span>
                    <span className="stat-value">{realTimeEmails.filter(e => e.status === 'sent').length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Failed</span>
                    <span className="stat-value">{realTimeEmails.filter(e => e.status === 'failed').length}</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${currentProgress}%` }}></div>
                </div>
                <div className="progress-log">
                  <h3>Real-time Status</h3>
                  <div className="log-content">
                    {realTimeEmails.map((email, index) => (
                      <div key={index} className={`log-entry ${email.status}`}>
                        {email.status === 'sent' ? '✅' : '❌'} {email.email} - {email.name}
                        {email.error && ` (${email.error})`}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === 'templates' && (
        <TemplateManager 
          userProfile={userProfile}
          onTemplateSelect={handleTemplateSelect}
        />
      )}

      {activeTab === 'scheduler' && (
        <EmailScheduler 
          userProfile={userProfile}
          emailList={emailList}
          emailContent={emailContent}
          onScheduleComplete={() => console.log('Email scheduled successfully')}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsDashboard userProfile={userProfile} />
      )}

      {activeTab === 'history' && (
        <div className="email-history-section">
          <div className="history-header">
            <h2>
              <i className="fas fa-history"></i>
              Email Campaign History
            </h2>
            <div className="history-stats">
              <div className="stat-item">
                <span className="stat-number">{emailHistory.length}</span>
                <span className="stat-label">Total Campaigns</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {emailHistory.reduce((sum, campaign) => sum + (campaign.sentCount || 0), 0)}
                </span>
                <span className="stat-label">Emails Sent</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {emailHistory.reduce((sum, campaign) => sum + (campaign.failedCount || 0), 0)}
                </span>
                <span className="stat-label">Emails Failed</span>
              </div>
            </div>
          </div>

          {emailHistory.length === 0 ? (
            <div className="no-history">
              <i className="fas fa-inbox"></i>
              <h3>No Email History</h3>
              <p>Your email campaigns will appear here once you start sending emails.</p>
            </div>
          ) : (
            <div className="history-list">
              {emailHistory.map((campaign) => (
                <div key={campaign.id} className="history-item">
                  <div className="campaign-header">
                    <div className="campaign-info">
                      <h3>{campaign.subject}</h3>
                      <div className="campaign-from">From: {campaign.from}</div>
                      <div className="campaign-time">
                        {new Date(campaign.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="campaign-stats">
                      <div className="stat">
                        <span className="stat-value">{campaign.sentCount || 0}</span>
                        <span className="stat-label">Sent</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{campaign.failedCount || 0}</span>
                        <span className="stat-label">Failed</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{campaign.duration || 0}s</span>
                        <span className="stat-label">Duration</span>
                      </div>
                    </div>
                  </div>
                  <div className="campaign-details">
                    <div className="detail-row">
                      <span className="detail-label">Total Emails:</span>
                      <span className="detail-value">{campaign.totalEmails}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Success Rate:</span>
                      <span className="detail-value">
                        {campaign.totalEmails > 0 
                          ? Math.round(((campaign.sentCount || 0) / campaign.totalEmails) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Email Details Toggle */}
                  <div className="email-details-section">
                    <button 
                      className="toggle-emails-btn"
                      onClick={() => toggleCampaignExpansion(campaign.id)}
                    >
                      <i className={`fas fa-chevron-${expandedCampaigns.has(campaign.id) ? 'up' : 'down'}`}></i>
                      {expandedCampaigns.has(campaign.id) ? 'Hide' : 'View Full History'} 
                      {campaign.emailRecords && campaign.emailRecords.length > 0 
                        ? ` (${campaign.emailRecords.length} emails)` 
                        : ''
                      }
                    </button>
                      
                      {expandedCampaigns.has(campaign.id) && (
                        <div className="email-list">
                          {campaign.emailRecords && campaign.emailRecords.length > 0 ? (
                            <>
                              <div className="email-list-header">
                                <span>Email Address</span>
                                <span>Name</span>
                                <span>Status</span>
                                <span>Time</span>
                              </div>
                              {campaign.emailRecords.map((emailRecord, index) => (
                                <div key={emailRecord.id || index} className={`email-item ${emailRecord.status}`}>
                                  <span className="email-address">{emailRecord.email}</span>
                                  <span className="email-name">{emailRecord.name || 'N/A'}</span>
                                  <span className={`email-status ${emailRecord.status}`}>
                                    {emailRecord.status === 'sent' ? '✅ Sent' : '❌ Failed'}
                                  </span>
                                  <span className="email-time">
                                    {emailRecord.timestamp ? new Date(emailRecord.timestamp).toLocaleTimeString() : 'N/A'}
                                  </span>
                                  {emailRecord.error && (
                                    <div className="email-error">
                                      Error: {emailRecord.error}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </>
                          ) : (
                            <div className="no-email-records">
                              <i className="fas fa-info-circle"></i>
                              <p>No detailed email records available for this campaign.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                </div>
              ))}
            </div>
          )}

          <div className="history-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => loadEmailHistoryFromDatabase(userProfile.uid)}
            >
              <i className="fas fa-sync"></i>
              Refresh History
            </button>
            <button 
              className="btn btn-danger" 
              onClick={() => {
                if (confirm('Are you sure you want to clear all email history? This action cannot be undone.')) {
                  clearEmailHistoryFromDatabase();
                }
              }}
            >
              <i className="fas fa-trash"></i>
              Clear All History
            </button>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {showPreview && (
        <div className="modal show" onClick={() => setShowPreview(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Email Preview</h3>
              <button className="close-btn" onClick={() => setShowPreview(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <iframe
                srcDoc={`
                  <html>
                    <head>
                      <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                        .preview-subject { background: #667eea; color: white; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
                      </style>
                    </head>
                    <body>
                      <div class="preview-subject">Subject: ${emailContent.subject}</div>
                      ${generatePersonalizedContent(emailContent.htmlContent, 'John Doe')}
                    </body>
                  </html>
                `}
                style={{ width: '100%', height: '500px', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailMarketingDashboard;
