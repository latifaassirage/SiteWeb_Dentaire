import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  en_attente: 'bg-orange-100 text-orange-600',
  confirmé:   'bg-green-100 text-green-600',
  annulé:     'bg-red-100 text-red-600',
  terminé:    'bg-gray-100 text-gray-600',
  absent:     'bg-purple-100 text-purple-600',
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/appointments').then(r => setAppointments(r.data));
  }, []);

  const handleConfirm = async (id) => {
    await api.put(`/appointments/${id}/confirm`);
    setAppointments(prev => prev.map(a =>
      a.id === id ? {...a, status: 'confirmé'} : a
    ));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Do you want to delete this appointment?')) return;
    await api.delete(`/appointments/${id}`);
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-6">📅 Manage Appointments</h2>
          <button onClick={() => navigate('/admin/dashboard')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
            Back
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all','en_attente','confirmé','annulé','terminé'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>
              {s === 'all' ? 'All' : s === 'en_attente' ? '🟠 Pending' : s === 'confirmé' ? '🟢 Confirmed' : s === 'annulé' ? '🔴 Cancelled' : '✅ Completed'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map(a => (
            <div key={a.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{a.treatment?.name}</h3>
                  <p className="text-gray-500 text-sm">👤 Patient: {a.patient?.name}</p>
                  <p className="text-gray-500 text-sm">👨‍⚕️ Doctor: {a.doctor?.name}</p>
                  <p className="text-gray-500 text-sm">📅 {new Date(a.start_time).toLocaleString('ar-MA')}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColors[a.status]}`}>
                    {a.status}
                  </span>
                  {a.status === 'en_attente' && (
                    <button onClick={() => handleConfirm(a.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600">
                      ✅ Confirm
                    </button>
                  )}
                  <button onClick={() => handleDelete(a.id)}
                    className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-200">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
