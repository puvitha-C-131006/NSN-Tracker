import { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LeaveRequest {
  id: string;
  employee_id: number;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  applied_on: string;
  reviewed_by?: string;
  reviewed_on?: string;
}

export default function LeavePermission() {
  const { role, user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Employee form state
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [role, user]);

  const fetchRequests = async () => {
    setIsLoading(true);
    let query = supabase.from('leave_requests').select('*').order('applied_on', { ascending: false });
    
    if ((role === 'employee' || role === 'Employee') && user?.employee_ref_id) {
      query = query.eq('employee_id', user.employee_ref_id);
    }
    
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching requests:', error);
    } else if (data) {
      setRequests(data as LeaveRequest[]);
    }
    setIsLoading(false);
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.employee_ref_id) {
      setErrorMsg('Employee profile link not found. Cannot apply for leave.');
      return;
    }
    setIsSubmitting(true);
    
    const payload = {
      employee_id: user.employee_ref_id,
      employee_name: user.full_name,
      leave_type: 'General Leave',
      start_date: formData.startDate,
      end_date: formData.endDate,
      reason: formData.reason,
      status: 'Pending'
    };
    
    const { error } = await supabase.from('leave_requests').insert([payload]);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setFormData({ startDate: '', endDate: '', reason: '' });
      fetchRequests();
    }
    setIsSubmitting(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    // We need an admin name, we'll try to get it from users table or fallback
    let adminName = 'Admin';
    if (user?.email) {
      const { data } = await supabase.from('users').select('full_name').eq('email', user.email).single();
      if (data?.full_name) adminName = data.full_name;
    }

    const { error } = await supabase
      .from('leave_requests')
      .update({
        status: newStatus,
        reviewed_by: adminName,
        reviewed_on: new Date().toISOString()
      })
      .eq('id', id);

    if (!error) {
      fetchRequests();
    } else {
      alert('Error updating status: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Approved</span>;
      case 'Rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">Pending</span>;
    }
  };

  const filteredRequests = requests.filter(req => filter === 'All' || req.status === filter);
  
  // Stats
  const totalReq = requests.length;
  const pendingReq = requests.filter(r => r.status === 'Pending').length;
  const approvedReq = requests.filter(r => r.status === 'Approved').length;
  const rejectedReq = requests.filter(r => r.status === 'Rejected').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900 leading-none">Leave Management</h1>
      </div>

      {role === 'Admin' || role === 'HR Manager' || role === 'admin' ? (
        <>
          {/* Admin View Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20} /></div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Requests</h3>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{totalReq}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><Clock size={20} /></div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending</h3>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{pendingReq}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 size={20} /></div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Approved</h3>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{approvedReq}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><XCircle size={20} /></div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Rejected</h3>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{rejectedReq}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-800">All Leave Requests</h2>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-700 bg-gray-50"
              >
                <option value="All">All Requests</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4 font-semibold">Employee</th>
                    <th className="px-6 py-4 font-semibold">Duration</th>
                    <th className="px-6 py-4 font-semibold">Reason</th>
                    <th className="px-6 py-4 font-semibold">Applied On</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading requests...</td></tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No requests found.</td></tr>
                  ) : (
                    filteredRequests.map(req => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{req.employee_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(req.applied_on).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {req.status === 'Pending' && (
                            <>
                              <button onClick={() => handleUpdateStatus(req.id, 'Approved')} className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors">Approve</button>
                              <button onClick={() => handleUpdateStatus(req.id, 'Rejected')} className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-medium transition-colors">Reject</button>
                            </>
                          )}
                          {req.status !== 'Pending' && (
                            <span className="text-xs text-gray-400">Reviewed by {req.reviewed_by}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Employee View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Calendar size={20} className="text-primary-600" />
                    Apply for Leave
                  </h2>
                </div>
                <div className="p-6">
                  {errorMsg && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                      {errorMsg}
                    </div>
                  )}
                  <form onSubmit={handleApplyLeave} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                      <input type="text" value={user?.full_name || 'Loading...'} disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                      <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} required rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors" placeholder="Brief reason for leave..." />
                    </div>
                    <button type="submit" disabled={isSubmitting || !user?.employee_ref_id} className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50">
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">My Leave History</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                        <th className="px-6 py-4 font-semibold">Duration</th>
                        <th className="px-6 py-4 font-semibold">Reason</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Applied On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isLoading ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading history...</td></tr>
                      ) : requests.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No leave requests found.</td></tr>
                      ) : (
                        requests.map(req => (
                          <tr key={req.id} className="hover:bg-gray-50 transition-colors text-sm">
                            <td className="px-6 py-4 text-gray-900 font-medium">
                              {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate" title={req.reason}>{req.reason}</td>
                            <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                            <td className="px-6 py-4 text-gray-500">{new Date(req.applied_on).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
