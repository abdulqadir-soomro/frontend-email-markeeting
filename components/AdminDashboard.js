import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  deleteDoc, 
  doc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const AdminDashboard = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCampaigns: 0,
    totalEmailsSent: 0,
    totalEmailsFailed: 0,
    successRate: 0,
    activeUsers: 0,
    todaysCampaigns: 0,
    todaysEmails: 0
  });
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [emailRecords, setEmailRecords] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSystemStats(),
        loadUsers(),
        loadCampaigns(),
        loadScheduledEmails(),
        loadRecentActivity(),
        loadEmailRecords(),
        loadUserActivity()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemStats = async () => {
    try {
      // Load users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Load campaigns
      const campaignsSnapshot = await getDocs(collection(db, 'campaigns'));
      let totalEmailsSent = 0;
      let totalEmailsFailed = 0;
      let todaysCampaigns = 0;
      let todaysEmails = 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      campaignsSnapshot.forEach((doc) => {
        const data = doc.data();
        totalEmailsSent += data.sentCount || 0;
        totalEmailsFailed += data.failedCount || 0;

        const campaignDate = data.createdAt?.toDate();
        if (campaignDate && campaignDate >= today) {
          todaysCampaigns++;
          todaysEmails += (data.sentCount || 0) + (data.failedCount || 0);
        }
      });

      const totalEmails = totalEmailsSent + totalEmailsFailed;
      const successRate = totalEmails > 0 
        ? Math.round((totalEmailsSent / totalEmails) * 100) 
        : 0;

      // Calculate active users (users with campaigns in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeUserIds = new Set();
      campaignsSnapshot.forEach((doc) => {
        const data = doc.data();
        const campaignDate = data.createdAt?.toDate();
        if (campaignDate && campaignDate >= thirtyDaysAgo) {
          activeUserIds.add(data.userId);
        }
      });

      setStats({
        totalUsers,
        totalCampaigns: campaignsSnapshot.size,
        totalEmailsSent,
        totalEmailsFailed,
        successRate,
        activeUsers: activeUserIds.size,
        todaysCampaigns,
        todaysEmails
      });
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        
        // Count campaigns for this user
        const campaignsQuery = query(
          collection(db, 'campaigns'),
          where('userId', '==', userData.uid || userDoc.id)
        );
        const campaignsSnapshot = await getDocs(campaignsQuery);
        
        let totalSent = 0;
        let totalFailed = 0;
        campaignsSnapshot.forEach((doc) => {
          const campaign = doc.data();
          totalSent += campaign.sentCount || 0;
          totalFailed += campaign.failedCount || 0;
        });

        usersList.push({
          id: userDoc.id,
          ...userData,
          campaignCount: campaignsSnapshot.size,
          totalEmailsSent: totalSent,
          totalEmailsFailed: totalFailed,
          createdAt: userData.createdAt?.toDate?.() || new Date(),
          lastActive: userData.updatedAt?.toDate?.() || userData.createdAt?.toDate?.() || new Date()
        });
      }

      // Sort by creation date (newest first)
      usersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      const campaignsQuery = query(
        collection(db, 'campaigns'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const campaignsSnapshot = await getDocs(campaignsQuery);
      const campaignsList = [];

      for (const campaignDoc of campaignsSnapshot.docs) {
        const campaignData = campaignDoc.data();
        
        // Get user info
        const usersQuery = query(
          collection(db, 'users'),
          where('uid', '==', campaignData.userId)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const userEmail = usersSnapshot.empty ? 'Unknown' : usersSnapshot.docs[0].data().email;

        campaignsList.push({
          id: campaignDoc.id,
          ...campaignData,
          userEmail,
          createdAt: campaignData.createdAt?.toDate?.() || new Date()
        });
      }

      setCampaigns(campaignsList);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const loadScheduledEmails = async () => {
    try {
      const scheduledQuery = query(
        collection(db, 'scheduledEmails'),
        orderBy('scheduledDate', 'asc'),
        limit(50)
      );
      const scheduledSnapshot = await getDocs(scheduledQuery);
      const scheduledList = [];

      for (const scheduledDoc of scheduledSnapshot.docs) {
        const scheduledData = scheduledDoc.data();
        
        // Get user info
        const usersQuery = query(
          collection(db, 'users'),
          where('uid', '==', scheduledData.userId)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const userEmail = usersSnapshot.empty ? 'Unknown' : usersSnapshot.docs[0].data().email;

        scheduledList.push({
          id: scheduledDoc.id,
          ...scheduledData,
          userEmail,
          scheduledDate: scheduledData.scheduledDate?.toDate?.() || new Date()
        });
      }

      setScheduledEmails(scheduledList);
    } catch (error) {
      console.error('Error loading scheduled emails:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const campaignsQuery = query(
        collection(db, 'campaigns'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const campaignsSnapshot = await getDocs(campaignsQuery);
      const activities = [];

      for (const campaignDoc of campaignsSnapshot.docs) {
        const campaignData = campaignDoc.data();
        
        // Get user info
        const usersQuery = query(
          collection(db, 'users'),
          where('uid', '==', campaignData.userId)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const userName = usersSnapshot.empty 
          ? 'Unknown User' 
          : usersSnapshot.docs[0].data().displayName || usersSnapshot.docs[0].data().email;

        activities.push({
          id: campaignDoc.id,
          type: 'campaign',
          userName,
          action: 'sent campaign',
          details: `"${campaignData.subject}"`,
          emailCount: (campaignData.sentCount || 0) + (campaignData.failedCount || 0),
          timestamp: campaignData.createdAt?.toDate?.() || new Date()
        });
      }

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const loadEmailRecords = async () => {
    try {
      const emailRecordsQuery = query(
        collection(db, 'emailRecords'),
        orderBy('timestamp', 'desc'),
        limit(500)
      );
      const emailRecordsSnapshot = await getDocs(emailRecordsQuery);
      const records = [];

      for (const emailDoc of emailRecordsSnapshot.docs) {
        const emailData = emailDoc.data();
        
        // Get user info
        const usersQuery = query(
          collection(db, 'users'),
          where('uid', '==', emailData.userId)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const userEmail = usersSnapshot.empty ? 'Unknown' : usersSnapshot.docs[0].data().email;
        const userName = usersSnapshot.empty 
          ? 'Unknown User' 
          : usersSnapshot.docs[0].data().displayName || usersSnapshot.docs[0].data().email;

        // Get campaign info if available
        let campaignSubject = 'N/A';
        let fromEmail = 'N/A';
        if (emailData.campaignId) {
          try {
            const campaignDoc = await getDocs(
              query(collection(db, 'campaigns'), where('__name__', '==', emailData.campaignId))
            );
            if (!campaignDoc.empty) {
              const campaignData = campaignDoc.docs[0].data();
              campaignSubject = campaignData.subject || 'N/A';
              fromEmail = campaignData.from || 'N/A';
            }
          } catch (error) {
            console.error('Error fetching campaign:', error);
          }
        }

        records.push({
          id: emailDoc.id,
          ...emailData,
          userEmail,
          userName,
          campaignSubject,
          fromEmail,
          timestamp: emailData.timestamp?.toDate?.() || emailData.createdAt?.toDate?.() || new Date()
        });
      }

      setEmailRecords(records);
    } catch (error) {
      console.error('Error loading email records:', error);
    }
  };

  const loadUserActivity = async () => {
    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const activityData = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userId = userData.uid || userDoc.id;

        // Get user's campaigns
        const campaignsQuery = query(
          collection(db, 'campaigns'),
          where('userId', '==', userId)
        );
        const campaignsSnapshot = await getDocs(campaignsQuery);
        
        let totalCampaigns = campaignsSnapshot.size;
        let totalEmailsSent = 0;
        let totalEmailsFailed = 0;
        let lastCampaignDate = null;
        let recentCampaigns = [];

        campaignsSnapshot.forEach((doc) => {
          const campaign = doc.data();
          totalEmailsSent += campaign.sentCount || 0;
          totalEmailsFailed += campaign.failedCount || 0;
          
          const campaignDate = campaign.createdAt?.toDate?.() || new Date();
          if (!lastCampaignDate || campaignDate > lastCampaignDate) {
            lastCampaignDate = campaignDate;
          }

          recentCampaigns.push({
            id: doc.id,
            subject: campaign.subject,
            sentCount: campaign.sentCount || 0,
            failedCount: campaign.failedCount || 0,
            createdAt: campaignDate
          });
        });

        // Sort recent campaigns by date (newest first)
        recentCampaigns.sort((a, b) => b.createdAt - a.createdAt);

        // Get user's scheduled emails
        const scheduledQuery = query(
          collection(db, 'scheduledEmails'),
          where('userId', '==', userId)
        );
        const scheduledSnapshot = await getDocs(scheduledQuery);
        let scheduledCount = scheduledSnapshot.size;

        // Calculate activity score (for sorting)
        const daysSinceLastActivity = lastCampaignDate 
          ? Math.floor((new Date() - lastCampaignDate) / (1000 * 60 * 60 * 24))
          : 999;

        activityData.push({
          userId,
          email: userData.email,
          displayName: userData.displayName || userData.firstName || 'Unknown',
          company: userData.company || 'N/A',
          totalCampaigns,
          totalEmailsSent,
          totalEmailsFailed,
          scheduledCount,
          lastActivity: lastCampaignDate,
          daysSinceLastActivity,
          successRate: totalEmailsSent + totalEmailsFailed > 0 
            ? Math.round((totalEmailsSent / (totalEmailsSent + totalEmailsFailed)) * 100)
            : 0,
          recentCampaigns: recentCampaigns.slice(0, 5),
          createdAt: userData.createdAt?.toDate?.() || new Date()
        });
      }

      // Sort by last activity (most recent first)
      activityData.sort((a, b) => {
        if (!a.lastActivity) return 1;
        if (!b.lastActivity) return -1;
        return b.lastActivity - a.lastActivity;
      });

      setUserActivity(activityData);
    } catch (error) {
      console.error('Error loading user activity:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userId));
      await loadUsers();
      await loadSystemStats();
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + error.message);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'campaigns', campaignId));
      await loadCampaigns();
      await loadSystemStats();
      alert('Campaign deleted successfully');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Error deleting campaign: ' + error.message);
    }
  };

  const handleDeleteScheduledEmail = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this scheduled email?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'scheduledEmails', scheduleId));
      await loadScheduledEmails();
      alert('Scheduled email deleted successfully');
    } catch (error) {
      console.error('Error deleting scheduled email:', error);
      alert('Error deleting scheduled email: ' + error.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = searchTerm === '' || 
      campaign.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'success' && campaign.sentCount > 0) ||
      (filterStatus === 'failed' && campaign.failedCount > 0);
    
    return matchesSearch && matchesFilter;
  });

  const filteredEmailRecords = emailRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.campaignSubject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.fromEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'sent' && record.status === 'sent') ||
      (filterStatus === 'failed' && record.status === 'failed');
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Navigation Tabs */}
      <div className="nav-tabs admin-tabs">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-chart-pie"></i>
          Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="fas fa-users"></i>
          Users
        </button>
        <button 
          className={`nav-tab ${activeTab === 'campaigns' ? 'active' : ''}`}
          onClick={() => setActiveTab('campaigns')}
        >
          <i className="fas fa-paper-plane"></i>
          Campaigns
        </button>
        <button 
          className={`nav-tab ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          <i className="fas fa-clock"></i>
          Scheduled
        </button>
        <button 
          className={`nav-tab ${activeTab === 'emails' ? 'active' : ''}`}
          onClick={() => setActiveTab('emails')}
        >
          <i className="fas fa-envelope-open-text"></i>
          All Emails
        </button>
        <button 
          className={`nav-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <i className="fas fa-stream"></i>
          Activity
        </button>
        <button 
          className={`nav-tab ${activeTab === 'userActivity' ? 'active' : ''}`}
          onClick={() => setActiveTab('userActivity')}
        >
          <i className="fas fa-user-clock"></i>
          User Activity
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="admin-overview">
          {/* System Statistics */}
          <section className="admin-section">
            <h2>
              <i className="fas fa-chart-line"></i>
              System Statistics
            </h2>
            <div className="metrics-grid">
              <div className="metric-card primary">
                <div className="metric-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{stats.totalUsers}</div>
                  <div className="metric-label">Total Users</div>
                </div>
              </div>

              <div className="metric-card success">
                <div className="metric-icon">
                  <i className="fas fa-user-check"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{stats.activeUsers}</div>
                  <div className="metric-label">Active Users (30d)</div>
                </div>
              </div>

              <div className="metric-card info">
                <div className="metric-icon">
                  <i className="fas fa-paper-plane"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{stats.totalCampaigns}</div>
                  <div className="metric-label">Total Campaigns</div>
                </div>
              </div>

              <div className="metric-card warning">
                <div className="metric-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{stats.totalEmailsSent.toLocaleString()}</div>
                  <div className="metric-label">Emails Sent</div>
                </div>
              </div>

              <div className="metric-card error">
                <div className="metric-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{stats.totalEmailsFailed.toLocaleString()}</div>
                  <div className="metric-label">Emails Failed</div>
                </div>
              </div>

              <div className="metric-card success">
                <div className="metric-icon">
                  <i className="fas fa-percentage"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{stats.successRate}%</div>
                  <div className="metric-label">Success Rate</div>
                </div>
              </div>

              <div className="metric-card info">
                <div className="metric-icon">
                  <i className="fas fa-calendar-day"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{stats.todaysCampaigns}</div>
                  <div className="metric-label">Today's Campaigns</div>
                </div>
              </div>

              <div className="metric-card primary">
                <div className="metric-icon">
                  <i className="fas fa-mail-bulk"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{stats.todaysEmails}</div>
                  <div className="metric-label">Today's Emails</div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="admin-section">
            <h2>
              <i className="fas fa-bolt"></i>
              Quick Actions
            </h2>
            <div className="quick-actions">
              <button className="btn btn-primary" onClick={() => loadAdminData()}>
                <i className="fas fa-sync"></i>
                Refresh Data
              </button>
              <button className="btn btn-outline" onClick={() => setActiveTab('users')}>
                <i className="fas fa-users"></i>
                View Users
              </button>
              <button className="btn btn-outline" onClick={() => setActiveTab('campaigns')}>
                <i className="fas fa-paper-plane"></i>
                View Campaigns
              </button>
              <button className="btn btn-outline" onClick={() => setActiveTab('activity')}>
                <i className="fas fa-stream"></i>
                View Activity
              </button>
            </div>
          </section>

          {/* Recent Activity Preview */}
          <section className="admin-section">
            <h2>
              <i className="fas fa-history"></i>
              Recent Activity
            </h2>
            <div className="activity-preview">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <i className="fas fa-paper-plane"></i>
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <strong>{activity.userName}</strong> {activity.action} {activity.details}
                    </div>
                    <div className="activity-meta">
                      {activity.emailCount} emails • {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-users">
          <div className="admin-section-header">
            <h2>
              <i className="fas fa-users"></i>
              User Management
            </h2>
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="users-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Campaigns</th>
                  <th>Emails Sent</th>
                  <th>Created</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="user-name">{user.displayName || 'N/A'}</div>
                          <div className="user-id">{user.firstName} {user.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.company || 'N/A'}</td>
                    <td>{user.campaignCount}</td>
                    <td>{user.totalEmailsSent}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(user.lastActive).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="admin-campaigns">
          <div className="admin-section-header">
            <h2>
              <i className="fas fa-paper-plane"></i>
              Campaign Management
            </h2>
            <div className="filters">
              <div className="search-bar">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Campaigns</option>
                <option value="success">Successful</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="campaigns-list">
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-card">
                <div className="campaign-header">
                  <div className="campaign-info">
                    <h3>{campaign.subject}</h3>
                    <div className="campaign-user">By: {campaign.userEmail}</div>
                    <div className="campaign-time">
                      {new Date(campaign.createdAt).toLocaleString()}
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
                <div className="campaign-actions">
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                  >
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Tab */}
      {activeTab === 'scheduled' && (
        <div className="admin-scheduled">
          <div className="admin-section-header">
            <h2>
              <i className="fas fa-clock"></i>
              Scheduled Emails
            </h2>
          </div>

          <div className="scheduled-list">
            {scheduledEmails.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-clock"></i>
                <h3>No Scheduled Emails</h3>
                <p>There are no scheduled emails in the system.</p>
              </div>
            ) : (
              scheduledEmails.map((schedule) => (
                <div key={schedule.id} className="scheduled-item">
                  <div className="scheduled-info">
                    <h3>{schedule.name}</h3>
                    <div className="scheduled-user">By: {schedule.userEmail}</div>
                    <div className="scheduled-details">
                      <div className="detail-row">
                        <span className="detail-label">Scheduled for:</span>
                        <span className="detail-value">
                          {new Date(schedule.scheduledDate).toLocaleString()}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Recipients:</span>
                        <span className="detail-value">{schedule.emailList?.length || 0}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className={`status-badge status-${schedule.status}`}>
                          {schedule.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="scheduled-actions">
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteScheduledEmail(schedule.id)}
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* All Emails Tab */}
      {activeTab === 'emails' && (
        <div className="admin-emails">
          <div className="admin-section-header">
            <h2>
              <i className="fas fa-envelope-open-text"></i>
              All Email Records
            </h2>
            <div className="filters">
              <div className="search-bar">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="email-stats-summary">
            <div className="stat-card success">
              <div className="stat-number">
                {emailRecords.filter(e => e.status === 'sent').length}
              </div>
              <div className="stat-label">Sent Emails</div>
            </div>
            <div className="stat-card error">
              <div className="stat-number">
                {emailRecords.filter(e => e.status === 'failed').length}
              </div>
              <div className="stat-label">Failed Emails</div>
            </div>
            <div className="stat-card info">
              <div className="stat-number">
                {emailRecords.length}
              </div>
              <div className="stat-label">Total Emails</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-number">
                {emailRecords.length > 0 
                  ? Math.round((emailRecords.filter(e => e.status === 'sent').length / emailRecords.length) * 100)
                  : 0}%
              </div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>

          <div className="emails-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Name</th>
                  <th>From Email</th>
                  <th>Sent By User</th>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmailRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="empty-state">
                        <i className="fas fa-inbox"></i>
                        <h3>No Email Records Found</h3>
                        <p>No emails match your search criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmailRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <div className="email-cell">
                          <i className="fas fa-envelope"></i>
                          <span>{record.email}</span>
                        </div>
                      </td>
                      <td>{record.name || 'N/A'}</td>
                      <td>
                        <div className="from-email-cell">
                          <i className="fas fa-paper-plane"></i>
                          <span>{record.fromEmail || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="user-cell-small">
                          <div className="user-badge">{record.userName?.charAt(0) || 'U'}</div>
                          <span>{record.userName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="campaign-subject-cell">
                          {record.campaignSubject}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${record.status}`}>
                          {record.status === 'sent' ? (
                            <>
                              <i className="fas fa-check-circle"></i> Sent
                            </>
                          ) : (
                            <>
                              <i className="fas fa-times-circle"></i> Failed
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="timestamp-cell">
                          <div>{new Date(record.timestamp).toLocaleDateString()}</div>
                          <div className="time-small">
                            {new Date(record.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td>
                        {record.error ? (
                          <span className="error-text" title={record.error}>
                            {record.error.substring(0, 50)}
                            {record.error.length > 50 ? '...' : ''}
                          </span>
                        ) : (
                          <span className="no-error">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-info">
            Showing {filteredEmailRecords.length} of {emailRecords.length} email records
          </div>
        </div>
      )}

      {/* User Activity Tab */}
      {activeTab === 'userActivity' && (
        <div className="admin-user-activity">
          <div className="admin-section-header">
            <h2>
              <i className="fas fa-user-clock"></i>
              User Activity Dashboard
            </h2>
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="user-activity-list">
            {userActivity
              .filter(user => 
                searchTerm === '' || 
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.company?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((user) => (
              <div key={user.userId} className="user-activity-card">
                <div 
                  className="user-activity-header"
                  onClick={() => setSelectedUserId(selectedUserId === user.userId ? null : user.userId)}
                >
                  <div className="user-activity-info">
                    <div className="user-avatar-large">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                    <div className="user-details-activity">
                      <h3>{user.displayName}</h3>
                      <div className="user-email-activity">{user.email}</div>
                      <div className="user-company-activity">{user.company}</div>
                    </div>
                  </div>
                  <div className="user-activity-stats">
                    <div className="activity-stat">
                      <div className="stat-number">{user.totalCampaigns}</div>
                      <div className="stat-label">Campaigns</div>
                    </div>
                    <div className="activity-stat">
                      <div className="stat-number">{user.totalEmailsSent}</div>
                      <div className="stat-label">Sent</div>
                    </div>
                    <div className="activity-stat">
                      <div className="stat-number">{user.totalEmailsFailed}</div>
                      <div className="stat-label">Failed</div>
                    </div>
                    <div className="activity-stat">
                      <div className="stat-number">{user.successRate}%</div>
                      <div className="stat-label">Success</div>
                    </div>
                    <div className="activity-stat">
                      <div className="stat-number">{user.scheduledCount}</div>
                      <div className="stat-label">Scheduled</div>
                    </div>
                  </div>
                  <div className="user-activity-meta">
                    <div className="last-activity">
                      {user.lastActivity ? (
                        <>
                          <i className="fas fa-clock"></i>
                          Last active: {user.daysSinceLastActivity === 0 
                            ? 'Today' 
                            : user.daysSinceLastActivity === 1 
                            ? 'Yesterday'
                            : `${user.daysSinceLastActivity} days ago`
                          }
                        </>
                      ) : (
                        <>
                          <i className="fas fa-clock"></i>
                          No activity yet
                        </>
                      )}
                    </div>
                    <button className="expand-btn">
                      <i className={`fas fa-chevron-${selectedUserId === user.userId ? 'up' : 'down'}`}></i>
                    </button>
                  </div>
                </div>

                {selectedUserId === user.userId && (
                  <div className="user-activity-details">
                    <h4>
                      <i className="fas fa-history"></i>
                      Recent Campaigns
                    </h4>
                    {user.recentCampaigns.length === 0 ? (
                      <div className="no-campaigns">
                        <i className="fas fa-inbox"></i>
                        <p>No campaigns yet</p>
                      </div>
                    ) : (
                      <div className="recent-campaigns-list">
                        {user.recentCampaigns.map((campaign) => (
                          <div key={campaign.id} className="campaign-item-mini">
                            <div className="campaign-icon">
                              <i className="fas fa-paper-plane"></i>
                            </div>
                            <div className="campaign-info-mini">
                              <div className="campaign-subject-mini">{campaign.subject}</div>
                              <div className="campaign-stats-mini">
                                <span className="sent-mini">
                                  <i className="fas fa-check"></i> {campaign.sentCount}
                                </span>
                                <span className="failed-mini">
                                  <i className="fas fa-times"></i> {campaign.failedCount}
                                </span>
                                <span className="date-mini">
                                  <i className="fas fa-calendar"></i> 
                                  {new Date(campaign.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="user-activity-summary">
                      <div className="summary-item">
                        <i className="fas fa-user-check"></i>
                        <span>Member since: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="summary-item">
                        <i className="fas fa-envelope"></i>
                        <span>Total emails sent: {user.totalEmailsSent + user.totalEmailsFailed}</span>
                      </div>
                      <div className="summary-item">
                        <i className="fas fa-percentage"></i>
                        <span>Success rate: {user.successRate}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {userActivity.filter(user => 
            searchTerm === '' || 
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.company?.toLowerCase().includes(searchTerm.toLowerCase())
          ).length === 0 && (
            <div className="empty-state">
              <i className="fas fa-user-clock"></i>
              <h3>No User Activity Found</h3>
              <p>No users match your search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="admin-activity">
          <div className="admin-section-header">
            <h2>
              <i className="fas fa-stream"></i>
              Recent Activity
            </h2>
          </div>

          <div className="activity-feed">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item-full">
                <div className="activity-icon">
                  <i className="fas fa-paper-plane"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <strong>{activity.userName}</strong> {activity.action}
                  </div>
                  <div className="activity-details">
                    {activity.details}
                  </div>
                  <div className="activity-meta">
                    {activity.emailCount} emails sent • {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

