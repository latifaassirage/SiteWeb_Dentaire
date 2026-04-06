import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function PatientNavbar({ activePath }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      // Handle different response structures
      const notificationsData = response.data?.notifications || response.data || [];
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      
      // Count unread notifications
      const unreadCount = notificationsData.filter(n => !n.read_at).length;
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const navItems = [
    { label: '🏠 Dashboard', path: '/patient/dashboard' },
    { label: '➕ Book Appointment', path: '/patient/book' },
    { label: '📅 My Appointments', path: '/patient/appointments' },
    { label: '📄 Documents', path: '/patient/documents' },
  ];

  return (
    <nav style={{ backgroundColor: '#1a2b4a' }} className="px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="text-white text-xl font-bold">DentalFlow</span>
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Patient</span>
        </div>
        <div className="flex gap-6">
          {navItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`text-sm transition ${
                item.path === activePath 
                  ? 'text-white font-bold' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          
          {/* Notifications Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-2 text-gray-300 hover:text-white transition-colors rounded"
            >
              {/* Bell Icon with Red Dot Indicator */}
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.41-1.41A2 2 0 0118 14.17V7a2 2 0 00-2-2H8a2 2 0 00-2 2v7.17a2 2 0 01-.59 1.42L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                
                {/* Red Dot Indicator */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {!Array.isArray(notifications) || notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div key={notification.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })} • {new Date(notification.created_at).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            
                            {/* Mark as Read Button */}
                            {!notification.read_at && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="ml-3 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-gray-300 text-sm">{user.name}</span>
        <div onClick={handleLogout}
          className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600">
          <span className="text-white text-sm font-bold">{user.name?.charAt(0) || 'P'}</span>
        </div>
      </div>
    </nav>
  );
}
