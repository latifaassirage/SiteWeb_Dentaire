import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import AdminNavbar from '../../components/AdminNavbar.jsx';

const monthlyData = [
  { month: 'Jan', amount: 45000 },
  { month: 'Feb', amount: 62000 },
  { month: 'Mar', amount: 78000 },
  { month: 'Apr', amount: 91000 },
  { month: 'May', amount: 85000 },
  { month: 'Jun', amount: 110000 },
];

export default function Finance() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ today: 0, month: 0 });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchFinanceData();
    
    // Set up periodic refresh for real-time updates
    const interval = setInterval(fetchFinanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchFinanceData = async () => {
    try {
      // Fetch both invoices and payments for complete financial data
      const [invoicesResponse, paymentsResponse, statsResponse] = await Promise.all([
        api.get('/invoices').catch(() => ({ data: [] })), // Get invoices for Patient Documents
        api.get('/payments').catch(() => ({ data: [] })), // Get payments from completed appointments
        api.get('/payments/stats').catch(() => ({ data: { today: 0, month: 0, total_payments: 0, today_payments: 0 } }))
      ]);
      
      // Combine invoices and payments for complete view
      const allFinancialRecords = [
        ...(invoicesResponse.data || []),
        ...(paymentsResponse.data || [])
      ];
      
      setInvoices(allFinancialRecords);
      setStats(statsResponse.data || { today: 0, month: 0, total_payments: 0, today_payments: 0 });
    } catch (error) {
      console.error('Error fetching finance data:', error);
      // Set safe defaults to prevent UI crashes
      setInvoices([]);
      setStats({ today: 0, month: 0, total_payments: 0, today_payments: 0 });
    }
  };

  const handlePay = async (id) => {
    await api.put(`/invoices/${id}/pay`);
    fetchFinanceData(); // Refresh all finance data
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar activePath="/admin/finance" />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-700 mb-6">💰 Finance (Invoices & Payments)</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-5 border-t-4 border-green-500">
            <p className="text-gray-500 text-sm">Today's Revenue</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {(stats.today || 0).toLocaleString()} <span className="text-lg">MAD</span>
            </p>
            <p className="text-green-500 text-sm mt-1">↑ Daily income</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-t-4 border-blue-500">
            <p className="text-gray-500 text-sm">Monthly Revenue</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {(stats.month || 0).toLocaleString()} <span className="text-lg">MAD</span>
            </p>
            <p className="text-blue-500 text-sm mt-1">↑ This month</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-t-4 border-orange-500">
            <p className="text-gray-500 text-sm">Pending Payments</p>
            <p className="text-3xl font-bold text-orange-500 mt-1">
              {invoices.filter(i => i.status === 'pending').length}
            </p>
            <p className="text-orange-400 text-sm mt-1">Awaiting payment</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Chart */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-bold text-gray-700 mb-4">Monthly Revenue (MAD)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value.toLocaleString()} MAD`} />
                <Bar dataKey="amount" fill="#1a2b4a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-bold text-gray-700 mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600 text-sm">Total Paid</span>
                <span className="font-bold text-green-600">
                  {invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0).toLocaleString()} MAD
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-600 text-sm">Total Pending</span>
                <span className="font-bold text-orange-600">
                  {invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0).toLocaleString()} MAD
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600 text-sm">Total Transactions</span>
                <span className="font-bold text-blue-600">{invoices.length}</span>
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
            <button onClick={fetchFinanceData} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
              🔄 Actualiser
            </button>
          </div>
          <table className="w-full">
            <thead style={{ backgroundColor: '#1a2b4a' }}>
              <tr>
                <th className="p-4 text-left text-white text-sm font-medium border-r border-gray-600">#</th>
                <th className="p-4 text-left text-white text-sm font-medium border-r border-gray-600">Patient</th>
                <th className="p-4 text-left text-white text-sm font-medium border-r border-gray-600">Description</th>
                <th className="p-4 text-left text-white text-sm font-medium border-r border-gray-600">Montant</th>
                <th className="p-4 text-left text-white text-sm font-medium border-r border-gray-600">Date</th>
                <th className="p-4 text-left text-white text-sm font-medium border-r border-gray-600">Statut</th>
                <th className="p-4 text-left text-white text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, index) => (
                <tr key={inv.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600 font-medium border-r border-gray-100">{index + 1}</td>
                  <td className="p-4 border-r border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {inv.patient?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-gray-800 text-sm font-medium">
                        {inv.patient?.name || 'Patient Inconnu'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 border-r border-gray-100">
                    <div className="flex items-start gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                        inv.payment_date ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {inv.payment_date ? '💰' : '📄'}
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-700 text-sm">
                          {inv.payment_date ? (
                            <>
                              <span className="font-medium text-blue-600">Paiement:</span>
                              <span className="ml-1">
                                {inv.appointment?.treatment?.name || 'Service Dentaire'} - {inv.patient?.name || 'Patient Inconnu'}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="font-medium text-green-600">Facture:</span>
                              <span className="ml-1">
                                {inv.appointment?.treatment?.name || 'Service Dentaire'} - {inv.patient?.name || 'Patient Inconnu'}
                              </span>
                            </>
                          )}
                        </div>
                        {inv.appointment_id && (
                          <div className="text-xs text-gray-500 mt-1">
                            Rendez-vous #{inv.appointment_id}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-r border-gray-100">
                    <span className="font-bold text-gray-800 text-sm">
                      {(parseFloat(inv.amount) || 0).toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-600">MAD</span>
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm border-r border-gray-100">
                    {new Date(inv.payment_date || inv.created_at || inv.issued_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric'
                    })}
                  </td>
                  <td className="p-4 border-r border-gray-100">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      inv.status === 'paid' || inv.status === 'payé' ? 'bg-green-100 text-green-700 border border-green-200' : 
                      inv.status === 'pending' || inv.status === 'unpaid' || inv.status === 'non_payé' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      inv.status === 'refunded' ? 'bg-red-100 text-red-700 border border-red-200' :
                      'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {inv.status === 'paid' || inv.status === 'payé' ? '✅ Payé' : 
                       inv.status === 'pending' || inv.status === 'unpaid' || inv.status === 'non_payé' ? '⏳ En attente' :
                       inv.status === 'refunded' ? '❌ Remboursé' :
                       inv.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {(inv.status === 'pending' || inv.status === 'unpaid' || inv.status === 'non_payé') && (
                      <button onClick={() => handlePay(inv.id)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors shadow-sm">
                        Marquer comme payé
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    <div className="text-4xl mb-2">📭</div>
                    <div className="text-lg font-medium">Aucune transaction pour le moment</div>
                    <p className="text-sm mt-1">Les rendez-vous terminés apparaîtront ici automatiquement</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
