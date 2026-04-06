import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
    
    // Set up periodic refresh for real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard statistics and appointments in parallel
      const [dashboardResponse, appointmentsResponse] = await Promise.all([
        api.get('/dashboard'),
        api.get('/appointments')
      ]);
      
      console.log('📊 Dashboard stats response:', dashboardResponse.data);
      console.log('🔍 Pending count:', dashboardResponse.data?.pending);
      console.log('🔍 Today appointments:', dashboardResponse.data?.appointments_today);
      setStats(dashboardResponse.data || {
        appointments_today: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        total_patients: 0,
        total_revenue: 0,
        paid_invoices: 0,
        recent_appointments: [],
        monthly_revenue: []
      });
      setAppointments(appointmentsResponse.data || []);
    } catch (err) {
      console.error('❌ Failed to fetch dashboard data:', err);
      // Set safe defaults to prevent page crashes
      setStats({
        appointments_today: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        total_patients: 0,
        total_revenue: 0,
        paid_invoices: 0,
        recent_appointments: [],
        monthly_revenue: []
      });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use Shared AdminNavbar Component */}
      <AdminNavbar />
      
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-700 text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            Dashboard
            <button onClick={fetchDashboardData}
              className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors">
              🔄 Refresh
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
                  <p className="text-gray-400 text-xs mb-2">Rendez-vous du jour</p>
                  <p className="text-3xl font-bold text-gray-800">{stats?.appointments_today || 0}</p>
                  <p className="text-blue-500 text-sm mt-1">📅 Consultations aujourd'hui</p>
                  <p className="text-gray-400 text-sm mt-3">{stats?.pending || 0} en attente</p>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-xl shadow p-5">
                  <p className="text-gray-500 text-sm font-medium">Finances</p>
                  <p className="text-gray-400 text-xs mb-2">Revenue Total</p>
                  <p className="text-3xl font-bold text-gray-800">{(stats?.total_revenue || 0).toLocaleString()} <span className="text-lg">MAD</span></p>
                  <p className="text-green-500 text-sm mt-1">💰 Revenus générés</p>
                  <p className="text-gray-400 text-sm mt-3">{stats?.total_patients || 0} patients total</p>
                </div>

                {/* Total Patients */}
                <div className="bg-white rounded-xl shadow p-5">
                  <p className="text-gray-500 text-sm font-medium">Patients</p>
                  <p className="text-gray-400 text-xs mb-2">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-800">{stats?.total_patients || 0}</p>
                  <p className="text-green-500 text-sm mt-1">👥 Patients inscrits</p>
                  <p className="text-gray-400 text-sm mt-3">{stats?.pending || 0} en attente</p>
                </div>

                {/* Pending Appointments */}
                <div className="bg-white rounded-xl shadow p-5">
                  <p className="text-gray-500 text-sm font-medium">En attente</p>
                  <p className="text-gray-400 text-xs mb-2">Rendez-vous en attente</p>
                  <p className="text-3xl font-bold text-gray-800">{stats?.pending || 0}</p>
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full mt-2">
                    ⏳ En attente
                  </span>
                  <p className="text-gray-400 text-xs mt-3">À confirmer</p>
                </div>
              </div>

          {/* Right: Revenue Chart */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-bold text-gray-700 mb-4">Revenue Mensuel</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats?.monthly_revenue || revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value.toLocaleString()} MAD`} />
                <Line type="monotone" dataKey="revenue" stroke="#1a2b4a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
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
              {(stats?.recent_appointments || appointments.slice(0, 5)).map(a => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                      {(a.patient_name || a.patient?.name)?.charAt(0) || 'P'}
                    </div>
                    <span className="text-sm text-gray-700">{a.patient_name || a.patient?.name}</span>
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {new Date(a.date || a.start_time).toLocaleDateString('fr-MA')}
                  </td>
                  <td className="py-3 text-sm text-gray-600">{a.treatment_name || a.treatment?.name || 'Consultation'}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      a.status === 'confirmé' ? 'bg-green-100 text-green-600' :
                      a.status === 'en_attente' ? 'bg-orange-100 text-orange-600' :
                      a.status === 'terminé' ? 'bg-blue-100 text-blue-600' :
                      a.status === 'annulé' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {a.status === 'confirmé' ? '✅ Confirmed' :
                       a.status === 'en_attente' ? '⏳ Pending' :
                       a.status === 'terminé' ? '🏁 Completed' :
                       a.status === 'annulé' ? '❌ Cancelled' :
                       a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stats?.recent_appointments && appointments.length === 0) && (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-400">No appointments yet</td>
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
