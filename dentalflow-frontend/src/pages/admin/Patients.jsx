import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AdminNavbar from '../../components/AdminNavbar.jsx';

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loadingAppointmentId, setLoadingAppointmentId] = useState(null);
  const [search, setSearch] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Add this test function temporarily for debugging
  const testAPI = async () => {
    try {
      console.log('🧪 Testing API connection...');
      const response = await api.get('/me');
      console.log('✅ API test successful:', response.data);
      
      // Test appointments endpoint
      const appointmentsResponse = await api.get('/appointments');
      console.log('📅 Appointments test:', appointmentsResponse.data.length, 'appointments found');
    } catch (error) {
      console.error('❌ API test failed:', error);
    }
  };

  // Add test button to UI temporarily
  useEffect(() => {
    testAPI();
    api.get('/patients').then(r => setPatients(r.data)).catch(() => {});
  }, []);

  const handleSelect = async (patient) => {
    console.log('🔍 Patient clicked:', patient);
    setSelected(patient);
    try {
      console.log('🌐 Fetching patient details for ID:', patient.id);
      const res = await api.get(`/admin/patients/${patient.id}`);
      console.log('📋 Patient details response:', res.data);
      setPatientDetails(res.data);
    } catch (error) {
      console.error('❌ Failed to fetch patient details:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce patient?')) return;
    await api.delete(`/patients/${id}`);
    setPatients(prev => prev.filter(p => p.id !== id));
    setSelected(null);
    setPatientDetails(null);
  };

  const updateStatus = async (id, status) => {
    try {
      console.log('🔄 Updating appointment status:', { id, status });
      
      // Set loading state
      setLoadingAppointmentId(id);
      
      // Update local state instantly for immediate UI feedback
      setPatientDetails(prev => ({
        ...prev,
        appointments: prev.appointments?.map(apt =>
          apt.id === id ? { ...apt, status } : apt
        )
      }));
      
      // Send API request
      await api.patch(`/appointments/${id}`, { status });
      
      console.log('✅ Status updated successfully');
    } catch (error) {
      console.error('❌ Failed to update appointment status:', error);
      // Revert local state on error
      if (selected) {
        const res = await api.get(`/admin/patients/${selected.id}`);
        setPatientDetails(res.data);
      }
    } finally {
      // Clear loading state
      setLoadingAppointmentId(null);
    }
  };

  const handleAppointmentAction = async (appointmentId, newStatus) => {
    console.log('🔧 Starting appointment action:', { appointmentId, newStatus });
    setLoadingAppointmentId(appointmentId);
    
    try {
      const appointment = patientDetails.appointments.find(a => a.id === appointmentId);
      console.log('📋 Found appointment:', appointment);
      
      const payload = { 
        status: newStatus,
        send_notification: true
      };
      console.log('🚀 Sending PATCH request:', payload);
      
      const response = await api.patch(`/appointments/${appointmentId}`, payload);
      console.log('✅ API Response:', response.status, response.data);
      
      // Optimistic update - update the UI immediately
      if (patientDetails?.appointments) {
        setPatientDetails(prev => ({
          ...prev,
          appointments: prev.appointments.map(apt => 
            apt.id === appointmentId ? { ...apt, status: newStatus } : apt
          )
        }));
        console.log('🔄 UI updated with new status:', newStatus);
      }
    } catch (error) {
      console.error('❌ Failed to update appointment:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Re-fetch on error to get fresh data
      try {
        const res = await api.get(`/patients/${selected.id}`);
        setPatientDetails(res.data);
        console.log('🔄 Re-fetched patient details after error');
      } catch (refreshError) {
        console.error('❌ Failed to refresh data:', refreshError);
      }
    } finally {
      setLoadingAppointmentId(null);
      console.log('🏁 Appointment action completed');
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}/confirm`);
      // تحديث الـ list
      const res = await api.get(`/patients/${selected.id}`);
      setPatientDetails(res.data);
      alert('✅ Rendez-vous confirmé avec succès!');
    } catch (err) {
      alert('Erreur lors de la confirmation');
    }
  };

  const handleAnnulerAppointment = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}`, {
        status: 'annulé',
        cancellation_reason: 'Annulé par l\'administration. Veuillez choisir un autre créneau.'
      });
      const res = await api.get(`/patients/${selected.id}`);
      setPatientDetails(res.data);
      alert('❌ Rendez-vous annulé. Le patient sera informé de choisir un autre créneau.');
    } catch (err) {
      alert('Erreur lors de l\'annulation');
    }
  };

  const handleTermineAppointment = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status: 'terminé' });
      const res = await api.get(`/patients/${selected.id}`);
      setPatientDetails(res.data);
      alert('🏁 Terminé! Une facture a été générée automatiquement.');
    } catch (err) {
      alert('Erreur');
    }
  };

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    en_attente: 'bg-orange-100 text-orange-600',
    confirmé: 'bg-green-100 text-green-600',
    annulé: 'bg-red-100 text-red-600',
    terminé: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar activePath="/admin/patients" />

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-700">👥 Patients</h1>
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
            {patients.length} patients
          </span>
        </div>

        <input type="text" placeholder="🔍 Rechercher par nom ou email..."
          className="w-full border p-3 rounded-lg mb-4 bg-white shadow-sm"
          value={search} onChange={e => setSearch(e.target.value)} />

        <div className="grid grid-cols-3 gap-6">
          {/* Liste patients */}
          <div className="col-span-2 bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead style={{ backgroundColor: '#1a2b4a' }}>
                <tr>
                  <th className="p-4 text-left text-white text-sm">Patient</th>
                  <th className="p-4 text-left text-white text-sm">Email</th>
                  <th className="p-4 text-left text-white text-sm">Téléphone</th>
                  <th className="p-4 text-left text-white text-sm">Inscrit le</th>
                  <th className="p-4 text-left text-white text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}
                    className={`border-t cursor-pointer hover:bg-blue-50 transition ${selected?.id === p.id ? 'bg-blue-50' : ''}`}
                    onClick={() => handleSelect(p)}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: '#1a2b4a' }}>
                          {p.name?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{p.email}</td>
                    <td className="p-4 text-gray-500 text-sm">{p.phone || '—'}</td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(p.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4">
                      <button onClick={e => { e.stopPropagation(); handleDelete(p.id); }}
                        className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-200">
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400">
                      Aucun patient trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Patient Details */}
          <div className="bg-white rounded-xl shadow p-5 overflow-y-auto" style={{ maxHeight: '600px' }}>
            {selected && patientDetails ? (
              <div>
                {/* Avatar + Info */}
                <div className="flex flex-col items-center mb-5">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3"
                    style={{ backgroundColor: '#1a2b4a' }}>
                    {selected.name?.charAt(0)}
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">{selected.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full mt-1">Patient</span>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Email</span>
                    <span className="text-gray-800 font-medium">{selected.email}</span>
                  </div>
                  <div className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Téléphone</span>
                    <span className="text-gray-800 font-medium">{selected.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Inscrit le</span>
                    <span className="text-gray-800 font-medium">
                      {new Date(selected.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                {/* Appointments */}
                <div className="mb-4">
                  <h4 className="font-bold text-gray-700 mb-2 text-sm">
                    📅 Rendez-vous ({patientDetails.appointments?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {patientDetails.appointments?.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-2">Aucun rendez-vous</p>
                    ) : (
                      patientDetails.appointments?.map(a => (
                        <div key={a.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-bold text-gray-700">{a.treatment?.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                📅 {new Date(a.start_time).toLocaleString('fr-FR')}
                              </p>
                              <p className="text-xs font-bold mt-0.5" style={{ color: '#0d9488' }}>
                                💰 {a.treatment?.price} MAD
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              a.status === 'confirmé' ? 'bg-green-100 text-green-600' :
                              a.status === 'en_attente' ? 'bg-orange-100 text-orange-600' :
                              a.status === 'annulé' ? 'bg-red-100 text-red-600' :
                              a.status === 'terminé' ? 'bg-gray-100 text-gray-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {a.status === 'confirmé' ? '✅ Confirmé' :
                               a.status === 'en_attente' ? '⏳ En attente' :
                               a.status === 'annulé' ? '❌ Annulé' :
                               a.status === 'terminé' ? '🏁 Terminé' : a.status}
                            </span>
                          </div>

                          {/* Boutons action */}
                          {a.status === 'en_attente' && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => updateStatus(a.id, 'confirmé')}
                                disabled={loadingAppointmentId === a.id}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                                  loadingAppointmentId === a.id 
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                }`}>
                                {loadingAppointmentId === a.id ? '⏳ Chargement...' : '✅ Confirmer'}
                              </button>
                              <button
                                onClick={() => updateStatus(a.id, 'annulé')}
                                disabled={loadingAppointmentId === a.id}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                                  loadingAppointmentId === a.id 
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                                }`}>
                                {loadingAppointmentId === a.id ? '⏳ Chargement...' : '❌ Annuler'}
                              </button>
                            </div>
                          )}

                          {a.status === 'confirmé' && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => updateStatus(a.id, 'terminé')}
                                disabled={loadingAppointmentId === a.id}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                                  loadingAppointmentId === a.id 
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                    : 'text-white'
                                }`}
                                style={{ 
                                  backgroundColor: loadingAppointmentId === a.id ? '#9ca3af' : '#1a2b4a' 
                                }}>
                                {loadingAppointmentId === a.id ? '⏳ Chargement...' : '🏁 Marquer Terminé'}
                              </button>
                              <button
                                onClick={() => updateStatus(a.id, 'annulé')}
                                disabled={loadingAppointmentId === a.id}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                                  loadingAppointmentId === a.id 
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                                }`}>
                                {loadingAppointmentId === a.id ? '⏳ Chargement...' : '❌ Annuler'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <button onClick={() => handleDelete(selected.id)}
                  className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 text-sm font-bold">
                  🗑️ Supprimer le patient
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
                <span className="text-5xl mb-3">👤</span>
                <p className="text-sm">Cliquez sur un patient pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
