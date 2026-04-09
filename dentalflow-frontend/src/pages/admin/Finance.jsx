import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import AdminNavbar from '../../components/AdminNavbar.jsx';

export default function Finance() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ today: 0, month: 0, total: 0, unpaid: 0 });
  const [dailyData, setDailyData] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Load all data
    const loadData = async () => {
      try {
        // Get invoices directly from database
        const response = await api.get('/invoices');
        setInvoices(response.data || []);
        
        // Load other data
        api.get('/finance/stats').then(r => setStats(r.data)).catch(() => {});
        api.get('/finance/daily-revenue').then(r => setDailyData(r.data)).catch(() => {});
      } catch (error) {
        console.error('Error loading invoices:', error);
      }
    };
    
    loadData();
  }, []);

  const handlePay = async (item) => {
    // Find the item to get amount for confirmation
    const amount = item ? (parseFloat(item.amount) || 0).toLocaleString('fr-FR') : '0';
    
    // Show confirmation popup
    const confirmed = window.confirm(`Confirmer le paiement en espèces de ${amount} MAD ?`);
    
    if (confirmed) {
      try {
        // Handle invoice payment
        await api.put(`/invoices/${item.id}/pay`);
        
        // Refresh data
        const response = await api.get('/invoices');
        setInvoices(response.data || []);
        api.get('/finance/stats').then(r => setStats(r.data)).catch(() => {});
        api.get('/finance/daily-revenue').then(r => setDailyData(r.data)).catch(() => {});
      } catch (error) {
        console.error('Error marking as paid:', error);
        alert('Erreur lors de la confirmation du paiement');
      }
    }
  };

  // Format data for chart - show day number instead of full date
  const chartData = dailyData.map(item => ({
    day: new Date(item.date).getDate(),
    date: item.date,
    total: item.total
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar activePath="/admin/finance" />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-700 mb-6">💰 Finance (Invoices & Payments)</h1>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Today's Revenue</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {stats.today?.toLocaleString() || 0} <span className="text-lg">MAD</span>
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Monthly Revenue</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {stats.month?.toLocaleString() || 0} <span className="text-lg">MAD</span>
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {stats.total?.toLocaleString() || 0} <span className="text-lg">MAD</span>
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Unpaid Invoices</p>
            <p className="text-3xl font-bold text-red-500 mt-1">
              {stats.unpaid || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Chart */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-bold text-gray-700 mb-4">Daily Revenue - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (MAD)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Revenue (MAD)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value.toLocaleString()} MAD`, 
                    'Revenue'
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const date = new Date(payload[0].payload.date);
                      return date.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      });
                    }
                    return `Day ${label}`;
                  }}
                />
                <Bar dataKey="total" fill="#1a2b4a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Total for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}: 
                <span className="font-bold text-gray-800 ml-2">
                  {stats.month?.toLocaleString() || 0} MAD
                </span>
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-bold text-gray-700 mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600 text-sm">Total Paid</span>
                <span className="font-bold text-green-600">
                  {stats.total?.toLocaleString() || 0} MAD
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-600 text-sm">Total Pending</span>
                <span className="font-bold text-orange-600">
                  {stats.total_pending?.toLocaleString() || 0} MAD
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600 text-sm">Total Transactions</span>
                <span className="font-bold text-blue-600">{stats.total_transactions || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Toutes les Transactions</h3>
              <p className="text-sm text-gray-500 mt-1">Factures et paiements des patients</p>
            </div>
            <button onClick={async () => {
              try {
                // Get invoices directly from database
                const response = await api.get('/invoices');
                setInvoices(response.data || []);
                
                // Load other data
                api.get('/finance/stats').then(r => setStats(r.data)).catch(() => {});
                api.get('/finance/daily-revenue').then(r => setDailyData(r.data)).catch(() => {});
              } catch (error) {
                console.error('Error refreshing data:', error);
              }
            }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
              🔄 Actualiser
            </button>
          </div>
          <table className="w-full">
            <thead style={{ backgroundColor: '#1a2b4a' }}>
              <tr>
                <th className="p-4 text-left text-white text-sm font-medium border-r border-gray-600">Patient</th>
                <th className="p-4 text-left text-white text-sm font-medium border-r border-gray-600">Rendez-vous</th>
                <th className="p-4 text-left text-white text-sm font-medium border-r border-gray-600">Montant</th>
                <th className="p-4 text-left text-white text-sm font-medium border-r border-gray-600">Statut</th>
                <th className="p-4 text-left text-white text-sm font-medium">Date de paiement</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, index) => (
                <tr key={`invoice-${inv.id}-${index}`} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600 font-medium border-r border-gray-100">
                    {inv.patient?.name || `Patient #${inv.patient_id}`}
                  </td>
                  <td className="p-4 text-gray-600 border-r border-gray-100">
                    {inv.appointment?.treatment?.name || `Rendez-vous #${inv.appointment_id}`}
                  </td>
                  <td className="p-4 text-gray-600 border-r border-gray-100">
                    <span className="font-bold text-gray-800 text-sm">
                      {(parseFloat(inv.amount) || 0).toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-600">MAD</span>
                    </span>
                  </td>
                  <td className="p-4 border-r border-gray-100">
                    {inv.status === 'unpaid' || inv.status === 'en_attente_paiement' ? (
                      <button 
                        onClick={() => handlePay(inv)}
                        className="bg-orange-500 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors shadow-sm w-full"
                      >
                        Valider Paiement
                      </button>
                    ) : inv.status === 'paid' ? (
                      <span className="px-3 py-2 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200 w-full inline-block text-center">
                        Payé
                      </span>
                    ) : (
                      <span className="px-3 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 w-full inline-block text-center">
                        {inv.status}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric'
                    }) : '-'}
                  </td>
                </tr>
            ))}
            <tr>
              <td colSpan="6" className="p-8 text-center text-gray-400">
                <div className="text-4xl mb-2">📭</div>
                <div className="text-lg font-medium">Aucune transaction pour le moment</div>
                <p className="text-sm mt-1">Les rendez-vous terminés apparaîtront ici automatiquement</p>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
