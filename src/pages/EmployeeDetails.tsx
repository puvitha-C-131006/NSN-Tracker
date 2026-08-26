import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (id) fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setEmployee(data);
    } else if (error) {
      console.error(error);
      setErrorMsg('Failed to load employee details.');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this employee? This cannot be undone.")) return;
    
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (!error) {
      navigate('/employees');
    } else {
      alert("Failed to delete employee: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  if (errorMsg || !employee) {
    return (
      <div className="p-6 text-center text-red-600 font-medium bg-red-50 rounded-lg max-w-3xl mx-auto mt-10">
        {errorMsg || 'Employee not found.'}
        <div className="mt-4">
          <Link to="/employees" className="text-primary-600 hover:underline">Back to Employees</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/employees" className="btn p-2 hover:bg-gray-200 rounded-full transition-colors bg-gray-100 flex items-center justify-center">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <h1 className="text-gray-900 leading-none">Employee Details</h1>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header section */}
        <div className="bg-gray-50 border-b border-gray-100 p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-24 h-24 rounded-full bg-primary-100 border-2 border-primary-200 flex items-center justify-center text-primary-700 text-3xl font-bold shrink-0 shadow-sm uppercase">
            {employee.employee_name ? employee.employee_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'EM'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{employee.employee_name}</h2>
            <p className="text-gray-500 font-medium mt-1">{employee.designation || 'N/A'}</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
              employee.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' :
              employee.status === 'Notice Period' ? 'bg-orange-100 text-orange-800 border-orange-200' :
              'bg-red-100 text-red-800 border-red-200'
            }`}>
              {employee.status}
            </span>
          </div>
        </div>

        {/* Content sections */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Personal Information */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="UST Employee ID" value={employee.employee_id} />
              <DetailItem label="Nokia ID" value={employee.nokia_id || '-'} />
              <DetailItem label="Full Name" value={employee.employee_name} />
              <DetailItem label="Email Address" value={employee.email} />
              <DetailItem label="Phone Number" value={employee.phone_number || '-'} />
            </div>
          </section>

          {/* Employment Information */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Employment Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="Project Name" value={employee.project_name || '-'} />
              <DetailItem label="Project ID" value={employee.project_id || '-'} />
              <DetailItem label="Designation" value={employee.designation || '-'} />
              <DetailItem label="Department" value={employee.department || '-'} />
              <DetailItem label="Manager Name" value={employee.manager || '-'} />
              <DetailItem label="Joining Date" value={employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : '-'} />
              <DetailItem label="Employment Status" value={employee.status || '-'} />
              <DetailItem label="Employee Type" value={employee.employee_type || '-'} />
              <DetailItem label="Work Location" value={employee.location || '-'} />
            </div>
          </section>

          {/* Offboarding / Additional Info */}
          {(employee.nokia_lwd || employee.ust_lwd || employee.attrition_type) && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Offboarding & Movement</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailItem label="Attrition Type" value={employee.attrition_type || '-'} />
                <DetailItem label="Nokia LWD" value={employee.nokia_lwd ? new Date(employee.nokia_lwd).toLocaleDateString() : '-'} />
                <DetailItem label="UST LWD" value={employee.ust_lwd ? new Date(employee.ust_lwd).toLocaleDateString() : '-'} />
                <DetailItem label="Reason / Remarks" value={employee.attrition_reason || '-'} />
              </div>
            </section>
          )}

          {/* System Information */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">System Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DetailItem label="Created Date" value={new Date(employee.created_at).toLocaleString()} />
              <DetailItem label="Last Updated" value={new Date(employee.updated_at).toLocaleString()} />
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 border-t border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4">
          <Link 
            to="/employees" 
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-center shadow-sm"
          >
            Back
          </Link>
          <button onClick={handleDelete} className="w-full sm:w-auto px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium flex items-center justify-center gap-2 transition-colors">
            <Trash2 size={18} />
            Delete
          </button>
          <Link to={`/employees/${id}/edit`} className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white border border-primary-600 rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Edit size={18} />
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-base font-semibold text-gray-900">{value}</p>
    </div>
  );
}
