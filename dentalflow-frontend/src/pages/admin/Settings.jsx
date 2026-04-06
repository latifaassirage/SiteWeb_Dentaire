import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AdminNavbar from '../../components/AdminNavbar.jsx';

export default function Settings() {
  const navigate = useNavigate();
  
  // Basic Info State
  const [clinicInfo, setClinicInfo] = useState({
    clinic_name: '',
    email: '',
    phone: '',
    address: '',
  });

  // Working Hours State
  const [workingHours, setWorkingHours] = useState({
    monday_friday: ['', ''],
    saturday: '',
    sunday: '',
  });

  // Services State
  const [services, setServices] = useState([
    { id: 1, title: 'Consultation Générale', description: 'Examen dentaire complet et diagnostic', icon_name: '🦷' },
    { id: 2, title: 'Blanchiment Dentaire', description: 'Techniques modernes pour un sourire éclatant', icon_name: '✨' },
    { id: 3, title: 'Orthodontie', description: 'Correction de l\'alignement dentaire', icon_name: '🦷' },
    { id: 4, title: 'Implants Dentaires', description: 'Solutions permanentes pour dents manquantes', icon_name: '🔧' },
  ]);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    icon_name: '🦷',
  });

  // Treatments State
  const [treatments, setTreatments] = useState([]);
  const [newTreatment, setNewTreatment] = useState({
    name: '',
    description: '',
    category: 'general',
    price: '',
    duration: '60',
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to access settings');
        return;
      }
      
      // Fetch clinic info (public endpoint)
      const response = await api.get('/clinic-info');
      
      if (response.data) {
        setClinicInfo(response.data);
      }
      
      // Set default data for services and treatments (no API calls)
      setServices([
        { id: 1, title: 'Consultation et Diagnostic', description: 'Examen dentaire complet', icon_name: '🦷' },
        { id: 2, title: 'Hygiène Dentaire', description: 'Nettoyage professionnel', icon_name: '✨' },
        { id: 3, title: 'Blanchiment Dentaire', description: 'Sourire éclatant', icon_name: '🌟' },
        { id: 4, title: 'Orthodontie', description: 'Correction de l\'alignement dentaire', icon_name: '🦷' },
      ]);
      
      setTreatments([
        { id: 1, name: 'Consultation', price: 200, category: 'general', description: 'Consultation générale' },
        { id: 2, name: 'Détartrage', price: 300, category: 'preventive', description: 'Nettoyage professionnel' },
        { id: 3, name: 'Obturation', price: 400, category: 'conservateur', description: 'Traitement des caries' },
        { id: 4, name: 'Couronne', price: 800, category: 'prothese', description: 'Protection dentaire' },
      ]);
      
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const saveClinicInfo = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.put('/clinic-settings/info', clinicInfo);
      setSuccess('✅ Clinic information updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving clinic info:', err);
      setError('Failed to save clinic information');
    } finally {
      setLoading(false);
    }
  };

  const saveWorkingHours = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.put('/clinic-settings/hours', workingHours);
      setSuccess('✅ Working hours updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving working hours:', err);
      setError('Failed to save working hours');
    } finally {
      setLoading(false);
    }
  };

  const addService = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const newServiceData = {
        title: newService.title,
        description: newService.description,
        icon_name: newService.icon_name,
        sort_order: services.length + 1,
      };
      
      const response = await api.post('/clinic-settings/services', newServiceData);
      setServices([...services, response.data.service]);
      setNewService({ title: '', description: '', icon_name: '🦷' });
      setSuccess('✅ Service added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding service:', err);
      setError('Failed to add service');
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (id, updates) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Update local state first for immediate feedback
      setServices(services.map(s => s.id === id ? { ...s, ...updates } : s));
      
      // Then update on server
      await api.put('/clinic-settings/services', { services: services.map(s => s.id === id ? { ...s, ...updates } : s) });
      setSuccess('✅ Service updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating service:', err);
      setError('Failed to update service');
      // Revert local changes on error
      fetchAllSettings();
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.delete(`/clinic-settings/services/${id}`);
      setServices(services.filter(s => s.id !== id));
      setSuccess('✅ Service deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service');
    } finally {
      setLoading(false);
    }
  };

  const addTreatment = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      if (!newTreatment.name || !newTreatment.price || !newTreatment.category) {
        setError('Please fill in treatment name, category, and price');
        return;
      }
      
      const response = await api.post('/clinic-settings/treatments', newTreatment);
      setTreatments([...treatments, response.data.treatment]);
      setNewTreatment({ name: '', description: '', category: 'general', price: '', duration: '60' });
      setSuccess('✅ Treatment added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding treatment:', err);
      setError('Failed to add treatment');
    } finally {
      setLoading(false);
    }
  };

  const updateTreatment = async (id, updates) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.put(`/clinic-settings/treatments/${id}`, updates);
      setTreatments(treatments.map(t => t.id === id ? { ...t, ...updates } : t));
      setSuccess('✅ Treatment updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating treatment:', err);
      setError('Failed to update treatment');
    } finally {
      setLoading(false);
    }
  };

  const deleteTreatment = async (id) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.delete(`/clinic-settings/treatments/${id}`);
      setTreatments(treatments.filter(t => t.id !== id));
      setSuccess('✅ Treatment deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting treatment:', err);
      setError('Failed to delete treatment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar activePath="/admin/settings" />
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">⚙️ Clinic Settings</h1>

        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 border border-green-200">
            ✅ {success}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                ❌ {error}
              </div>
              <button
                onClick={fetchAllSettings}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                🔄 Retry
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="border-b">
            <div className="flex">
              {[
                { id: 'basic', label: '🏥 Basic Info', icon: '🏥' },
                { id: 'hours', label: '🕐 Working Hours', icon: '🕐' },
                { id: 'services', label: '🎯 Services', icon: '🎯' },
                { id: 'treatments', label: '💊 Treatments', icon: '💊' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Clinic Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Clinic Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={clinicInfo.clinic_name}
                      onChange={e => setClinicInfo({...clinicInfo, clinic_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={clinicInfo.email}
                      onChange={e => setClinicInfo({...clinicInfo, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Phone</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={clinicInfo.phone}
                      onChange={e => setClinicInfo({...clinicInfo, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Address</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={clinicInfo.address}
                      onChange={e => setClinicInfo({...clinicInfo, address: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={saveClinicInfo}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? '⏳ Saving...' : '💾 Save Clinic Info'}
                  </button>
                </div>
              </div>
            )}

            {/* Working Hours Tab */}
            {activeTab === 'hours' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Working Hours (Horaires)</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Monday - Friday</label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={workingHours.monday_friday[0]}
                          onChange={e => setWorkingHours({
                            ...workingHours,
                            monday_friday: [e.target.value, workingHours.monday_friday[1]]
                          })}
                          placeholder="08:00-13:00"
                        />
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={workingHours.monday_friday[1]}
                          onChange={e => setWorkingHours({
                            ...workingHours,
                            monday_friday: [workingHours.monday_friday[0], e.target.value]
                          })}
                          placeholder="14:00-18:00"
                        />
                        <p className="text-xs text-gray-500">Lunch break: 13:00 - 14:00 (Fermé)</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Saturday</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={workingHours.saturday}
                        onChange={e => setWorkingHours({...workingHours, saturday: e.target.value})}
                        placeholder="08:00-14:30"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Sunday</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                        value={workingHours.sunday}
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Sunday is always closed</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={saveWorkingHours}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? '⏳ Saving...' : '💾 Save Working Hours'}
                  </button>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Services Manager (Homepage Cards)</h3>
                
                {/* Add New Service */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-800 mb-4">Add New Service</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Icon</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newService.icon_name}
                        onChange={e => setNewService({...newService, icon_name: e.target.value})}
                        placeholder="🦷"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newService.title}
                        onChange={e => setNewService({...newService, title: e.target.value})}
                        placeholder="Service title"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newService.description}
                        onChange={e => setNewService({...newService, description: e.target.value})}
                        placeholder="Service description"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={addService}
                        disabled={loading}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? '⏳ Adding...' : '➕ Add Service'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Existing Services */}
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={`service-${service.id}-${index}`} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-5 gap-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Icon</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={service.icon_name}
                            onChange={e => updateService(service.id, { icon_name: e.target.value })}
                            placeholder="🦷"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Title</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={service.title}
                            onChange={e => updateService(service.id, { title: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={service.description}
                            onChange={e => updateService(service.id, { description: e.target.value })}
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="text-2xl">{service.icon_name}</div>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => deleteService(service.id)}
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            �️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Treatments Tab */}
            {activeTab === 'treatments' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Treatments Manager (Prices for Invoices)</h3>
                
                {/* Add New Treatment */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-800 mb-4">Add New Treatment</h4>
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newTreatment.name}
                        onChange={e => setNewTreatment({...newTreatment, name: e.target.value})}
                        placeholder="Treatment name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newTreatment.category}
                        onChange={e => setNewTreatment({...newTreatment, category: e.target.value})}
                      >
                        <option value="general">General</option>
                        <option value="cosmetic">Cosmetic</option>
                        <option value="surgical">Surgical</option>
                        <option value="orthodontic">Orthodontic</option>
                        <option value="preventive">Preventive</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newTreatment.description}
                        onChange={e => setNewTreatment({...newTreatment, description: e.target.value})}
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Price (MAD)</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newTreatment.price}
                        onChange={e => setNewTreatment({...newTreatment, price: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Duration (min)</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newTreatment.duration}
                        onChange={e => setNewTreatment({...newTreatment, duration: e.target.value})}
                      >
                        <option value="30">30 min</option>
                        <option value="60">60 min</option>
                        <option value="90">90 min</option>
                        <option value="120">120 min</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={addTreatment}
                      disabled={loading}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? '⏳ Adding...' : '➕ Add Treatment'}
                    </button>
                  </div>
                </div>

                {/* Existing Treatments */}
                <div className="space-y-4">
                  {treatments.map((treatment, index) => (
                    <div key={`treatment-${treatment.id}-${index}`} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-6 gap-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={treatment.name}
                            onChange={e => updateTreatment(treatment.id, { name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={treatment.category}
                            onChange={e => updateTreatment(treatment.id, { category: e.target.value })}
                          >
                            <option value="general">General</option>
                            <option value="cosmetic">Cosmetic</option>
                            <option value="surgical">Surgical</option>
                            <option value="orthodontic">Orthodontic</option>
                            <option value="preventive">Preventive</option>
                            <option value="emergency">Emergency</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={treatment.description || ''}
                            onChange={e => updateTreatment(treatment.id, { description: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Price (MAD)</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={treatment.price}
                            onChange={e => updateTreatment(treatment.id, { price: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Duration (min)</label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={treatment.duration}
                            onChange={e => updateTreatment(treatment.id, { duration: parseInt(e.target.value) })}
                          >
                            <option value="30">30 min</option>
                            <option value="60">60 min</option>
                            <option value="90">90 min</option>
                            <option value="120">120 min</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => deleteTreatment(treatment.id)}
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
