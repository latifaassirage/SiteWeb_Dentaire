import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AdminNavbar from '../../components/AdminNavbar.jsx';

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8);
const DAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];

const statusColors = {
  en_attente: '#fb923c', // Orange
  confirmé:   '#22c55e', // Green  
  annulé:     '#ef4444', // Red
  terminé:    '#3b82f6', // Blue
  absent:     '#a855f7', // Orange/Yellow
};

function getWeekDays(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return Array.from({ length: 6 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });
}

export default function Agenda() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [search, setSearch] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const weekDays = getWeekDays(new Date(currentDate));

  useEffect(() => {
    api.get('/appointments').then(r => setAppointments(r.data)).catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(new Date(d));
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(new Date(d));
  };

  const handleConfirm = async (e, id) => {
    e.stopPropagation();
    await api.put(`/appointments/${id}/confirm`);
    setAppointments(prev => prev.map(a => a.id === id ? {...a, status: 'confirmé'} : a));
  };

  const handleAnnuler = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Annuler ce rendez-vous?')) return;
    await api.put(`/appointments/${id}`, {
      status: 'annulé',
      cancellation_reason: "Votre rendez-vous a été annulé par l'administration. Veuillez choisir un autre créneau."
    });
    setAppointments(prev => prev.map(a => a.id === id ? {
      ...a,
      status: 'annulé',
      cancellation_reason: "Votre rendez-vous a été annulé par l'administration. Veuillez choisir un autre créneau."
    } : a));
  };

  const handleAbsent = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Marquer ce rendez-vous comme absent?')) return;
    try {
      await api.put(`/appointments/${id}`, {
        status: 'absent',
        note: "Patient marqué comme absent par l'administration."
      });
      setAppointments(prev => prev.map(a => a.id === id ? {...a, status: 'absent'} : a));
      alert('Rendez-vous marqué comme absent avec succès!');
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la mise à jour du rendez-vous: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleTermine = async (e, id) => {
    e.stopPropagation();
    try {
      // Get appointment details to create payment record
      const appointment = appointments.find(a => a.id === id);
      if (!appointment) {
        alert('Erreur: Rendez-vous non trouvé');
        return;
      }

      // Update appointment status to completed - backend will handle payment creation
      const response = await api.put(`/appointments/${id}/status`, { status: 'completed' });
      
      // Update local state with response data
      setAppointments(prev => prev.map(a => a.id === id ? {...a, status: response.data.status || 'terminé'} : a));
      
      // Refresh appointments data to get latest state
      const appointmentsResponse = await api.get('/appointments');
      setAppointments(appointmentsResponse.data);
      
      // Show success message
      alert('Rendez-vous terminé et paiement enregistré avec succès!');
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la mise à jour du rendez-vous: ' + (error.response?.data?.message || error.message));
    }
  };

  const getAppointmentsForDayAndHour = (day, hour) => {
    return appointments.filter(a => {
      const start = new Date(a.start_time);
      return (
        start.toDateString() === day.toDateString() &&
        start.getHours() === hour &&
        (search === '' || a.patient?.name?.toLowerCase().includes(search.toLowerCase()))
      );
    });
  };

  const monthYear = weekDays[0].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use Shared AdminNavbar Component */}
      <AdminNavbar />
      
      <div className="p-4">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button onClick={prevWeek}
              className="px-3 py-2 rounded-lg bg-white shadow hover:bg-gray-50 text-gray-600 font-bold">
              ← Semaine précédente
            </button>
            <button onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 rounded-lg font-bold text-white"
              style={{ backgroundColor: '#1a2b4a' }}>
              📅 Aujourd'hui
            </button>
            <button onClick={nextWeek}
              className="px-3 py-2 rounded-lg bg-white shadow hover:bg-gray-50 text-gray-600 font-bold">
              Semaine suivante →
            </button>
            <span className="font-bold text-gray-700 capitalize ml-2">{monthYear}</span>
          </div>
          <input type="text" placeholder="🔍 Rechercher un patient..."
            className="border border-gray-200 px-3 py-2 rounded-lg text-sm bg-white shadow-sm"
            value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Modern Status Legend */}
        <div className="flex gap-6 mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
          {[
            { label: 'Confirmé', color: '#22c55e', icon: '✅' },
            { label: 'En attente', color: '#fb923c', icon: '⏳' },
            { label: 'Annulé', color: '#ef4444', icon: '❌' },
            { label: 'Terminé', color: '#3b82f6', icon: '🏁' },
            { label: 'Absent', color: '#a855f7', icon: '🔕' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <div className="w-4 h-4 rounded-full shadow-sm border border-white/50" style={{ backgroundColor: s.color }}></div>
              <span className="flex items-center gap-1">
                <span>{s.icon}</span>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Modern Calendar Grid */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="grid border-b" style={{ gridTemplateColumns: '80px repeat(6, 1fr)' }}>
            <div className="p-3 border-r bg-gradient-to-r from-blue-50 to-indigo-50"></div>
            {weekDays.map((day, i) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={i} className={`p-3 text-center border-r ${isToday ? 'bg-gradient-to-b from-blue-100 to-blue-50' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{DAYS[i]}</p>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mt-2 text-sm font-bold shadow-sm transition-all ${
                    isToday ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-white text-gray-700 border border-gray-200'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: '650px' }}>
            {HOURS.map(hour => (
              <div key={hour} className="grid border-b hover:bg-gray-50 transition-colors" style={{ gridTemplateColumns: '80px repeat(6, 1fr)', minHeight: '90px' }}>
                <div className="p-3 border-r bg-gradient-to-r from-gray-50 to-gray-100 text-xs font-semibold text-gray-600 text-right pr-4">
                  <div className="flex flex-col items-end">
                    <span>{hour}:00</span>
                    <span className="text-gray-400 text-xs mt-1">{hour + 1}:00</span>
                  </div>
                </div>
                {weekDays.map((day, i) => {
                  const dayApps = getAppointmentsForDayAndHour(day, hour);
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <div key={i} className={`border-r p-2 relative ${isToday ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'} transition-colors`}>
                      {dayApps.map(a => (
                        <div key={a.id}
                          className="rounded-lg p-2 mb-2 text-white text-xs shadow-md hover:shadow-lg transition-all cursor-pointer border border-white/20"
                          style={{ backgroundColor: statusColors[a.status] || '#6b7280' }}>
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-white truncate flex-1">{a.patient?.name}</p>
                            <span className="text-white/80 text-xs">#{a.id}</span>
                          </div>
                          <p className="text-white/90 truncate mb-1">{a.treatment?.name}</p>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-white/75 text-xs">
                              {new Date(a.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {a.treatment?.price && (
                              <span className="text-white/90 text-xs font-bold">{a.treatment.price} MAD</span>
                            )}
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {/* State: en_attente - Show Confirmer and Annuler */}
                            {a.status === 'en_attente' && (
                              <>
                                <button onClick={e => handleConfirm(e, a.id)}
                                  className="bg-white/90 text-green-600 px-2 py-1 rounded text-xs font-bold hover:bg-white transition-colors shadow-sm">
                                  ✓ Confirmer
                                </button>
                                <button onClick={e => handleAnnuler(e, a.id)}
                                  className="bg-white/90 text-red-600 px-2 py-1 rounded text-xs font-bold hover:bg-white transition-colors shadow-sm">
                                  ✕ Annuler
                                </button>
                              </>
                            )}
                            
                            {/* State: confirmé - Show Terminé and Absent */}
                            {a.status === 'confirmé' && (
                              <>
                                <button onClick={e => handleTermine(e, a.id)}
                                  className="bg-white/90 text-blue-600 px-2 py-1 rounded text-xs font-bold hover:bg-white transition-colors shadow-sm">
                                  🏁 Terminé
                                </button>
                                <button onClick={e => handleAbsent(e, a.id)}
                                  className="bg-white/90 text-orange-600 px-2 py-1 rounded text-xs font-bold hover:bg-white transition-colors shadow-sm">
                                    🔕 Absent
                                </button>
                              </>
                            )}
                            
                            {/* State: terminé - No action buttons (completed) */}
                            {a.status === 'terminé' && (
                              <div className="bg-white/90 text-gray-500 px-2 py-1 rounded text-xs font-bold">
                                ✅ Complété
                              </div>
                            )}
                            
                            {/* State: annulé - No action buttons (cancelled) */}
                            {a.status === 'annulé' && (
                              <div className="bg-white/90 text-gray-500 px-2 py-1 rounded text-xs font-bold">
                                ❌ Annulé
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
