import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Save, X, CalendarCheck, Clock, UserCheck, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name?: string; // We'll fetch this joined
  date: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'On Leave';
  check_in?: string;
  check_out?: string;
  remarks?: string;
}

export default function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState<{employee_id: string, employee_name: string}[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    check_in: '',
    check_out: '',
    remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter, statusFilter]);

  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('employee_id, employee_name').order('employee_name');
    if (data) setEmployees(data);
  };

  const fetchAttendance = async () => {
    setIsLoading(true);
    let query = supabase.from('attendance').select(`
      *,
      employees:employee_id(employee_name)
    `).eq('date', dateFilter);

    if (statusFilter !== 'All') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (!error && data) {
      const mappedData = data.map((d: any) => ({
        ...d,
        employee_name: d.employees?.employee_name || 'Unknown'
      }));
      setRecords(mappedData);
    }
    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Upsert attendance
    const { error } = await supabase.from('attendance').upsert({
      employee_id: formData.employee_id,
      date: formData.date,
      status: formData.status,
      check_in: formData.check_in || null,
      check_out: formData.check_out || null,
      remarks: formData.remarks
    }, { onConflict: 'employee_id,date' });

    if (!error) {
      setShowModal(false);
      setFormData({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
        check_in: '',
        check_out: '',
        remarks: ''
      });
      fetchAttendance();
    } else {
      alert("Error saving attendance: " + error.message);
    }
    setIsSubmitting(false);
  };

  // Stats
  const presentCount = records.filter(r => r.status === 'Present' || r.status === 'Half Day').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;
  const leaveCount = records.filter(r => r.status === 'On Leave').length;

  const filteredRecords = records.filter(r => 
    r.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.employee_name && r.employee_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-gray-900 leading-none">Attendance</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center gap-2 transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Mark Attendance</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><UserCheck size={20} /></div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Present Today</h3>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{presentCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><XCircle size={20} /></div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Absent Today</h3>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{absentCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><Clock size={20} /></div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">On Leave Today</h3>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{leaveCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID or Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white"
            />
            <div className="relative min-w-[140px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white appearance-none"
              >
                <option value="All">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Employee ID</th>
                <th className="px-6 py-4 font-semibold">Employee Name</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Check In</th>
                <th className="px-6 py-4 font-semibold">Check Out</th>
                <th className="px-6 py-4 font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Loading attendance data...</td></tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <CalendarCheck size={48} className="mb-4 opacity-20" />
                      <p className="text-gray-500 font-medium">No records found for {new Date(dateFilter).toLocaleDateString()}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{r.employee_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{r.employee_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        r.status === 'Present' ? 'bg-green-100 text-green-800 border-green-200' :
                        r.status === 'Absent' ? 'bg-red-100 text-red-800 border-red-200' :
                        r.status === 'Half Day' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{r.check_in || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{r.check_out || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate" title={r.remarks}>{r.remarks || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Mark Attendance</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                  <select 
                    value={formData.employee_id}
                    onChange={e => setFormData({...formData, employee_id: e.target.value})}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map(e => (
                      <option key={e.employee_id} value={e.employee_id}>{e.employee_name} ({e.employee_id})</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input 
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Half Day">Half Day</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                    <input 
                      type="time"
                      value={formData.check_in}
                      onChange={e => setFormData({...formData, check_in: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                    <input 
                      type="time"
                      value={formData.check_out}
                      onChange={e => setFormData({...formData, check_out: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <input 
                    type="text"
                    value={formData.remarks}
                    onChange={e => setFormData({...formData, remarks: e.target.value})}
                    placeholder="Optional notes..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-700"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                >
                  <Save size={18} />
                  {isSubmitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
