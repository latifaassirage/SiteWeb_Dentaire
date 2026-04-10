import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import AdminNavbar from '../../components/AdminNavbar.jsx';

const revenueData = [
  { month: 'Jan', revenue: 50000, target: 45000 },
  { month: 'Feb', revenue: 100000, target: 80000 },
  { month: 'Mar', revenue: 200000, target: 180000 },
  { month: 'Apr', revenue: 280000, target: 250000 },
  { month: 'May', revenue: 220000, target: 260000 },
  { month: 'Jun', revenue: 240000, target: 220000 },
  { month: 'Dec', revenue: 450000, target: 350000 },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ today: 0, month: 0, total: 0, unpaid: 0 });
  const [patients, setPatients] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Appointments
    api.get('/appointments')
        .then(r => {
          console.log('Appointments data:', r.data);
          setAppointments(r.data || []);
        })
        .catch(err => console.error('appointments error:', err));
    
    // Finance stats
    api.get('/finance/stats')
        .then(r => {
          console.log('Stats data:', r.data);
          setStats(r.data || {});
        })
        .catch(err => console.error('stats error:', err));
    
    // Patients count
    api.get('/patients')
        .then(r => {
          console.log('Patients data:', r.data);
          setPatients(r.data || []);
        })
        .catch(err => console.error('patients error:', err));
    
    // Monthly revenue chart
    api.get('/finance/monthly')
        .then(r => {
          console.log('Monthly data:', r.data);
          setMonthlyData(r.data || []);
        })
        .catch(err => console.error('monthly error:', err));
    
    // Set loading to false after all calls
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleRefresh = () => {
    // Appointments
    api.get('/appointments')
        .then(r => setAppointments(r.data || []))
        .catch(err => console.error('appointments error:', err));
    
    // Finance stats
    api.get('/finance/stats')
        .then(r => setStats(r.data || {}))
        .catch(err => console.error('stats error:', err));
    
    // Patients count
    api.get('/patients')
        .then(r => setPatients(r.data || []))
        .catch(err => console.error('patients error:', err));
    
    // Monthly revenue chart
    api.get('/finance/monthly')
        .then(r => setMonthlyData(r.data || []))
        .catch(err => console.error('monthly error:', err));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use Shared AdminNavbar Component */}
      <AdminNavbar />
      
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-700 text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            Dashboard
            <button onClick={handleRefresh}
              className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors">
              Refresh
            </button>
          </div>
        </h1>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl shadow p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-6 mb-6">
              {/* Left: 4 stat cards */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                {/* Today's Appointments */}
                <div className="bg-white rounded-xl shadow p-5">
                  <p className="text-gray-500 text-sm font-medium">Aujourd'hui</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">
              {appointments.filter(a => new Date(a.start_time).toDateString() === new Date().toDateString()).length}
                  </p>
                  <p className="text-blue-500 text-sm mt-1">📅 Consultations aujourd'hui</p>
                  <p className="text-gray-400 text-sm mt-3">{appointments.filter(a => a.status === 'en_attente').length} en attente</p>
                </div>
                
                {/* Unpaid Invoices */}
                <div className="bg-white rounded-xl shadow p-5">
                  <p className="text-gray-500 text-sm font-medium">Factures Impayées</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.unpaid_invoices || 0}</p>
                  <p className="text-orange-500 text-sm mt-1">
                    {(stats.unpaid_amount || 0).toLocaleString()} MAD en attente
                  </p>
                  <p className="text-gray-400 text-sm mt-3">Total des factures en attente</p>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-xl shadow p-5">
                  <p className="text-gray-500 text-sm font-medium">Finances</p>
                  <p className="text-gray-400 text-xs mb-2">Revenue Total</p>
                  <p className="text-3xl font-bold text-gray-800">{(stats.total || 0).toLocaleString()} <span className="text-lg">MAD</span></p>
                  <p className="text-green-500 text-sm mt-1">💰 Revenus générés</p>
                  <p className="text-gray-400 text-sm mt-3">{(stats.total_pending || 0).toLocaleString()} MAD en attente</p>
                </div>

                {/* Total Patients */}
                <div className="bg-white rounded-xl shadow p-5">
                  <p className="text-gray-500 text-sm font-medium">Patients</p>
                  <p className="text-gray-400 text-xs mb-2">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-800">{patients.length}</p>
                  <p className="text-green-500 text-sm mt-1">👥 Patients inscrits</p>
                  <p className="text-gray-400 text-sm mt-3">{appointments.filter(a => a.status === 'confirmé').length} confirmés</p>
                </div>

                {/* Pending Appointments */}
                <div className="bg-white rounded-xl shadow p-5">
                  <p className="text-gray-500 text-sm font-medium">En attente</p>
                  <p className="text-gray-400 text-xs mb-2">Patients en attente</p>
                  <p className="text-3xl font-bold text-gray-800">{appointments.filter(a => a.status === 'en_attente').length}</p>
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full mt-2">
                    ⏳ En attente
                  </span>
                  <p className="text-gray-400 text-xs mt-3">En cours de traitement</p>
                </div>
              </div>

          {/* Right: Revenue Chart */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-bold text-gray-700 mb-4">Revenue Mensuel</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value.toLocaleString()} MAD`} />
                <Bar dataKey="amount" fill="#1a2b4a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Appointments Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Today's Appointments List */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-bold text-gray-700 mb-4">Rendez-vous d'Aujourd'hui</h3>
            {appointments.filter(a => new Date(a.start_time).toDateString() === new Date().toDateString()).length > 0 ? (
              <div className="space-y-3">
                {appointments.filter(a => new Date(a.start_time).toDateString() === new Date().toDateString()).map((appointment, index) => (
                  <div key={appointment.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                        {appointment.patient?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{appointment.patient?.name}</p>
                        <p className="text-sm text-gray-500">{appointment.treatment?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        appointment.status === 'confirmé' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {appointment.status === 'confirmé' ? 'Confirmé' : 'Terminé'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{new Date(appointment.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">Aucun rendez-vous pour aujourd'hui</p>
                <p className="text-sm mt-2">Les rendez-vous confirmés apparaîtront ici</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold text-gray-700 mb-4">Rendez-vous Récents</h3>
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b">
                <th className="pb-3">Patient</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 5).length > 0 ? (
                appointments.slice(0, 5).map((appointment) => (
                  <tr key={appointment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                        {appointment.patient?.name?.charAt(0) || 'P'}
                      </div>
                      <span className="text-sm text-gray-700">{appointment.patient?.name}</span>
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {new Date(appointment.start_time).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 text-sm text-gray-600">{appointment.treatment?.name}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        appointment.status === 'confirmé' ? 'bg-blue-100 text-blue-600' :
                        appointment.status === 'terminé' ? 'bg-green-100 text-green-600' :
                        appointment.status === 'annulé' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {appointment.status === 'confirmé' ? 'Confirmé' :
                         appointment.status === 'terminé' ? 'Terminé' :
                         appointment.status === 'annulé' ? 'Annulé' :
                         appointment.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    <p>Aucun rendez-vous récent</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
