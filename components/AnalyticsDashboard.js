import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

const AnalyticsDashboard = ({ userProfile }) => {
  const [analytics, setAnalytics] = useState({
    totalCampaigns: 0,
    totalEmailsSent: 0,
    totalEmailsFailed: 0,
    successRate: 0,
    averageEmailsPerCampaign: 0,
    recentActivity: [],
    topRegions: [],
    dailyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, all

  useEffect(() => {
    if (userProfile?.uid) {
      loadAnalytics();
    }
  }, [userProfile, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const now = new Date();
      let startDate;
      switch (timeRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      // Query campaigns (simplified to avoid index requirement)
      const campaignsRef = collection(db, 'campaigns');
      const q = query(
        campaignsRef,
        where('userId', '==', userProfile.uid),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      const campaigns = [];
      const regionStats = {};
      const dailyStats = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        campaigns.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date()
        });
      });

      // Filter campaigns by date range - client-side filtering
      const filteredCampaigns = campaigns.filter(campaign => {
        const campaignDate = new Date(campaign.createdAt);
        return campaignDate >= startDate;
      });

      // Sort campaigns by creation date (newest first) - client-side sorting
      filteredCampaigns.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA; // Newest first
      });

      // Calculate region and daily stats from filtered campaigns
      filteredCampaigns.forEach(campaign => {
        // Count by region
        const region = campaign.awsRegion || 'Unknown';
        regionStats[region] = (regionStats[region] || 0) + 1;

        // Count by day
        const day = campaign.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
        if (!dailyStats[day]) {
          dailyStats[day] = { campaigns: 0, sent: 0, failed: 0 };
        }
        dailyStats[day].campaigns += 1;
        dailyStats[day].sent += campaign.sentCount || 0;
        dailyStats[day].failed += campaign.failedCount || 0;
      });

      // Calculate analytics
      const totalCampaigns = filteredCampaigns.length;
      const totalEmailsSent = filteredCampaigns.reduce((sum, campaign) => sum + (campaign.sentCount || 0), 0);
      const totalEmailsFailed = filteredCampaigns.reduce((sum, campaign) => sum + (campaign.failedCount || 0), 0);
      const successRate = totalEmailsSent + totalEmailsFailed > 0 
        ? Math.round((totalEmailsSent / (totalEmailsSent + totalEmailsFailed)) * 100)
        : 0;
      const averageEmailsPerCampaign = totalCampaigns > 0 
        ? Math.round((totalEmailsSent + totalEmailsFailed) / totalCampaigns)
        : 0;

      // Top regions
      const topRegions = Object.entries(regionStats)
        .map(([region, count]) => ({ region, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Daily stats (last 7 days)
      const dailyStatsArray = Object.entries(dailyStats)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .slice(-7)
        .map(([date, stats]) => ({
          date,
          ...stats,
          successRate: stats.sent + stats.failed > 0 
            ? Math.round((stats.sent / (stats.sent + stats.failed)) * 100)
            : 0
        }));

      // Recent activity
      const recentActivity = filteredCampaigns
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map(campaign => ({
          id: campaign.id,
          subject: campaign.subject,
          sent: campaign.sentCount || 0,
          failed: campaign.failedCount || 0,
          date: campaign.createdAt,
          region: campaign.awsRegion
        }));

      setAnalytics({
        totalCampaigns,
        totalEmailsSent,
        totalEmailsFailed,
        successRate,
        averageEmailsPerCampaign,
        recentActivity,
        topRegions,
        dailyStats: dailyStatsArray
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner">
          <i className="fas fa-chart-line fa-spin"></i>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>
          <i className="fas fa-chart-line"></i>
          Analytics Dashboard
        </h2>
        <div className="time-range-selector">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">
            <i className="fas fa-paper-plane"></i>
          </div>
          <div className="metric-content">
            <div className="metric-value">{analytics.totalCampaigns}</div>
            <div className="metric-label">Total Campaigns</div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="metric-content">
            <div className="metric-value">{analytics.totalEmailsSent.toLocaleString()}</div>
            <div className="metric-label">Emails Sent</div>
          </div>
        </div>

        <div className="metric-card error">
          <div className="metric-icon">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <div className="metric-content">
            <div className="metric-value">{analytics.totalEmailsFailed.toLocaleString()}</div>
            <div className="metric-label">Emails Failed</div>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">
            <i className="fas fa-percentage"></i>
          </div>
          <div className="metric-content">
            <div className="metric-value">{analytics.successRate}%</div>
            <div className="metric-label">Success Rate</div>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">
            <i className="fas fa-chart-bar"></i>
          </div>
          <div className="metric-content">
            <div className="metric-value">{analytics.averageEmailsPerCampaign}</div>
            <div className="metric-label">Avg per Campaign</div>
          </div>
        </div>
      </div>

      {/* Charts and Details */}
      <div className="analytics-content">
        <div className="analytics-row">
          {/* Daily Stats Chart */}
          <div className="chart-container">
            <h3>Daily Activity</h3>
            <div className="daily-stats-chart">
              {analytics.dailyStats.map((day, index) => (
                <div key={day.date} className="daily-bar">
                  <div className="bar-container">
                    <div 
                      className="bar sent" 
                      style={{ 
                        height: `${Math.max(5, (day.sent / Math.max(...analytics.dailyStats.map(d => d.sent))) * 100)}%` 
                      }}
                    ></div>
                    <div 
                      className="bar failed" 
                      style={{ 
                        height: `${Math.max(5, (day.failed / Math.max(...analytics.dailyStats.map(d => d.failed + d.sent))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="bar-label">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="bar-stats">
                    <span className="sent-count">{day.sent}</span>
                    <span className="failed-count">{day.failed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Regions */}
          <div className="regions-container">
            <h3>Top Regions</h3>
            <div className="regions-list">
              {analytics.topRegions.map((region, index) => (
                <div key={region.region} className="region-item">
                  <div className="region-rank">#{index + 1}</div>
                  <div className="region-name">{region.region}</div>
                  <div className="region-count">{region.count} campaigns</div>
                  <div className="region-bar">
                    <div 
                      className="region-fill" 
                      style={{ 
                        width: `${(region.count / analytics.topRegions[0]?.count) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {analytics.recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-subject">{activity.subject}</div>
                  <div className="activity-details">
                    <span className="sent">{activity.sent} sent</span>
                    <span className="failed">{activity.failed} failed</span>
                    <span className="region">{activity.region}</span>
                  </div>
                </div>
                <div className="activity-time">
                  {new Date(activity.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
