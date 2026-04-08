import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Landing() {
  const navigate = useNavigate();
  const [clinicInfo, setClinicInfo] = useState({
    clinic_name: 'DentalFlow',
    phone: '+212 600-000-000',
    email: 'contact@dentalflow.ma',
    address: 'GUELMIM, Maroc',
    // Detailed working hours
    monday_open: '09:00',
    monday_close: '19:00',
    monday_closed: '0',
    tuesday_open: '09:00',
    tuesday_close: '19:00',
    tuesday_closed: '0',
    wednesday_open: '09:00',
    wednesday_close: '19:00',
    wednesday_closed: '0',
    thursday_open: '09:00',
    thursday_close: '19:00',
    thursday_closed: '0',
    friday_open: '09:00',
    friday_close: '19:00',
    friday_closed: '0',
    saturday_open: '09:00',
    saturday_close: '13:00',
    saturday_closed: '0',
    sunday_closed: '1',
    lunch_start: '12:00',
    lunch_end: '14:00',
  });
  const [services, setServices] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/settings')
        .then(r => setClinicInfo(r.data))
        .catch(() => {});
    axios.get('http://127.0.0.1:8000/api/services')
        .then(r => setServices(r.data))
        .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="px-8 py-4 flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦷</span>
          <span className="text-xl font-bold" style={{ color: '#1a2b4a' }}>Dental<span style={{ color: '#0ea5e9' }}>Flow</span></span>
        </div>
        <div className="flex gap-8">
          <button className="text-gray-600 hover:text-teal-500 text-sm font-medium">Accueil</button>
          <button onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
            className="text-gray-600 hover:text-teal-500 text-sm font-medium">Services</button>
          <button onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
            className="text-gray-600 hover:text-teal-500 text-sm font-medium">Contact</button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/login')}
            className="text-gray-700 font-medium text-sm px-4 py-2 hover:text-teal-500">
            Connexion
          </button>
          <button onClick={() => navigate('/register')}
            style={{ backgroundColor: '#0d9488' }}
            className="text-white text-sm px-5 py-2 rounded-lg font-medium hover:opacity-90">
            S'inscrire
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="px-12 py-16 max-w-6xl mx-auto flex items-center justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
            🏥 Cabinet Dentaire Moderne à Guelmim
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
            Un sourire sain <br />commence <span style={{ color: '#0d9488' }}>ici.</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Prenez rendez-vous en ligne en moins de 2 minutes. Suivez vos soins, téléchargez vos ordonnances et gérez votre santé dentaire en toute simplicité.
          </p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/register')}
              style={{ backgroundColor: '#0d9488' }}
              className="text-white px-7 py-3 rounded-lg font-bold hover:opacity-90 text-sm">
              Prendre Rendez-vous
            </button>
            <button onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
              className="text-gray-700 px-7 py-3 rounded-lg font-bold text-sm border border-gray-200 hover:bg-gray-50">
              Nos Services
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="relative">
          <div className="w-96 h-80 rounded-2xl overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600"
              alt="Dental"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">⭐</span>
              <span className="font-bold text-gray-800">4.9/5</span>
            </div>
            <p className="text-gray-400 text-xs">Basé sur 1000+ avis patients</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ backgroundColor: '#f0fdfa' }} className="py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-4xl font-bold" style={{ color: '#0d9488' }}>500+</p>
            <p className="text-gray-500 mt-1">Patients Satisfaits</p>
          </div>
          <div>
            <p className="text-4xl font-bold" style={{ color: '#0d9488' }}>10+</p>
            <p className="text-gray-500 mt-1">Années d'Expérience</p>
          </div>
          <div>
            <p className="text-4xl font-bold" style={{ color: '#0d9488' }}>24/7</p>
            <p className="text-gray-500 mt-1">Prise de RDV en Ligne</p>
          </div>
        </div>
      </div>

      {/* Services */}
      <div id="services" className="py-16 px-8 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Nos Services</h2>
        <p className="text-center text-gray-400 mb-10">Des soins dentaires complets pour toute la famille</p>
        <div className="grid grid-cols-3 gap-6">
          {services.length > 0 ? services.map((service, i) => (
            <div key={service.id || i}
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition border-t-4"
              style={{ borderColor: '#0d9488' }}>
              <div className="text-4xl mb-3">{service.icon_name || '🦷'}</div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{service.name || service.title}</h3>
              <p className="text-gray-500 text-sm">{service.description}</p>
            </div>
          )) : (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No services available
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div style={{ backgroundColor: '#0d9488' }} className="py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Prêt à prendre votre rendez-vous?</h2>
        <p className="text-teal-100 mb-8">Créez votre compte et réservez en moins de 2 minutes</p>
        <button onClick={() => navigate('/register')}
          className="bg-white font-bold px-10 py-4 rounded-lg text-lg hover:bg-teal-50"
          style={{ color: '#0d9488' }}>
          Commencer Maintenant →
        </button>
      </div>

      {/* Contact */}
      <div id="contact" className="py-12 px-8 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Nous Contacter</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-5">
            <div className="text-3xl mb-2">📍</div>
            <p className="font-bold text-gray-700">Adresse</p>
            <p className="text-gray-500 text-sm mt-1">{clinicInfo.address}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <div className="text-3xl mb-2">📞</div>
            <p className="font-bold text-gray-700">Téléphone</p>
            <p className="text-gray-500 text-sm mt-1">{clinicInfo.phone}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <div className="text-3xl mb-2">📧</div>
            <p className="font-bold text-gray-700">Email</p>
            <p className="text-gray-500 text-sm mt-1">{clinicInfo.email}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 mt-6 max-w-2xl mx-auto">
          <div className="text-3xl mb-3">🕐</div>
          <p className="font-bold text-gray-700 mb-3">Horaires d'Ouverture</p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm border-b pb-2">
              <span className="text-gray-600 font-medium">Lundi - Vendredi:</span>
              <span className="font-bold text-gray-800">
                {clinicInfo.monday_closed === '1' ? 'Fermé' : `${clinicInfo.monday_open} - ${clinicInfo.monday_close}`}
              </span>
            </div>
            <div className="flex justify-between text-sm border-b pb-2">
              <span className="text-gray-600 font-medium">Samedi:</span>
              <span className="font-bold text-gray-800">
                {clinicInfo.saturday_closed === '1' ? 'Fermé' : `${clinicInfo.saturday_open} - ${clinicInfo.saturday_close}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Dimanche:</span>
              <span className="font-bold text-red-600">
                {clinicInfo.sunday_closed === '1' ? 'Fermé' : `${clinicInfo.sunday_open || '09:00'} - ${clinicInfo.sunday_close || '19:00'}`}
              </span>
            </div>
            {clinicInfo.lunch_start && clinicInfo.lunch_end && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">⚠️ Pause Déjeuner:</span> {clinicInfo.lunch_start} - {clinicInfo.lunch_end}
                  <br />
                  <span className="text-xs">Les rendez-vous ne sont pas disponibles pendant cette période</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 text-center">
        <div className="flex justify-center items-center gap-2 mb-3">
          <span className="text-xl">🦷</span>
          <span className="text-white font-bold text-lg">{clinicInfo.clinic_name}</span>
        </div>
        <div className="flex justify-center gap-6 mb-3">
          <span className="text-sm">📞 {clinicInfo.phone}</span>
          <span className="text-sm">📧 {clinicInfo.email}</span>
        </div>
        <p className="text-sm">© 2026 {clinicInfo.clinic_name}. {clinicInfo.address}. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
