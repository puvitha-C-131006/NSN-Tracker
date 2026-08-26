import { useState, useEffect } from 'react';
import { Search, Save, X, RotateCcw, CheckCircle2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { sendWelcomeEmail } from '../lib/emailService';

export default function NewJoiner() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isExistingEmployee, setIsExistingEmployee] = useState(false);
  const [emailToast, setEmailToast] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    ustId: '',
    nokiaId: '',
    employeeName: '',
    email: '',
    phone: '',
    projectName: '',
    projectId: '',
    manager: '',
    department: '',
    location: '',
    designation: '',
    joiningDate: '',
    accountStatus: 'Active',
    employeeType: 'Employee'
  });

  // Dropdown Options State
  const [options, setOptions] = useState({
    location: [] as string[],
    account_status: [] as string[],
    employee_type: [] as string[],
    department: [] as string[],
    project_name: [] as string[]
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    const { data, error } = await supabase.from('dropdown_options').select('category, value');
    if (!error && data) {
      const grouped = data.reduce((acc: any, curr) => {
        if (!acc[curr.category]) acc[curr.category] = [];
        acc[curr.category].push(curr.value);
        return acc;
      }, {});
      setOptions(prev => ({ ...prev, ...grouped }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchUid = async () => {
    if (!formData.ustId) {
      setErrorMsg('Please enter an Employee ID to search.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_id', formData.ustId)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data) {
      setFormData({
        ...formData,
        nokiaId: data.nokia_id || '',
        employeeName: data.employee_name || '',
        email: data.email || '',
        phone: data.phone_number || '',
        projectName: data.project_name || '',
        projectId: data.project_id || '',
        manager: data.manager || '',
        department: data.department || '',
        location: data.location || '',
        designation: data.designation || '',
        joiningDate: data.joining_date || '',
        accountStatus: data.status || 'Active',
        employeeType: data.employee_type || 'Employee'
      });
      setIsExistingEmployee(true);
      setErrorMsg('Employee found and details loaded.');
    } else {
      setIsExistingEmployee(false);
      setErrorMsg('Employee not found in history.');
    }
    setIsLoading(false);
  };

  const handleAddOption = async (category: string) => {
    const value = window.prompt(`Enter new ${category}:`);
    if (!value) return;
    
    const { error } = await supabase.from('dropdown_options').insert([{ category, value }]);
    if (error) {
      if (error.code === '23505') {
        alert('Status already exists.');
      } else {
        alert('Error adding option: ' + error.message);
      }
    } else {
      await fetchOptions();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const payload = {
      employee_id: formData.ustId,
      employee_name: formData.employeeName,
      email: formData.email,
      phone_number: formData.phone,
      location: formData.location,
      designation: formData.designation,
      joining_date: formData.joiningDate,
      status: formData.accountStatus
    };

    // Insert as a new row (supports adding history records for existing UIDs or brand new employees)
    const { error } = await supabase.from('employees').insert([payload]);

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
      return;
    }

    // Trigger Welcome Email only for new insertions
    if (!isExistingEmployee) {
      await sendWelcomeEmail(formData.email, formData.employeeName);
      setEmailToast(true);
      setTimeout(() => setEmailToast(false), 3000);
    }

    setShowSuccess(true);
    setIsLoading(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900 leading-none">New Joiner Registration</h1>
      </div>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center gap-3 shadow-sm transition-all duration-300">
          <CheckCircle2 size={20} className="text-green-600" />
          <span className="font-medium">Employee successfully saved!</span>
        </div>
      )}
      
      {emailToast && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 flex items-center gap-3 shadow-sm transition-all duration-300 mt-2">
          <CheckCircle2 size={20} className="text-blue-600" />
          <span className="font-medium">Email sent to engineer</span>
        </div>
      )}

      {errorMsg && !showSuccess && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 shadow-sm transition-all duration-300">
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} onReset={() => {
        setFormData({
          ustId: '', nokiaId: '', employeeName: '', email: '', phone: '', projectName: '',
          projectId: '', manager: '', department: '', location: '', designation: '',
          joiningDate: '', accountStatus: 'Active', employeeType: 'Employee'
        });
        setIsExistingEmployee(false);
      }} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Section 1: Employee Information */}
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm">1</span>
            Employee Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-4 items-end">
              <div className="w-full sm:flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID (UID) *</label>
                <input name="ustId" value={formData.ustId} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors" placeholder="e.g. EMP-1001" required />
              </div>
              <button type="button" onClick={handleSearchUid} disabled={isLoading} className="w-full sm:w-auto px-6 py-2.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-100 font-medium flex items-center justify-center gap-2 transition-colors">
                <Search size={18} />
                Search by UID
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name *</label>
              <input name="employeeName" value={formData.employeeName} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors" placeholder="Full Name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nokia ID</label>
              <input name="nokiaId" value={formData.nokiaId} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors" placeholder="Nokia ID" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors" placeholder="email@company.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
        </div>

        {/* Section 2: Project Information */}
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm">2</span>
            Project Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <div className="flex gap-2">
                <select name="projectName" value={formData.projectName} onChange={handleInputChange} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700 transition-colors">
                  <option value="">Select Project</option>
                  {options.project_name?.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button type="button" onClick={() => handleAddOption('project_name')} className="p-2.5 bg-primary-50 text-primary-600 rounded-lg border border-primary-200 hover:bg-primary-100" title="Add Project"><Plus size={20}/></button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
              <input name="projectId" value={formData.projectId} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors" placeholder="PRJ-XXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <input name="manager" value={formData.manager} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors" placeholder="Reporting Manager" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <div className="flex gap-2">
                <select name="department" value={formData.department} onChange={handleInputChange} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700 transition-colors">
                  <option value="">Select Department</option>
                  {options.department?.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button type="button" onClick={() => handleAddOption('department')} className="p-2.5 bg-primary-50 text-primary-600 rounded-lg border border-primary-200 hover:bg-primary-100" title="Add Department"><Plus size={20}/></button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="flex gap-2">
                <select name="location" value={formData.location} onChange={handleInputChange} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700 transition-colors">
                  <option value="">Select Location</option>
                  {options.location?.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <button type="button" onClick={() => handleAddOption('location')} className="p-2.5 bg-primary-50 text-primary-600 rounded-lg border border-primary-200 hover:bg-primary-100" title="Add Location"><Plus size={20}/></button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Employment Information */}
        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm">3</span>
            Employment Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input name="designation" value={formData.designation} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors" placeholder="Job Title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date *</label>
              <input name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-700 transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
              <div className="flex gap-2">
                <select name="accountStatus" value={formData.accountStatus} onChange={handleInputChange} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700 transition-colors">
                  {options.account_status?.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <button type="button" onClick={() => handleAddOption('account_status')} className="p-2.5 bg-primary-50 text-primary-600 rounded-lg border border-primary-200 hover:bg-primary-100" title="Add Status"><Plus size={20}/></button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Type</label>
              <div className="flex gap-2">
                <select name="employeeType" value={formData.employeeType} onChange={handleInputChange} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700 transition-colors">
                  {options.employee_type?.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <button type="button" onClick={() => handleAddOption('employee_type')} className="p-2.5 bg-primary-50 text-primary-600 rounded-lg border border-primary-200 hover:bg-primary-100" title="Add Type"><Plus size={20}/></button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 border-t border-gray-100 p-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <button type="reset" className="w-full sm:w-auto px-6 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
            <RotateCcw size={18} />
            Clear Form
          </button>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link to="/employees" className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-center flex items-center justify-center gap-2 shadow-sm">
              <X size={18} />
              Cancel
            </Link>
            <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70">
              <Save size={18} />
              {isLoading ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
