import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AdminNavbar from '../../components/AdminNavbar.jsx';

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    clinic_name: 'DentalFlow',
    email: '[Your Admin Gmail]',
    phone: '+212 6 XX XX XX XX',
    address: 'N° 45, Avenue Mohammed V, Guelmim, Maroc',
    working_hours: {
      monday_friday: '09:00 - 18:30',
      saturday: '09:00 - 14:00',
      sunday: 'Fermé'
    },
    logo: '',
    appointment_duration: '30',
    opening_time: '09:00',
    closing_time: '18:30',
    lunch_start: '12:00',
    lunch_end: '14:00',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clinic-settings');
      setSettings(response.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log('🔧 Sending settings to API:', settings);
      
      const response = await api.put('/clinic-settings', settings);
      console.log('✅ Settings save response:', response.data);
      
      setSuccess('✅ Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('❌ Error saving settings:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar activePath="/admin/settings" />
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-700 mb-6">⚙️ Settings</h1>

        {success && (
          <div className="bg-green-100 text-green-600 p-3 rounded-lg mb-4">✅ {success}</div>
        )}

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">❌ {error}</div>
        )}

        {loading && (
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mb-4">⏳ Loading...</div>
        )}

        {/* Clinic Info */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold text-gray-700 mb-4 text-lg">🏥 Clinic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 text-sm mb-1">Clinic Name</label>
              <input type="text" className="w-full border p-3 rounded-lg"
                value={settings.clinic_name || ''}
                onChange={e => setSettings({...settings, clinic_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Email</label>
              <input type="email" className="w-full border p-3 rounded-lg"
                value={settings.email}
                onChange={e => setSettings({...settings, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Phone</label>
              <input type="text" className="w-full border p-3 rounded-lg"
                value={settings.phone}
                onChange={e => setSettings({...settings, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Logo URL</label>
              <input type="text" className="w-full border p-3 rounded-lg"
                value={settings.logo || ''}
                onChange={e => setSettings({...settings, logo: e.target.value})} 
                placeholder="Optional logo URL" />
            </div>
            <div className="col-span-2">
              <label className="block text-gray-500 text-sm mb-1">Address</label>
              <input type="text" className="w-full border p-3 rounded-lg"
                value={settings.address}
                onChange={e => setSettings({...settings, address: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold text-gray-700 mb-4 text-lg">🕐 Working Hours</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-gray-500 text-sm mb-1">Monday - Friday</label>
              <input type="text" className="w-full border p-3 rounded-lg"
                value={settings.working_hours?.monday_friday || ''}
                onChange={e => setSettings({
                  ...settings, 
                  working_hours: {
                    ...settings.working_hours,
                    monday_friday: e.target.value
                  }
                })} 
                placeholder="e.g., 09:00 - 18:30" />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Saturday</label>
              <input type="text" className="w-full border p-3 rounded-lg"
                value={settings.working_hours?.saturday || ''}
                onChange={e => setSettings({
                  ...settings, 
                  working_hours: {
                    ...settings.working_hours,
                    saturday: e.target.value
                  }
                })} 
                placeholder="e.g., 09:00 - 14:00" />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Sunday</label>
              <input type="text" className="w-full border p-3 rounded-lg"
                value={settings.working_hours?.sunday || ''}
                onChange={e => setSettings({
                  ...settings, 
                  working_hours: {
                    ...settings.working_hours,
                    sunday: e.target.value
                  }
                })} 
                placeholder="e.g., Fermé" />
            </div>
          </div>
        </div>

        {/* Appointment Settings */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold text-gray-700 mb-4 text-lg">⏰ Appointment Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 text-sm mb-1">Opening Time</label>
              <input type="time" className="w-full border p-3 rounded-lg"
                value={settings.opening_time}
                onChange={e => setSettings({...settings, opening_time: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Closing Time</label>
              <input type="time" className="w-full border p-3 rounded-lg"
                value={settings.closing_time}
                onChange={e => setSettings({...settings, closing_time: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Lunch Break Start</label>
              <input type="time" className="w-full border p-3 rounded-lg"
                value={settings.lunch_start}
                onChange={e => setSettings({...settings, lunch_start: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Lunch Break End</label>
              <input type="time" className="w-full border p-3 rounded-lg"
                value={settings.lunch_end}
                onChange={e => setSettings({...settings, lunch_end: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Appointment Duration (min)</label>
              <select className="w-full border p-3 rounded-lg"
                value={settings.appointment_duration}
                onChange={e => setSettings({...settings, appointment_duration: e.target.value})}>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
          </div>
        </div>

        <button onClick={handleSave}
          style={{ backgroundColor: '#1a2b4a' }}
          disabled={loading}
          className="w-full text-white py-3 rounded-lg hover:opacity-90 font-bold text-lg disabled:opacity-50">
          {loading ? '⏳ Saving...' : '💾 Save Settings'}
        </button>
      </div>
    </div>
  );
}
