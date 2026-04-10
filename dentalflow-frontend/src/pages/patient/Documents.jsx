import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PatientNavbar from '../../components/PatientNavbar';

export default function Documents() {
  const [invoices, setInvoices] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [unpaidSummary, setUnpaidSummary] = useState({ total_count: 0, total_amount: 0, formatted_amount: '0 MAD' });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || {});

  const loadData = () => {
    // Load all invoices
    api.get('/my-invoices').then(r => setInvoices(r.data)).catch(() => {});
    
    // Load unpaid invoices with summary
    api.get('/my-unpaid-invoices').then(r => {
      setUnpaidInvoices(r.data.invoices || []);
      setUnpaidSummary(r.data.summary || { total_count: 0, total_amount: 0, formatted_amount: '0 MAD' });
    }).catch(() => {});
  };

  useEffect(() => {
    loadData();
    
    // Set up periodic refresh for real-time updates
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const paid = invoices.filter(i => i.status === 'paid');
  const unpaid = invoices.filter(i => i.status === 'unpaid' || i.status === 'en_attente_paiement');

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar activePath="/patient/documents" />

      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-700">?? My Documents</h1>
          <button 
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            ?? Actualiser
          </button>
        </div>

        {/* Unpaid Invoices Summary */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Factures à payer</h2>
              <p className="text-orange-100">Vous avez {unpaidSummary.total_count} facture{unpaidSummary.total_count !== 1 ? 's' : ''} en attente de paiement</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{unpaidSummary.formatted_amount}</p>
              <p className="text-orange-100 text-sm">Montant total dû</p>
            </div>
          </div>
        </div>

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

        {/* Unpaid Invoices */}
        {unpaidInvoices.length > 0 && (
          <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
            <div className="p-5 border-b bg-orange-50">
              <h3 className="font-bold text-orange-700">Factures en attente de paiement</h3>
              <p className="text-orange-600 text-sm mt-1">Ces factures nécessitent votre attention</p>
            </div>
            <div className="divide-y">
              {unpaidInvoices.map(inv => (
                <div key={inv.id} className="p-5 flex justify-between items-center hover:bg-orange-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100">
                      <span>??</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Facture #{inv.id}</p>
                      <p className="text-gray-600 text-sm">?? {inv.appointment?.treatment?.name || 'Traitement'}</p>
                      <p className="text-gray-500 text-sm">?? {new Date(inv.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600 text-lg">{parseFloat(inv.amount).toLocaleString('fr-FR')} MAD</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                      {inv.status === 'en_attente_paiement' ? 'En attente' : 'Non payé'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Invoices */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="font-bold text-gray-700">Toutes les factures</h3>
          </div>
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-4xl mb-2">??</div>
              <p>Aucun document pour le moment</p>
            </div>
          ) : (
            <div className="divide-y">
              {invoices.map(inv => (
                <div key={inv.id} className="p-5 flex justify-between items-center hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      inv.status === 'paid' ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      <span>{inv.status === 'paid' ? '??' : '??'}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Facture #{inv.id}</p>
                      <p className="text-gray-600 text-sm">?? {inv.appointment?.treatment?.name || 'Traitement'}</p>
                      <p className="text-gray-500 text-sm">?? {new Date(inv.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-lg">{parseFloat(inv.amount).toLocaleString('fr-FR')} MAD</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      inv.status === 'paid' ? 'bg-green-100 text-green-600' : 
                      inv.status === 'en_attente_paiement' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {inv.status === 'paid' ? 'Payé' : inv.status === 'en_attente_paiement' ? 'En attente' : 'Non payé'}
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
