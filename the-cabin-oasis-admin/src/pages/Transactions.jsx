import { Search, Filter, Eye, Edit, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal states
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', payment_method: '', payment_reference: '', notes: '' });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions/');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (transaction) => {
    setSelectedTransaction(transaction);
    setShowView(true);
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setEditForm({
      status: transaction.status,
      payment_method: transaction.payment_method || 'card',
      payment_reference: transaction.payment_reference || '',
      notes: transaction.notes || ''
    });
    setShowEdit(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/transactions/${selectedTransaction.transaction_id}`, editForm);
      fetchTransactions();
      setShowEdit(false);
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction');
    }
  };

  // Filter transactions based on search term and status
  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      transaction.transaction_id?.toString().toLowerCase().includes(searchLower) ||
      transaction.booking_id?.toString().toLowerCase().includes(searchLower) ||
      transaction.booking?.customer?.name?.toLowerCase().includes(searchLower) ||
      transaction.booking?.cabin?.name?.toLowerCase().includes(searchLower);
    const matchesStatus = !selectedStatus || transaction.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading transactions...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Transactions</h2>
            <p className="text-slate-400">Manage all payment transactions</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search transactions by ID, booking ID, customer, or cabin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                <Filter size={20} />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.transaction_id} className="hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {transaction.transaction_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {transaction.booking_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {transaction.booking?.customer?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        ${transaction.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {transaction.payment_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-slate-600 rounded" title="View" onClick={() => handleView(transaction)}>
                            <Eye size={16} />
                          </button>
                          <button className="p-1 hover:bg-slate-600 rounded" title="Edit" onClick={() => handleEdit(transaction)}>
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-slate-400">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">No transactions found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Transaction Modal */}
      {showView && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Transaction Details</h3>
              <button onClick={() => setShowView(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div><strong>Transaction ID:</strong> {selectedTransaction.transaction_id}</div>
              <div><strong>Booking ID:</strong> {selectedTransaction.booking_id}</div>
              <div><strong>Customer:</strong> {selectedTransaction.booking?.customer?.name} ({selectedTransaction.booking?.customer?.email})</div>
              <div><strong>Cabin:</strong> {selectedTransaction.booking?.cabin?.name}</div>
              <div><strong>Amount:</strong> ${selectedTransaction.amount}</div>
              <div><strong>Payment Method:</strong> {selectedTransaction.payment_method}</div>
              <div><strong>Status:</strong> {selectedTransaction.status}</div>
              <div><strong>Date:</strong> {selectedTransaction.transaction_date}</div>
              <div><strong>Reference:</strong> {selectedTransaction.payment_reference || 'N/A'}</div>
              <div><strong>Notes:</strong> {selectedTransaction.notes || 'None'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEdit && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Update Transaction Status</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Payment Method</label>
                <select
                  value={editForm.payment_method}
                  onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
                >
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Payment Reference (Stripe ID)</label>
                <input
                  type="text"
                  value={editForm.payment_reference}
                  onChange={(e) => setEditForm({ ...editForm, payment_reference: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
                  placeholder="e.g. pi_3Nh..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Update</button>
                <button type="button" onClick={() => setShowEdit(false)} className="flex-1 bg-slate-600 text-white py-2 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
