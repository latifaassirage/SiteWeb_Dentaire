import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/login', form);
      const { user, token } = res.data;
      if (user.role !== 'admin' && user.role !== 'doctor') {
        setError('Access denied. Admin only.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a2b4a' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🦷</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">DentalFlow Admin</h2>
          <p className="text-gray-500 text-sm mt-1">Restricted access — Staff only</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-1 font-medium">Admin Email</label>
            <input type="email" placeholder="admin@dentalflow.ma"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-1 font-medium">Password</label>
            <input type="password" placeholder="••••••••"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} />
          </div>

          <button type="submit" disabled={loading}
            style={{ backgroundColor: '#1a2b4a' }}
            className="w-full text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50">
            {loading ? 'Signing in...' : '🔐 Admin Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center border-t pt-4">
          <button onClick={() => navigate('/')}
            className="text-gray-400 text-sm hover:text-gray-600">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
