import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/axios';
import AdminNavbar from '../../components/AdminNavbar.jsx';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ today: 0, month: 0, total: 0, unpaid: 0 });
  const [patients, setPatients] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [treatmentsData, setTreatmentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || {});

  // Colors for PieChart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    // Appointments
    api.get('/appointments')
        .then(r => {
          console.log('Appointments data:', r.data);
          console.log('Appointment statuses:', [...new Set(r.data?.map(a => a.status))]);
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
    
    // Treatments stats
    api.get('/appointments/treatments-stats')
        .then(r => {
          console.log('Treatments stats:', r.data);
          setTreatmentsData(r.data || []);
        })
        .catch(err => console.error('treatments stats error:', err));
    
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
    
    // Treatments stats
    api.get('/appointments/treatments-stats')
        .then(r => setTreatmentsData(r.data || []))
        .catch(err => console.error('treatments stats error:', err));
  };

  useEffect(() => {
    // This useEffect can be used for additional side effects if needed
  }, []);

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
              {/* Today's Appointments */}
              <div className="bg-white rounded-xl shadow p-5">
                <p className="text-gray-500 text-sm font-medium">Consultations Aujourd'hui</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {appointments.filter(a => new Date(a.start_time).toDateString() === new Date().toDateString()).length}
                </p>
                <p className="text-blue-500 text-sm mt-1">📅 Consultations aujourd'hui</p>
              </div>

              {/* Total Revenue */}
              <div className="bg-white rounded-xl shadow p-5">
                <p className="text-gray-500 text-sm font-medium">Revenue Total</p>
                <p className="text-3xl font-bold text-gray-800">{(stats.total || 0).toLocaleString()} <span className="text-lg">MAD</span></p>
                <p className="text-green-500 text-sm mt-1">💰 Revenus générés</p>
              </div>

              {/* Total Patients */}
              <div className="bg-white rounded-xl shadow p-5">
                <p className="text-gray-500 text-sm font-medium">Total Patients</p>
                <p className="text-3xl font-bold text-gray-800">{patients.length}</p>
                <p className="text-green-500 text-sm mt-1">👥 Patients inscrits</p>
              </div>
            </div>

            {/* Row 2: Charts */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Bar Chart: Monthly Revenue */}
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

              {/* Pie Chart: Top Treatments */}
              <div className="bg-white rounded-xl shadow p-5">
                <h3 className="font-bold text-gray-700 mb-4">Top 5 Traitements</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={treatmentsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} (${value})`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {treatmentsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Row 3: Today's Appointments List */}
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
        </>
        )}
      </div>
    </div>
    );
}
