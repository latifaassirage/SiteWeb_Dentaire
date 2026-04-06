import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PatientNavbar from '../../components/PatientNavbar';

export default function Documents() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get('/my-invoices').then(r => setInvoices(r.data)).catch(() => {});
  }, []);

  const paid = invoices.filter(i => i.status === 'paid');
  const unpaid = invoices.filter(i => i.status === 'unpaid');

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar activePath="/patient/documents" />

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-700 mb-6">📄 My Documents</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-5 border-t-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total Invoices</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{invoices.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-t-4 border-green-500">
            <p className="text-gray-500 text-sm">Paid</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{paid.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-t-4 border-red-500">
            <p className="text-gray-500 text-sm">Unpaid</p>
            <p className="text-3xl font-bold text-red-500 mt-1">{unpaid.length}</p>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="font-bold text-gray-700">All Invoices</h3>
          </div>
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p>No documents yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {invoices.map(inv => (
                <div key={inv.id} className="p-5 flex justify-between items-center hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      inv.status === 'paid' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <span>{inv.status === 'paid' ? '✅' : '❌'}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Invoice #{inv.id}</p>
                      <p className="text-gray-400 text-sm">🦷 {inv.appointment?.treatment?.name || 'Treatment'}</p>
                      <p className="text-gray-400 text-sm">📅 {new Date(inv.created_at).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-lg">{parseFloat(inv.amount).toLocaleString()} MAD</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      inv.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {inv.status === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
