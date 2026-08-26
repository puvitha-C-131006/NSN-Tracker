import { useState, useEffect } from 'react';
import { FileText, FileSpreadsheet, FileIcon, Filter, Users, UserCheck, UserPlus, TrendingDown, Clock, Search, Loader2 } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Reports() {
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    rampDown: 0,
    noticePeriod: 0,
    newJoiners: 0
  });

  const [loading, setLoading] = useState(true);
  
  // Report Generation State
  const [reportData, setReportData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    dateRange: 'all',
    project: '',
    status: '',
    location: ''
  });

  // Dropdown Options State
  const [options, setOptions] = useState({
    project_name: [] as string[],
    account_status: [] as string[],
    location: [] as string[]
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // Fetch total employees
    const { count: totalCount } = await supabase.from('employees').select('*', { count: 'exact', head: true });
    
    // Fetch active employees
    const { count: activeCount } = await supabase.from('employees').select('*', { count: 'exact', head: true }).eq('status', 'Active');
    
    // Fetch ramp down
    const { count: rampDownCount } = await supabase.from('employees').select('*', { count: 'exact', head: true }).eq('status', 'Ramp Down');
    
    // Fetch notice period
    const { count: noticeCount } = await supabase.from('employees').select('*', { count: 'exact', head: true }).eq('status', 'Notice Period');

    // Fetch new joiners (assuming created within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { count: newJoinersCount } = await supabase.from('employees')
      .select('*', { count: 'exact', head: true })
      .gte('joining_date', thirtyDaysAgo.toISOString().split('T')[0]);

    setMetrics({
      total: totalCount || 0,
      active: activeCount || 0,
      rampDown: rampDownCount || 0,
      noticePeriod: noticeCount || 0,
      newJoiners: newJoinersCount || 0
    });
    
    setLoading(false);
  };

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

  useEffect(() => {
    fetchDashboardData();
    fetchOptions();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    let query = supabase.from('employees').select('*');
    
    if (filters.project) query = query.eq('project_name', filters.project);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.location) query = query.eq('location', filters.location);
    
    if (filters.dateRange === 'last30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.gte('joining_date', thirtyDaysAgo.toISOString().split('T')[0]);
    } else if (filters.dateRange === 'ytd') {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      query = query.gte('joining_date', startOfYear.toISOString().split('T')[0]);
    }
    
    // Default sort by employee name
    query = query.order('employee_name', { ascending: true });

    const { data, error } = await query;
    
    if (!error && data) {
      setReportData(data);
    }
    
    setHasGenerated(true);
    setIsGenerating(false);
  };

  const handleExportExcel = () => {
    if (reportData.length === 0) return alert('No data to export. Please generate a report with results first.');
    
    // Map data for clean Excel columns
    const exportData = reportData.map(emp => ({
      'Employee ID': emp.employee_id,
      'Name': emp.employee_name,
      'Email': emp.email,
      'Project': emp.project_name || '-',
      'Status': emp.status || '-',
      'Location': emp.location || '-',
      'Joining Date': emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : '-',
      'Manager': emp.manager || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Report");
    XLSX.writeFile(workbook, "Employee_Report.xlsx");
  };

  const handleExportPDF = () => {
    if (reportData.length === 0) return alert('No data to export. Please generate a report with results first.');
    
    const doc = new jsPDF('landscape');
    
    // Add Title
    doc.setFontSize(18);
    doc.text("NSN Tracker - Employee Report", 14, 22);
    
    // Add Timestamp
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    const tableColumn = ["ID", "Name", "Email", "Project", "Status", "Location", "Joining Date"];
    const tableRows = reportData.map(emp => [
      emp.employee_id,
      emp.employee_name,
      emp.email,
      emp.project_name || '-',
      emp.status || '-',
      emp.location || '-',
      emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : '-'
    ]);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] } // primary-600 color
    });
    
    doc.save("Employee_Report.pdf");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="page-title text-gray-900 leading-none">Reports</h1>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleExportExcel} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold shadow-sm transition-all flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-green-600" />
            Export Excel
          </button>
          <button onClick={handleExportPDF} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold shadow-sm transition-all flex items-center gap-2">
            <FileIcon size={18} className="text-red-500" />
            Export PDF
          </button>
          <button onClick={handleGenerateReport} disabled={isGenerating} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-70">
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
            Generate Report
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold">
          <Filter size={18} className="text-primary-600" />
          <h3>Report Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select name="dateRange" value={filters.dateRange} onChange={handleFilterChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700 transition-colors">
              <option value="all">All Time</option>
              <option value="last30">Last 30 Days</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select name="project" value={filters.project} onChange={handleFilterChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700 transition-colors">
              <option value="">All Projects</option>
              {options.project_name?.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700 transition-colors">
              <option value="">All Statuses</option>
              {options.account_status?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select name="location" value={filters.location} onChange={handleFilterChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700 transition-colors">
              <option value="">All Locations</option>
              {options.location?.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Snapshot / Report Cards */}
      <div className="dashboard-card-grid">
        <DashboardCard title="Total Employees" value={loading ? "..." : metrics.total.toString()} icon={<Users size={24} />} />
        <DashboardCard title="Active Employees" value={loading ? "..." : metrics.active.toString()} icon={<UserCheck size={24} />} />
        <DashboardCard title="New Joiners" value={loading ? "..." : metrics.newJoiners.toString()} icon={<UserPlus size={24} />} />
        <DashboardCard title="Ramp Down" value={loading ? "..." : metrics.rampDown.toString()} icon={<TrendingDown size={24} />} />
        <DashboardCard title="Notice Period" value={loading ? "..." : metrics.noticePeriod.toString()} icon={<Clock size={24} />} />
      </div>

      {/* Report Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-gray-800">Generated Report Results</h2>
            <p className="text-sm text-gray-500 mt-1">
              {hasGenerated 
                ? `Found ${reportData.length} records matching your filters.`
                : 'Configure your filters and click Generate Report to see results.'}
            </p>
          </div>
        </div>
        
        {isGenerating ? (
           <div className="p-12 flex justify-center">
             <Loader2 size={32} className="animate-spin text-primary-500" />
           </div>
        ) : hasGenerated && reportData.length > 0 ? (
          <div className="table-container max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Employee ID</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Name</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Project</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Location</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Joining Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reportData.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors text-sm text-gray-800">
                    <td className="px-6 py-4 font-medium text-gray-900">{emp.employee_id}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{emp.employee_name}</td>
                    <td className="px-6 py-4 text-gray-600">{emp.project_name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        emp.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 
                        emp.status === 'Ramp Down' ? 'bg-red-100 text-red-800 border-red-200' :
                        emp.status === 'Notice Period' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {emp.status || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{emp.location || '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : hasGenerated && reportData.length === 0 ? (
           <div className="p-12 flex flex-col items-center justify-center text-gray-400">
             <Search size={48} className="mb-4 opacity-20" />
             <p className="font-medium text-gray-500">No records found for the selected filters.</p>
           </div>
        ) : (
           <div className="p-12 text-center text-gray-400 border-t border-gray-100">
             <p>Results will appear here.</p>
           </div>
        )}
      </div>
    </div>
  );
}
