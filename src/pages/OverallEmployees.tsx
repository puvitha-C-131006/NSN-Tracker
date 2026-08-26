import { useState, useEffect } from 'react';
import { Search, RotateCcw, Eye, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function OverallEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setEmployees(data);
    } else if (error) {
      console.error('Error fetching employees:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
  };

  const filteredEmployees = employees.filter((emp) => {
    const searchMatch = (emp.employee_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                        (emp.employee_id?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter ? emp.status === statusFilter : true;
    return searchMatch && statusMatch;
  });

  const getStatusBadgeClass = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'notice period': return 'bg-yellow-100 text-yellow-800';
      case 'ramp down': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="page-title text-gray-900 leading-none">Overall Employees</h1>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium">
          Add Employee
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by Employee ID or Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Notice Period">Notice Period</option>
              <option value="Ramp Down">Ramp Down</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium border border-transparent"
          >
            <RotateCcw size={16} />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="table-container">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="px-6 py-4 font-medium whitespace-nowrap">Employee ID</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Employee Name</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Email</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Department</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Designation</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Phone</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Joining Date</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Status</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-primary-600 mb-4" size={32} />
                    <p className="text-gray-500 font-medium">Loading employees data...</p>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <div className="bg-gray-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <Search className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-900 font-medium text-lg">No employees found</p>
                    <p className="text-gray-500 mt-1">We couldn't find any employees matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors text-sm text-gray-800">
                    <td className="px-6 py-4 font-medium text-primary-900">{emp.employee_id}</td>
                    <td className="px-6 py-4 font-medium">{emp.employee_name}</td>
                    <td className="px-6 py-4 text-gray-500">{emp.email}</td>
                    <td className="px-6 py-4">{emp.department}</td>
                    <td className="px-6 py-4 text-gray-600">{emp.designation}</td>
                    <td className="px-6 py-4 text-gray-600">{emp.phone_number}</td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(emp.status)}`}>
                        {emp.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/employees/${emp.id}`}
                        className="inline-flex items-center justify-center p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        {!loading && filteredEmployees.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">Showing {filteredEmployees.length} entries</span>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>
                <ChevronLeft size={16} />
              </button>
              <button className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm font-medium">1</button>
              <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
