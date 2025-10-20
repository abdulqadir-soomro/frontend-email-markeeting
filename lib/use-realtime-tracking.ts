import { useState, useEffect, useRef } from 'react';

interface TrackingData {
  type: 'data';
  campaignId: string;
  timestamp: string;
  analytics: {
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    openRate: string;
    clickRate: string;
  };
}

export const useRealtimeTracking = (campaignId: string | null) => {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!campaignId) {
      setTrackingData(null);
      setIsConnected(false);
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource connection
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const trackingUrl = `${baseUrl}/track/realtime/${campaignId}`;
    
    console.log('🔗 Connecting to real-time tracking:', trackingUrl);
    console.log('🔗 Base URL:', baseUrl);
    
    let eventSource: EventSource;
    try {
      eventSource = new EventSource(trackingUrl);
      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('❌ Failed to create EventSource:', error);
      setError('Failed to create real-time connection');
      setIsConnected(false);
      return;
    }

    eventSource.onopen = () => {
      console.log('🔗 Real-time tracking connected');
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📊 Raw tracking data received:', data);
        
        // Handle different message types
        if (data.type === 'heartbeat') {
          console.log('💓 Heartbeat received');
          return;
        }
        
        if (data.type === 'connection') {
          console.log('🔗 Connection message:', data.message);
          return;
        }
        
        // Skip other non-data messages
        if (data.type && data.type !== 'data') {
          console.log('📊 Skipping non-data message:', data.type);
          return;
        }
        
        // Only process messages that have analytics data
        if (!data.analytics) {
          console.log('📊 Skipping message without analytics:', data);
          return;
        }
        
        console.log('📊 Analytics object:', data.analytics);
        
        // Validate the data structure
        if (data.analytics && typeof data.analytics === 'object') {
          // Check if all required properties exist
          const requiredProps = ['totalSent', 'totalOpened', 'totalClicked', 'totalBounced', 'openRate', 'clickRate'];
          const missingProps = requiredProps.filter(prop => !(prop in data.analytics));
          
          if (missingProps.length === 0) {
            setTrackingData(data as TrackingData);
            console.log('📊 Real-time tracking update applied:', data);
          } else {
            console.warn('⚠️ Missing analytics properties:', missingProps);
            console.warn('⚠️ Received analytics:', data.analytics);
            setError(`Missing analytics properties: ${missingProps.join(', ')}`);
          }
        } else {
          console.warn('⚠️ Invalid analytics data structure:', data);
          console.warn('⚠️ Analytics type:', typeof data.analytics);
          setError('Invalid tracking data received - analytics is not an object');
        }
      } catch (err) {
        console.error('Error parsing tracking data:', err);
        console.error('Raw event data:', event.data);
        setError('Failed to parse tracking data');
      }
    };

    eventSource.onerror = (event) => {
      console.error('Real-time tracking error:', event);
      console.error('EventSource readyState:', eventSource.readyState);
      console.error('EventSource URL:', eventSource.url);
      
      setIsConnected(false);
      
      // Determine specific error message based on readyState
      let errorMessage = 'Connection lost. Retrying...';
      if (eventSource.readyState === EventSource.CLOSED) {
        errorMessage = 'Connection closed. Retrying...';
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        errorMessage = 'Failed to connect to tracking server. Check if backend is running.';
      }
      
      setError(errorMessage);
      
      // Close the current connection
      eventSource.close();
      eventSourceRef.current = null;
      
      // Retry connection after 3 seconds (reduced from 5)
      setTimeout(() => {
        if (campaignId && !eventSourceRef.current) {
          console.log('🔄 Retrying real-time tracking connection...');
          // Trigger reconnection by updating campaignId
          setTrackingData(null);
          setError(null);
        }
      }, 3000);
    };

    return () => {
      console.log('🧹 Cleaning up real-time tracking connection');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
    };
  }, [campaignId]);

  // Fallback function to fetch data periodically if real-time fails
  const fetchTrackingData = async () => {
    if (!campaignId) return;
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      // Get auth token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${baseUrl}/campaigns/${campaignId}/analytics`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        console.warn('⚠️ Fallback analytics fetch failed:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const analytics = data.data.analytics;
        setTrackingData({
          type: 'data', // ✅ Added this
          campaignId,
          timestamp: new Date().toISOString(),
          analytics: {
            totalSent: analytics.totalSent || 0,
            totalOpened: analytics.totalOpened || 0,
            totalClicked: analytics.totalClicked || 0,
            totalBounced: analytics.totalBounced || 0,
            openRate: analytics.openRate || '0.00',
            clickRate: analytics.clickRate || '0.00',
          },
        });
        console.log('📊 Fallback tracking data updated:', analytics);
      }
    } catch (error) {
      console.error('❌ Fallback tracking fetch failed:', error);
    }
  };

  // Start fallback polling if real-time connection fails
  useEffect(() => {
    if (!isConnected && campaignId && !trackingData) {
      // Check if user is authenticated before starting fallback
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        console.log('🔄 Starting fallback polling for tracking data');
        // Add a delay before starting fallback to give real-time connection time
        setTimeout(() => {
          if (!isConnected) {
            fetchTrackingData(); // Initial fetch
            fallbackIntervalRef.current = setInterval(fetchTrackingData, 60000); // Poll every 60 seconds
          }
        }, 5000); // Wait 5 seconds before starting fallback
      } else {
        console.log('⚠️ No auth token found, skipping fallback polling');
      }
    }
    
    return () => {
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
    };
  }, [isConnected, campaignId, trackingData]);

  return {
    trackingData,
    isConnected,
    error,
  };
};
