import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/verify-email', {
          token: token
        });

        setStatus('success');
        setMessage('Email verified successfully! You can now log in.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);

      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0fdfa' }}>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ 
            backgroundColor: status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : '#3b82f6' 
          }}>
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          )}
          {status === 'success' && (
            <span className="text-2xl">?</span>
          )}
          {status === 'error' && (
            <span className="text-2xl">?</span>
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {status === 'loading' && 'Verifying Email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h2>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {status === 'success' && (
          <p className="text-sm text-gray-500">
            Redirecting to login page in 3 seconds...
          </p>
        )}

        {status === 'error' && (
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
}