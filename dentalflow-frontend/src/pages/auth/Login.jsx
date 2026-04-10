import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/login', 
        { email, password },
        { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
      );

      const data = res.data;

      // Handle 2FA requirement
      if (data.requires_2fa) {
        setShow2FA(true);
        setUserId(data.user_id);
        setMessage('Code 2FA envoyé à votre email. Veuillez vérifier votre boîte de réception.');
        setLoading(false);
        return;
      }

      // Handle email verification requirement
      if (data.requires_email_verification) {
        setError(data.message);
        setLoading(false);
        return;
      }

      // Normal login flow (for backward compatibility)
      const { user, token } = data;

      if (tab === 'patient' && user.role !== 'patient') {
        setError("Ce compte n'est pas un compte patient.");
        setLoading(false);
        return;
      }

      if (tab === 'admin' && user.role !== 'admin') {
        setError("Ce compte n'est pas un compte administrateur.");
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/patient/dashboard';
      }

    } catch (err) {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
    }
  };

  const handle2FAVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/verify-2fa', 
        { user_id: userId, code: twoFACode },
        { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
      );

      const { user, token } = res.data;

      // Verify role matches selected tab
      if (tab === 'patient' && user.role !== 'patient') {
        setError("Ce compte n'est pas un compte patient.");
        setLoading(false);
        return;
      }

      if (tab === 'admin' && user.role !== 'admin') {
        setError("Ce compte n'est pas un compte administrateur.");
        setLoading(false);
        return;
      }

      // Save token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to appropriate dashboard
      if (user.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/patient/dashboard';
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Code 2FA invalide ou expiré.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0fdfa' }}>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: '#0d9488' }}>
            <span className="text-3xl">🦷</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Connexion</h2>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
          <button
            onClick={() => { setTab('patient'); setError(''); setEmail(''); setPassword(''); }}
            className="w-1/2 py-2 text-sm font-bold transition"
            style={{ backgroundColor: tab === 'patient' ? '#0d9488' : 'white', color: tab === 'patient' ? 'white' : '#6b7280' }}>
            PATIENT
          </button>
          <button
            onClick={() => { setTab('admin'); setError(''); setEmail(''); setPassword(''); }}
            className="w-1/2 py-2 text-sm font-bold transition"
            style={{ backgroundColor: tab === 'admin' ? '#1a2b4a' : 'white', color: tab === 'admin' ? 'white' : '#6b7280' }}>
            ADMINISTRATEUR
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
            <span className="text-red-600">Erreur:</span> {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg mb-4 text-sm">
            <span className="text-green-600">Info:</span> {message}
          </div>
        )}

        {!show2FA ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-600 text-sm mb-1 font-medium">Email</label>
              <input type="email"
                placeholder={tab === 'admin' ? 'admin@dental.com' : 'patient@dental.com'}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1 font-medium">Mot de passe</label>
              <input type="password" placeholder=""
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required />
            </div>

            <button type="submit" disabled={loading}
              className="w-full text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition"
              style={{ backgroundColor: tab === 'admin' ? '#1a2b4a' : '#0d9488' }}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        ) : (
          <form onSubmit={handle2FAVerification} className="space-y-4">
            <div>
              <label className="block text-gray-600 text-sm mb-1 font-medium">Code 2FA</label>
              <input type="text"
                placeholder="Entrez le code à 6 chiffres"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none text-center text-xl font-mono"
                value={twoFACode}
                onChange={e => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required />
              <p className="text-gray-500 text-xs mt-1">Veuillez vérifier votre email pour le code à 6 chiffres.</p>
            </div>

            <button type="submit" disabled={loading || twoFACode.length !== 6}
              className="w-full text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition"
              style={{ backgroundColor: tab === 'admin' ? '#1a2b4a' : '#0d9488' }}>
              {loading ? 'Vérification...' : 'Vérifier le code'}
            </button>

            <button type="button" onClick={() => {
              setShow2FA(false);
              setTwoFACode('');
              setError('');
              setMessage('');
            }}
              className="w-full text-gray-600 py-2 rounded-lg font-bold hover:bg-gray-100 transition">
              Annuler
            </button>
          </form>
        )}

        {tab === 'patient' && (
          <div className="mt-5 text-center space-y-2">
            <p className="text-gray-500 text-sm">
              Pas encore de compte?{' '}
              <button onClick={() => navigate('/register')}
                className="font-bold hover:underline"
                style={{ color: '#0d9488' }}>
                S'inscrire
              </button>
            </p>
          </div>
        )}

        <div className="mt-4 text-center">
          <button onClick={() => navigate('/')}
            className="text-gray-400 text-sm hover:text-gray-600">
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
