import React from 'react';

export default function StatusPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      color: 'white'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '600px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        color: '#333'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px', color: '#667eea' }}>
          <i className="fas fa-check-circle"></i>
        </div>
        <h1 style={{ marginBottom: '20px', fontSize: '2rem' }}>
          🚀 Enhanced Email Marketing Dashboard
        </h1>
        <p style={{ marginBottom: '30px', fontSize: '1.1rem', color: '#666' }}>
          Your email marketing platform has been successfully enhanced with modern features!
        </p>
        
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>✨ New Features Added:</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-chart-line" style={{ color: '#4ade80', marginRight: '10px' }}></i>
              Advanced Analytics Dashboard
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-file-alt" style={{ color: '#3b82f6', marginRight: '10px' }}></i>
              Email Template Management
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-clock" style={{ color: '#f59e0b', marginRight: '10px' }}></i>
              Email Scheduling System
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-bell" style={{ color: '#ef4444', marginRight: '10px' }}></i>
              Real-time Notifications
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-mobile-alt" style={{ color: '#8b5cf6', marginRight: '10px' }}></i>
              Responsive Mobile Design
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-palette" style={{ color: '#06b6d4', marginRight: '10px' }}></i>
              Modern UI/UX Design
            </li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a 
            href="/" 
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <i className="fas fa-home" style={{ marginRight: '8px' }}></i>
            Go to Dashboard
          </a>
          <a 
            href="/auth" 
            style={{
              background: 'transparent',
              color: '#667eea',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              border: '2px solid #667eea',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#667eea';
            }}
          >
            <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i>
            Login
          </a>
        </div>

        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          background: '#e0f2fe', 
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#0369a1'
        }}>
          <strong>Note:</strong> The enhanced dashboard is now the default experience. 
          All new features are integrated into the main interface.
        </div>
      </div>
    </div>
  );
}
