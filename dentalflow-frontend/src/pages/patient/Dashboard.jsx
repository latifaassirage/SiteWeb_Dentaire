import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PatientNavbar from '../../components/PatientNavbar';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
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

  const upcoming = appointments.filter(a => a.status === 'confirmé' || a.status === 'en_attente');
  const past = appointments.filter(a => a.status === 'terminé');

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar activePath="/patient/dashboard" />

      
      <div className="p-6 max-w-5xl mx-auto">
        {/* Welcome Banner */}
        <div style={{ backgroundColor: '#1a2b4a' }} className="rounded-xl p-6 mb-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Hello, {user.name} 👋</h1>
            <p className="text-blue-200">Manage your dental appointments easily</p>
          </div>
          <button onClick={() => navigate('/patient/book')}
            className="bg-white text-blue-900 px-5 py-2 rounded-lg font-bold hover:bg-blue-50">
            + Book Appointment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-5 border-t-4 border-blue-500">
            <p className="text-gray-500 text-sm">Upcoming</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{upcoming.length}</p>
            <p className="text-blue-500 text-sm mt-1">appointments</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-t-4 border-green-500">
            <p className="text-gray-500 text-sm">Completed</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{past.length}</p>
            <p className="text-green-500 text-sm mt-1">visits</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-t-4 border-purple-500">
            <p className="text-gray-500 text-sm">Total</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{appointments.length}</p>
            <p className="text-purple-500 text-sm mt-1">all time</p>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700">Recent Appointments</h3>
            <button onClick={fetchAppointments} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              🔄 Refresh
            </button>
          </div>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p>No appointments yet</p>
              <button onClick={() => navigate('/patient/book')}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                Book your first appointment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 3).map(a => (
                <div key={a.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-800">{a.treatment?.name || 'Consultation'}</p>
                      {a.treatment?.price && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          {a.treatment.price} MAD
                        </span>
                      )}
                      {a.status === 'terminé' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          ✅ Paid
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">📅 {new Date(a.start_time).toLocaleString('en-GB')}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    a.status === 'confirmé' ? 'bg-green-100 text-green-600' :
                    a.status === 'en_attente' ? 'bg-orange-100 text-orange-600' :
                    a.status === 'terminé' ? 'bg-blue-100 text-blue-600' :
                    a.status === 'annulé' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {a.status === 'confirmé' ? '✅ Confirmed' :
                     a.status === 'en_attente' ? '⏳ Pending' : 
                     a.status === 'terminé' ? 'Completed' :
                     a.status === 'annulé' ? '❌ Cancelled' :
                     a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
