import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const EmailScheduler = ({ userProfile, emailList, emailContent, onScheduleComplete }) => {
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    scheduledDate: '',
    scheduledTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    repeat: 'none',
    repeatInterval: 1,
    repeatDays: [],
    endDate: ''
  });
  const [loading, setLoading] = useState(false);

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney'
  ];

  const repeatOptions = [
    { value: 'none', label: 'No Repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const weekDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  useEffect(() => {
    if (userProfile?.uid) {
      loadScheduledEmails();
    }
  }, [userProfile]);

  const loadScheduledEmails = async () => {
    try {
      setLoading(true);
      const scheduledRef = collection(db, 'scheduledEmails');
      const q = query(
        scheduledRef,
        where('userId', '==', userProfile.uid)
      );

      const querySnapshot = await getDocs(q);
      const scheduled = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        scheduled.push({
          id: doc.id,
          ...data,
          scheduledDate: data.scheduledDate?.toDate?.() || new Date()
        });
      });

      // Sort by scheduled date (ascending - earliest first) - client-side sorting
      scheduled.sort((a, b) => {
        const dateA = new Date(a.scheduledDate);
        const dateB = new Date(b.scheduledDate);
        return dateA - dateB; // Earliest first
      });

      setScheduledEmails(scheduled);
    } catch (error) {
      console.error('Error loading scheduled emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleEmail = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Validate form
      if (!scheduleForm.name || !scheduleForm.scheduledDate || !scheduleForm.scheduledTime) {
        throw new Error('Please fill in all required fields');
      }

      // Create scheduled date
      const scheduledDateTime = new Date(`${scheduleForm.scheduledDate}T${scheduleForm.scheduledTime}`);
      
      // Validate date is in the future
      if (scheduledDateTime <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }

      const scheduleData = {
        userId: userProfile.uid,
        name: scheduleForm.name,
        scheduledDate: scheduledDateTime,
        timezone: scheduleForm.timezone,
        repeat: scheduleForm.repeat,
        repeatInterval: scheduleForm.repeatInterval,
        repeatDays: scheduleForm.repeatDays,
        endDate: scheduleForm.endDate ? new Date(scheduleForm.endDate) : null,
        emailList: emailList,
        emailContent: emailContent,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'scheduledEmails'), scheduleData);
      
      // Reset form
      setScheduleForm({
        name: '',
        scheduledDate: '',
        scheduledTime: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        repeat: 'none',
        repeatInterval: 1,
        repeatDays: [],
        endDate: ''
      });

      setShowScheduler(false);
      loadScheduledEmails();
      
      if (onScheduleComplete) {
        onScheduleComplete();
      }

    } catch (error) {
      console.error('Error scheduling email:', error);
      alert(`Error scheduling email: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScheduled = async (scheduleId) => {
    if (confirm('Are you sure you want to delete this scheduled email?')) {
      try {
        await deleteDoc(doc(db, 'scheduledEmails', scheduleId));
        loadScheduledEmails();
      } catch (error) {
        console.error('Error deleting scheduled email:', error);
      }
    }
  };

  const formatScheduledDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      scheduled: 'status-scheduled',
      running: 'status-running',
      completed: 'status-completed',
      failed: 'status-failed',
      cancelled: 'status-cancelled'
    };

    return (
      <span className={`status-badge ${statusClasses[status] || 'status-unknown'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRepeatDescription = (schedule) => {
    if (schedule.repeat === 'none') return 'One-time';
    
    let description = `Every ${schedule.repeatInterval} ${schedule.repeat}`;
    
    if (schedule.repeat === 'weekly' && schedule.repeatDays.length > 0) {
      const dayNames = schedule.repeatDays.map(day => 
        weekDays.find(d => d.value === day)?.label
      ).join(', ');
      description += ` (${dayNames})`;
    }
    
    if (schedule.endDate) {
      description += ` until ${new Date(schedule.endDate).toLocaleDateString()}`;
    }
    
    return description;
  };

  return (
    <div className="email-scheduler">
      <div className="scheduler-header">
        <h2>
          <i className="fas fa-clock"></i>
          Email Scheduler
        </h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowScheduler(true)}
          disabled={!emailList || emailList.length === 0}
        >
          <i className="fas fa-plus"></i>
          Schedule Email
        </button>
      </div>

      {/* Scheduled Emails List */}
      <div className="scheduled-emails">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading scheduled emails...</p>
          </div>
        ) : scheduledEmails.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-clock"></i>
            <h3>No Scheduled Emails</h3>
            <p>Schedule your first email campaign to get started.</p>
          </div>
        ) : (
          <div className="scheduled-list">
            {scheduledEmails.map(schedule => (
              <div key={schedule.id} className="scheduled-item">
                <div className="scheduled-info">
                  <div className="scheduled-header">
                    <h3>{schedule.name}</h3>
                    {getStatusBadge(schedule.status)}
                  </div>
                  <div className="scheduled-details">
                    <div className="detail-row">
                      <span className="detail-label">Scheduled for:</span>
                      <span className="detail-value">{formatScheduledDate(schedule.scheduledDate)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Recipients:</span>
                      <span className="detail-value">{schedule.emailList?.length || 0} emails</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Repeat:</span>
                      <span className="detail-value">{getRepeatDescription(schedule)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Subject:</span>
                      <span className="detail-value">{schedule.emailContent?.subject || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="scheduled-actions">
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteScheduled(schedule.id)}
                  >
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduler && (
        <div className="modal">
          <div className="modal-content scheduler-modal">
            <div className="modal-header">
              <h3>Schedule Email Campaign</h3>
              <button 
                className="close-btn"
                onClick={() => setShowScheduler(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleScheduleEmail} className="schedule-form">
              <div className="form-group">
                <label>Campaign Name *</label>
                <input
                  type="text"
                  value={scheduleForm.name}
                  onChange={(e) => setScheduleForm({...scheduleForm, name: e.target.value})}
                  placeholder="Enter a name for this scheduled campaign"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Schedule Date *</label>
                  <input
                    type="date"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm({...scheduleForm, scheduledDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Schedule Time *</label>
                  <input
                    type="time"
                    value={scheduleForm.scheduledTime}
                    onChange={(e) => setScheduleForm({...scheduleForm, scheduledTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Timezone</label>
                <select
                  value={scheduleForm.timezone}
                  onChange={(e) => setScheduleForm({...scheduleForm, timezone: e.target.value})}
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Repeat</label>
                <select
                  value={scheduleForm.repeat}
                  onChange={(e) => setScheduleForm({...scheduleForm, repeat: e.target.value})}
                >
                  {repeatOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {scheduleForm.repeat !== 'none' && (
                <>
                  <div className="form-group">
                    <label>Repeat Interval</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={scheduleForm.repeatInterval}
                      onChange={(e) => setScheduleForm({...scheduleForm, repeatInterval: parseInt(e.target.value)})}
                    />
                    <small>Repeat every {scheduleForm.repeatInterval} {scheduleForm.repeat}</small>
                  </div>

                  {scheduleForm.repeat === 'weekly' && (
                    <div className="form-group">
                      <label>Repeat on Days</label>
                      <div className="checkbox-group">
                        {weekDays.map(day => (
                          <label key={day.value} className="checkbox-item">
                            <input
                              type="checkbox"
                              value={day.value}
                              checked={scheduleForm.repeatDays.includes(day.value)}
                              onChange={(e) => {
                                const days = e.target.checked
                                  ? [...scheduleForm.repeatDays, day.value]
                                  : scheduleForm.repeatDays.filter(d => d !== day.value);
                                setScheduleForm({...scheduleForm, repeatDays: days});
                              }}
                            />
                            <span>{day.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>End Date (Optional)</label>
                    <input
                      type="date"
                      value={scheduleForm.endDate}
                      onChange={(e) => setScheduleForm({...scheduleForm, endDate: e.target.value})}
                      min={scheduleForm.scheduledDate}
                    />
                    <small>Leave empty for no end date</small>
                  </div>
                </>
              )}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={() => setShowScheduler(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-clock"></i>
                      Schedule Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailScheduler;
