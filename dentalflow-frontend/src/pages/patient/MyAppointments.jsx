import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PatientNavbar from '../../components/PatientNavbar';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAppointments();
    
    // Set up periodic refresh for real-time updates
    const interval = setInterval(fetchAppointments, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/my-appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      setAppointments(prev => prev.map(a => a.id === id ? {...a, status: 'annulé'} : a));
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot cancel');
    }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar activePath="/patient/appointments" />

      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-700">📅 My Appointments</h1>
          <div className="flex gap-2">
            <button onClick={fetchAppointments}
              className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
              🔄 Refresh
            </button>
            <button onClick={() => navigate('/patient/book')}
              style={{ backgroundColor: '#1a2b4a' }}
              className="text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90">
              + Book New
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'en_attente', 'confirmé', 'annulé', 'terminé'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}>
              {s === 'all' ? 'All' : s === 'en_attente' ? '⏳ En attente' :
               s === 'confirmé' ? '✅ Confirmed' : s === 'annulé' ? '❌ Cancelled' : '🏁 Done'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p>No appointments found</p>
            </div>
          ) : (
            filtered.map(a => (
              <div key={a.id} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className={`w-1 rounded-full ${
                      a.status === 'confirmé' ? 'bg-green-500' :
                      a.status === 'en_attente' ? 'bg-orange-400' :
                      a.status === 'terminé' ? 'bg-blue-500' :
                      a.status === 'annulé' ? 'bg-red-500' : 'bg-gray-400'
                    }`} style={{ minHeight: '60px' }}></div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">{a.treatment?.name || 'Consultation'}</h3>
                      <p className="text-gray-500 text-sm">👨‍⚕️ Dr. {a.doctor?.name}</p>
                      <p className="text-gray-500 text-sm">📅 {new Date(a.start_time).toLocaleString('en-GB')}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500 text-sm">💰 {a.treatment?.price} MAD</p>
                        {a.status === 'terminé' && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            ✅ Paid
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      a.status === 'confirmé' ? 'bg-green-100 text-green-600' :
                      a.status === 'en_attente' ? 'bg-orange-100 text-orange-600' :
                      a.status === 'terminé' ? 'bg-blue-100 text-blue-600' :
                      a.status === 'annulé' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {a.status === 'confirmé' ? '✅ Confirmed' :
                       a.status === 'en_attente' ? '⏳ En attente' :
                       a.status === 'terminé' ? '🏁 Completed' :
                       a.status === 'annulé' ? '❌ Cancelled' : a.status}
                    </span>
                    {a.status === 'annulé' && a.cancellation_reason && (
                      <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-red-600 text-xs">⚠️ {a.cancellation_reason}</p>
                        <button onClick={() => navigate('/patient/book')}
                          className="mt-1 text-xs font-bold underline"
                          style={{ color: '#0d9488' }}>
                          → Prendre un nouveau rendez-vous
                        </button>
                      </div>
                    )}
                    {(a.status === 'en_attente' || a.status === 'confirmé') && (
                      <button onClick={() => handleCancel(a.id)}
                        className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-200">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
