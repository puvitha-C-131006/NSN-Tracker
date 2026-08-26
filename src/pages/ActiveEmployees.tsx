import { useState, useEffect } from 'react';
import { Search, RotateCcw, Eye, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ActiveEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Dropdown options for filters
  const [options, setOptions] = useState({
    project_name: [] as string[],
    location: [] as string[],
    account_status: [] as string[],
  });

  useEffect(() => {
    fetchOptions();
    fetchEmployees();
  }, []);

  const fetchOptions = async () => {
    const { data } = await supabase.from('dropdown_options').select('category, value');
    if (data) {
      const grouped = data.reduce((acc: any, curr) => {
        if (!acc[curr.category]) acc[curr.category] = [];
        acc[curr.category].push(curr.value);
        return acc;
      }, {});
      setOptions(prev => ({ ...prev, ...grouped }));
    }
  };

  const fetchEmployees = async () => {
    setIsLoading(true);
    let query = supabase.from('employees').select('*');
    
    // Only show active, ramp down, and notice period (exclude strictly Inactive or based on requirement)
    // Assuming "Active List" includes Active, Ramp Down, Notice Period. 
    query = query.in('status', ['Active', 'Ramp Down', 'Notice Period']);

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (!error && data) {
      setEmployees(data);
    }
    setIsLoading(false);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      (emp.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter ? emp.status === statusFilter : true;
    const matchesProject = projectFilter ? emp.project_name === projectFilter : true;
    const matchesLocation = locationFilter ? emp.location === locationFilter : true;

    return matchesSearch && matchesStatus && matchesProject && matchesLocation;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setProjectFilter('');
    setLocationFilter('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="page-title text-gray-900 leading-none">Active Employees</h1>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium">
          Export Data
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Employee ID or Name..." 
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700">
              <option value="">All Statuses</option>
              {options.account_status?.filter(s => ['Active', 'Ramp Down', 'Notice Period'].includes(s)).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700">
              <option value="">All Projects</option>
              {options.project_name?.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700">
              <option value="">All Locations</option>
              {options.location?.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={resetFilters} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium border border-transparent">
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
                <th className="px-6 py-4 font-medium whitespace-nowrap">Project</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Manager</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Location</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Account Status</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Last Working Date</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading employees...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No employees found matching filters.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors text-sm text-gray-800">
                    <td className="px-6 py-4 font-medium text-primary-900">{emp.employee_id}</td>
                    <td className="px-6 py-4 font-medium">{emp.employee_name}</td>
                    <td className="px-6 py-4">{emp.project_name || '-'}</td>
                    <td className="px-6 py-4">{emp.manager || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{emp.location || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        emp.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' :
                        emp.status === 'Notice Period' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {emp.status === 'Notice Period' ? emp.ust_lwd : 
                       emp.status === 'Ramp Down' ? emp.nokia_lwd : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link 
                          to={`/employees/${emp.id}`}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          to={`/employees/${emp.id}/edit`}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-500">Showing {filteredEmployees.length} entries</span>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm font-medium">1</button>
            <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
