import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PatientNavbar from '../../components/PatientNavbar';

const TREATMENT_ICONS = {
  'Obturation / Plombage': '🦷',
  'Détartrage': '✨',
  'Traitement de canal': '🔬',
  'Couronne dentaire': '👑',
  'Extraction dentaire': '🔧',
  'Orthodontie': '😁',
  'Implants dentaires': '⚙️',
  'Chirurgie buccale': '🏥',
  'Parodontologie': '🩺',
  'Blanchiment': '⭐',
};

export default function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [treatments, setTreatments] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Available time slots
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    api.get('/treatments').then(r => setTreatments(r.data)).catch(() => {});
    api.get('/doctors').then(r => {
      if (r.data.length > 0) setDoctorId(r.data[0].id);
    }).catch(() => {});
  }, []);

  const calculateEndTime = (date, time, duration) => {
    const start = new Date(`${date}T${time}:00`);
    const end = new Date(start.getTime() + duration * 60000);
    return end.toISOString().slice(0, 19).replace('T', ' ');
  };

  const getStartDateTime = () => {
    return `${selectedDate} ${selectedTime}:00`;
  };

  // التحقق من تعارض المواعيد
  const checkAvailability = async () => {
    if (!selectedDate || !selectedTime || !selectedTreatment) return false;
    setChecking(true);
    setError('');
    try {
      const startTime = getStartDateTime();
      const endTime = calculateEndTime(selectedDate, selectedTime, selectedTreatment.duration);
      
      // جرب ترسل request للـ API باش تتحقق
      await api.post('/appointments/check', {
        doctor_id:  doctorId,
        start_time: startTime,
        end_time:   endTime,
      });
      setChecking(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Ce créneau est déjà réservé. Veuillez choisir un autre horaire.');
      setChecking(false);
      return false;
    }
  };

  const handleNext = async () => {
    setError('');

    if (step === 1) {
      if (!selectedTreatment) {
        setError('Veuillez sélectionner un traitement.');
        return;
      }
      setStep(2);
    }

    if (step === 2) {
      if (!selectedDate) {
        setError('Veuillez sélectionner une date.');
        return;
      }
      if (!selectedTime) {
        setError('Veuillez sélectionner une heure.');
        return;
      }
      // تحقق من التوفر
      const available = await checkAvailability();
      if (available) setStep(3);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const startDateTime = `${selectedDate} ${selectedTime}:00`;
      const startMs = new Date(`${selectedDate}T${selectedTime}:00`).getTime();
      const endMs = startMs + (selectedTreatment.duration * 60 * 1000);
      const endDate = new Date(endMs);
      const endDateTime = `${endDate.getFullYear()}-${String(endDate.getMonth()+1).padStart(2,'0')}-${String(endDate.getDate()).padStart(2,'0')} ${String(endDate.getHours()).padStart(2,'0')}:${String(endDate.getMinutes()).padStart(2,'0')}:00`;

      await api.post('/appointments', {
        treatment_id: selectedTreatment.id,
        doctor_id:    doctorId,
        start_time:   startDateTime,
        end_time:     endDateTime,
      });

      setSuccess('Rendez-vous réservé avec succès!');
      setTimeout(() => navigate('/patient/appointments'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
      setLoading(false);
    }
  };

  // Minimum date = aujourd'hui
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar activePath="/patient/book" />

      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-700 mb-2">📅 Prendre Rendez-vous</h1>
        <p className="text-gray-400 text-sm mb-6">Réservez votre consultation en quelques étapes simples</p>

        {/* Steps */}
        <div className="flex items-center mb-8">
          {[
            { n: 1, label: 'Traitement' },
            { n: 2, label: 'Date & Heure' },
            { n: 3, label: 'Confirmation' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition ${
                  step > s.n ? 'text-white' :
                  step === s.n ? 'text-white' :
                  'bg-white border-gray-300 text-gray-400'
                }`} style={step >= s.n ? { backgroundColor: '#0d9488', borderColor: '#0d9488' } : {}}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className="text-xs mt-1 font-medium"
                  style={{ color: step >= s.n ? '#0d9488' : '#9ca3af' }}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className={`h-1 w-28 mb-4 mx-1 transition ${step > s.n ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Error / Success */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-4 flex items-center gap-2">
            <span>❌</span> {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-xl mb-4 flex items-center gap-2">
            <span>✅</span> {success} Redirection en cours...
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-6">

          {/* ==================== STEP 1 — Traitement ==================== */}
          {step === 1 && (
            <div>
              <h3 className="font-bold text-gray-700 mb-1 text-lg">Choisir le traitement</h3>
              <p className="text-gray-400 text-sm mb-4">Sélectionnez le soin dont vous avez besoin</p>

              <div className="grid grid-cols-2 gap-3">
                {treatments.map(t => (
                  <div key={t.id}
                    onClick={() => setSelectedTreatment(t)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                      selectedTreatment?.id === t.id
                        ? 'bg-teal-50'
                        : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'
                    }`}
                    style={selectedTreatment?.id === t.id ? { borderColor: '#0d9488' } : {}}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{TREATMENT_ICONS[t.name] || '🦷'}</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                        <p className="text-gray-400 text-xs mt-1">⏱ {t.duration} min</p>
                        <p className="font-bold text-sm mt-1" style={{ color: '#0d9488' }}>{t.price} MAD</p>
                      </div>
                      {selectedTreatment?.id === t.id && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                          style={{ backgroundColor: '#0d9488' }}>✓</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTreatment && (
                <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#f0fdfa' }}>
                  <p className="text-sm font-medium" style={{ color: '#0d9488' }}>
                    ✅ Traitement sélectionné: <strong>{selectedTreatment.name}</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{selectedTreatment.description}</p>
                </div>
              )}

              <button onClick={handleNext}
                style={{ backgroundColor: '#0d9488' }}
                className="w-full text-white py-3 rounded-xl font-bold mt-6 hover:opacity-90 transition">
                Suivant → Choisir la date
              </button>
            </div>
          )}

          {/* ==================== STEP 2 — Date & Heure ==================== */}
          {step === 2 && (
            <div>
              <h3 className="font-bold text-gray-700 mb-1 text-lg">Choisir la date et l'heure</h3>
              <p className="text-gray-400 text-sm mb-4">
                Durée estimée: <strong>{selectedTreatment?.duration} min</strong> — 
                Fin calculée automatiquement
              </p>

              {/* Date */}
              <div className="mb-4">
                <label className="block text-gray-600 text-sm mb-2 font-medium">📅 Date du rendez-vous</label>
                <input type="date"
                  min={today}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none text-gray-700"
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                    setError('');
                  }} />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <label className="block text-gray-600 text-sm mb-2 font-medium">🕐 Heure de début</label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map(time => (
                      <button key={time}
                        onClick={() => { setSelectedTime(time); setError(''); }}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition ${
                          selectedTime === time
                            ? 'text-white border-transparent'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-teal-300'
                        }`}
                        style={selectedTime === time ? { backgroundColor: '#0d9488' } : {}}>
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              {selectedDate && selectedTime && selectedTreatment && (
                <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm font-medium text-blue-700">📋 Récapitulatif du créneau:</p>
                  <p className="text-sm text-blue-600 mt-1">
                    🕐 Début: <strong>{new Date(`${selectedDate}T${selectedTime}`).toLocaleString('fr-FR')}</strong>
                  </p>
                  <p className="text-sm text-blue-600">
                    🕑 Fin estimée: <strong>
                      {new Date(new Date(`${selectedDate}T${selectedTime}`).getTime() + selectedTreatment.duration * 60000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </strong>
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => { setStep(1); setError(''); }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200">
                  ← Retour
                </button>
                <button onClick={handleNext} disabled={checking}
                  style={{ backgroundColor: '#0d9488' }}
                  className="w-full text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50">
                  {checking ? '⏳ Vérification...' : 'Vérifier & Continuer →'}
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 3 — Confirmation ==================== */}
          {step === 3 && (
            <div>
              <h3 className="font-bold text-gray-700 mb-1 text-lg">Confirmer le rendez-vous</h3>
              <p className="text-gray-400 text-sm mb-4">Vérifiez les détails avant de confirmer</p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span>{TREATMENT_ICONS[selectedTreatment?.name] || '🦷'}</span>
                    <span className="text-gray-500">Traitement</span>
                  </div>
                  <span className="font-bold text-gray-800">{selectedTreatment?.name}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span className="text-gray-500">Prix</span>
                  </div>
                  <span className="font-bold text-lg" style={{ color: '#0d9488' }}>
                    {selectedTreatment?.price} MAD
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span>⏱</span>
                    <span className="text-gray-500">Durée</span>
                  </div>
                  <span className="font-bold text-gray-800">{selectedTreatment?.duration} min</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span className="text-gray-500">Date</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {new Date(`${selectedDate}T${selectedTime}`).toLocaleDateString('fr-FR', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span>🕐</span>
                    <span className="text-gray-500">Horaire</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {selectedTime} → {new Date(
                      new Date(`${selectedDate}T${selectedTime}`).getTime() + selectedTreatment.duration * 60000
                    ).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl"
                  style={{ backgroundColor: '#fff7ed' }}>
                  <div className="flex items-center gap-2">
                    <span>⏳</span>
                    <span className="text-gray-500">Statut</span>
                  </div>
                  <span className="font-bold text-orange-500">En attente de confirmation</span>
                </div>
              </div>

              {/* Info message */}
              <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#f0fdfa' }}>
                <p className="text-sm" style={{ color: '#0d9488' }}>
                  ℹ️ Votre rendez-vous sera confirmé par l'administration dans les plus brefs délais. 
                  Vous pourrez suivre son statut dans "Mes Rendez-vous".
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setStep(2); setError(''); }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200">
                  ← Retour
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  style={{ backgroundColor: '#0d9488' }}
                  className="w-full text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition">
                  {loading ? '⏳ Envoi en cours...' : '✅ Confirmer le Rendez-vous'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}