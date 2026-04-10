import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AdminNavbar from '../../components/AdminNavbar.jsx';

export default function Settings() {
  const navigate = useNavigate();
  
  // Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    clinic_name: '',
    phone: '',
    email: '',
    address: '',
  });

  // Working Hours State - Detailed Daily Schedules
  const [workingHours, setWorkingHours] = useState({
    monday_open: '',
    monday_close: '',
    monday_closed: '0',
    tuesday_open: '',
    tuesday_close: '',
    tuesday_closed: '0',
    wednesday_open: '',
    wednesday_close: '',
    wednesday_closed: '0',
    thursday_open: '',
    thursday_close: '',
    thursday_closed: '0',
    friday_open: '',
    friday_close: '',
    friday_closed: '0',
    saturday_open: '',
    saturday_close: '',
    saturday_closed: '0',
    sunday_closed: '1',
    lunch_start: '',
    lunch_end: '',
  });

  // Services State
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    icon_name: '??',
    sort_order: 0,
    is_active: true
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
    fetchSettings();
    fetchServices();
    fetchTreatments();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      setBasicInfo(response.data);
      setWorkingHours({
        monday_open: response.data.monday_open,
        monday_close: response.data.monday_close,
        monday_closed: response.data.monday_closed,
        tuesday_open: response.data.tuesday_open,
        tuesday_close: response.data.tuesday_close,
        tuesday_closed: response.data.tuesday_closed,
        wednesday_open: response.data.wednesday_open,
        wednesday_close: response.data.wednesday_close,
        wednesday_closed: response.data.wednesday_closed,
        thursday_open: response.data.thursday_open,
        thursday_close: response.data.thursday_close,
        thursday_closed: response.data.thursday_closed,
        friday_open: response.data.friday_open,
        friday_close: response.data.friday_close,
        friday_closed: response.data.friday_closed,
        saturday_open: response.data.saturday_open,
        saturday_close: response.data.saturday_close,
        saturday_closed: response.data.saturday_closed,
        sunday_closed: response.data.sunday_closed,
        lunch_start: response.data.lunch_start,
        lunch_end: response.data.lunch_end,
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchTreatments = async () => {
    try {
      const response = await api.get('/treatments');
      setTreatments(response.data);
    } catch (err) {
      console.error('Error fetching treatments:', err);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const allSettings = {
        ...basicInfo,
        ...workingHours,
      };
      
      await api.post('/settings', allSettings);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Services CRUD
  const addService = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.post('/services', newService);
      setNewService({ name: '', description: '', icon_name: '??', sort_order: 0, is_active: true });
      setSuccess('Service added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchServices();
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
      
      await api.put(`/services/${id}`, updates);
      setSuccess('Service updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchServices();
    } catch (err) {
      console.error('Error updating service:', err);
      setError('Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.delete(`/services/${id}`);
      setSuccess('Service deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchServices();
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service');
    } finally {
      setLoading(false);
    }
  };

  // Treatments CRUD
  const addTreatment = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.post('/treatments', newTreatment);
      setNewTreatment({ name: '', description: '', category: 'general', price: '', duration: '60' });
      setSuccess('Treatment added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchTreatments();
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
      
      const response = await api.put(`/treatments/${id}`, updates);
      
      // Update local state with the response data
      if (response.data.treatment) {
        setTreatments(prev => 
          prev.map(t => t.id === id ? response.data.treatment : t)
        );
      }
      
      setSuccess('Treatment updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating treatment:', err);
      setError(err.response?.data?.message || 'Failed to update treatment');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const deleteTreatment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this treatment?')) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.delete(`/treatments/${id}`);
      setSuccess('Treatment deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchTreatments();
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Clinic Settings</h1>

        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="border-b">
            <div className="flex">
              {[
                { id: 'basic', label: 'Basic Info' },
                { id: 'hours', label: 'Working Hours' },
                { id: 'services', label: 'Services' },
                { id: 'treatments', label: 'Traitements' },
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
                <h3 className="text-xl font-bold text-gray-800 mb-6">Basic Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Clinic Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                      value={basicInfo.clinic_name}
                      onChange={e => setBasicInfo({...basicInfo, clinic_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Phone</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                      value={basicInfo.phone}
                      onChange={e => setBasicInfo({...basicInfo, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                      value={basicInfo.email}
                      onChange={e => setBasicInfo({...basicInfo, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Address</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                      value={basicInfo.address}
                      onChange={e => setBasicInfo({...basicInfo, address: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={saveSettings}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Working Hours Tab */}
            {activeTab === 'hours' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Working Hours (24-hour format)</h3>
                
                {/* Monday to Friday Group */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-medium text-gray-800 mb-4">Lundi - Vendredi</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Heure d'ouverture</label>
                      <input
                        type="time"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        value={workingHours.monday_open}
                        onChange={e => setWorkingHours({...workingHours, 
                          monday_open: e.target.value, 
                          tuesday_open: e.target.value,
                          wednesday_open: e.target.value,
                          thursday_open: e.target.value,
                          friday_open: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Heure de fermeture</label>
                      <input
                        type="time"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        value={workingHours.monday_close}
                        onChange={e => setWorkingHours({...workingHours, 
                          monday_close: e.target.value,
                          tuesday_close: e.target.value,
                          wednesday_close: e.target.value,
                          thursday_close: e.target.value,
                          friday_close: e.target.value
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Saturday */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-medium text-gray-800 mb-4">Samedi</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Heure d'ouverture</label>
                      <input
                        type="time"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        value={workingHours.saturday_open}
                        onChange={e => setWorkingHours({...workingHours, saturday_open: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Heure de fermeture</label>
                      <input
                        type="time"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        value={workingHours.saturday_close}
                        onChange={e => setWorkingHours({...workingHours, saturday_close: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Sunday */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-medium text-gray-800 mb-4">Dimanche</h4>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-3 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      checked={workingHours.sunday_closed === '1'}
                      onChange={e => setWorkingHours({...workingHours, sunday_closed: e.target.checked ? '1' : '0'})}
                    />
                    <label className="text-gray-700 font-medium">Fermé (Dimanche)</label>
                  </div>
                </div>

                {/* Lunch Break */}
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h4 className="font-medium text-gray-800 mb-4">Pause Déjeuner</h4>
                  <p className="text-gray-600 text-sm mb-4">Les rendez-vous ne seront pas disponibles pendant cette période</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Début</label>
                      <input
                        type="time"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        value={workingHours.lunch_start}
                        onChange={e => setWorkingHours({...workingHours, lunch_start: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Fin</label>
                      <input
                        type="time"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        value={workingHours.lunch_end}
                        onChange={e => setWorkingHours({...workingHours, lunch_end: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={saveSettings}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Services Management</h3>
                
                {/* Add New Service */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-800 mb-4">Add New Service</h4>
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Icon</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        value={newService.icon_name}
                        onChange={e => setNewService({...newService, icon_name: e.target.value})}
                        placeholder="??"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        value={newService.name}
                        onChange={e => setNewService({...newService, name: e.target.value})}
                        placeholder="Service name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        value={newService.description}
                        onChange={e => setNewService({...newService, description: e.target.value})}
                        placeholder="Service description"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Sort Order</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        value={newService.sort_order}
                        onChange={e => setNewService({...newService, sort_order: parseInt(e.target.value) || 0})}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={addService}
                        disabled={loading}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? 'Adding...' : 'Add Service'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Existing Services */}
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={service.id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-6 gap-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Icon</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                            value={service.icon_name}
                            onChange={e => updateService(service.id, { icon_name: e.target.value })}
                            placeholder="??"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                            value={service.name}
                            onChange={e => updateService(service.id, { name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                            value={service.description}
                            onChange={e => updateService(service.id, { description: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Sort Order</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                            value={service.sort_order}
                            onChange={e => updateService(service.id, { sort_order: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="text-2xl">{service.icon_name}</div>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => deleteService(service.id)}
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {services.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No services available</p>
                  )}
                </div>
              </div>
            )}

            {/* Treatments Tab */}
            {activeTab === 'treatments' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Traitements Management</h3>
                
                {/* Add New Treatment */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-800 mb-4">Add New Treatment</h4>
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        value={newTreatment.name}
                        onChange={e => setNewTreatment({...newTreatment, name: e.target.value})}
                        placeholder="Treatment name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        value={newTreatment.description}
                        onChange={e => setNewTreatment({...newTreatment, description: e.target.value})}
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Price (MAD)</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        value={newTreatment.price}
                        onChange={e => setNewTreatment({...newTreatment, price: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Duration (min)</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
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
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Treatment'}
                    </button>
                  </div>
                </div>

                {/* Existing Treatments */}
                <div className="space-y-4">
                  {treatments.map((treatment, index) => (
                    <div key={treatment.id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-6 gap-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                            value={treatment.name}
                            onChange={e => updateTreatment(treatment.id, { name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
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
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                            value={treatment.description || ''}
                            onChange={e => updateTreatment(treatment.id, { description: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Price (MAD)</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                            value={treatment.price}
                            onChange={e => updateTreatment(treatment.id, { price: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Duration (min)</label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
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
                            className="bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {treatments.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No treatments available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
