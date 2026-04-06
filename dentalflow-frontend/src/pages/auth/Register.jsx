import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/register', form);
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/patient/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f0fdfa' }}>
      {/* Left Side */}
      <div style={{ backgroundColor: '#0d9488' }} className="hidden md:flex w-1/2 flex-col justify-center items-center p-12">
        <div className="text-center">
          <span className="text-8xl">🦷</span>
          <h1 className="text-4xl font-bold text-white mt-6 mb-4">Rejoindre DentalFlow</h1>
          <p className="text-teal-100 text-lg">Créez votre compte en quelques secondes</p>
          <div className="mt-12 space-y-4">
            {['Inscription gratuite', 'Prendre rendez-vous instantanément', 'Accéder à votre historique dentaire', 'Recevoir des rappels de rendez-vous'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-teal-100">
                <span className="text-green-400">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <span className="text-5xl">👤</span>
            <h2 className="text-2xl font-bold text-gray-800 mt-3">Créer un Compte</h2>
            <p className="text-gray-500 text-sm mt-1">Rejoignez des milliers de patients satisfaits</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-600 text-sm mb-1 font-medium">Nom Complet</label>
              <input type="text" placeholder="Jean Dupont"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-teal-500"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1 font-medium">Adresse Email</label>
              <input type="email" placeholder="votre@email.com"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-teal-500"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1 font-medium">Numéro de Téléphone</label>
              <input type="text" placeholder="+212 600-000-000"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-teal-500"
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1 font-medium">Mot de passe</label>
              <input type="password" placeholder="Min. 8 caractères"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-teal-500"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1 font-medium">Confirmer le Mot de passe</label>
              <input type="password" placeholder="•••••••••"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-teal-500"
                value={form.password_confirmation}
                onChange={e => setForm({...form, password_confirmation: e.target.value})} />
            </div>

            <button type="submit" disabled={loading}
              style={{ backgroundColor: '#0d9488' }}
              className="w-full text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50">
              {loading ? 'Création du compte...' : 'Créer un Compte →'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-500 text-sm">
              Vous avez déjà un compte?{' '}
              <button onClick={() => navigate('/login')}
                className="font-bold hover:underline"
                style={{ color: '#0d9488' }}>
                Se connecter
              </button>
            </p>
            <div className="border-t pt-3">
              <button onClick={() => navigate('/')}
                className="text-gray-400 text-sm hover:text-gray-600">
                ← Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
