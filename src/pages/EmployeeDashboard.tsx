import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Briefcase, MapPin, Calendar, Clock, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployeeData() {
      if (!user?.email) return;
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', user.email)
        .single();

      if (data && !error) {
        setEmployeeData(data);
      }
      setLoading(false);
    }

    fetchEmployeeData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <ShieldAlert size={48} className="text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Profile Not Linked</h2>
          <p className="text-yellow-700 max-w-md">
            Welcome <strong>{user?.email}</strong>. It looks like your email hasn't been linked to an employee profile in the system yet. Please contact your HR or Manager to complete your onboarding.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-gray-900 leading-none">Employee Dashboard</h1>
      </div>

      {/* Welcome Banner */}
      <div className="bg-primary-600 rounded-2xl shadow-md overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <User size={120} />
        </div>
        <div className="p-8 sm:p-10 relative z-10 text-white">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {employeeData.employee_name.split(' ')[0]}!</h2>
          <p className="text-primary-100 text-lg">Here is an overview of your current employment status and details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-1">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-primary-600" />
            Current Status
          </h3>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-primary-100 border-4 border-primary-50 flex items-center justify-center text-primary-700 text-3xl font-bold">
              {employeeData.employee_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
            </div>
            
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                employeeData.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' :
                employeeData.status === 'Notice Period' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                'bg-red-100 text-red-800 border-red-200'
              }`}>
                {employeeData.status}
              </span>
            </div>
            
            <div className="pt-4 border-t border-gray-100 w-full text-left space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 w-24">Employee ID</span>
                <span className="font-semibold text-gray-900">{employeeData.employee_id}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Nokia ID</span>
                <span className="font-semibold text-gray-900">{employeeData.nokia_id || '-'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium text-gray-900">{employeeData.phone_number || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
           <h3 className="text-lg font-bold text-gray-800 mb-6">Employment Details</h3>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <DetailWidget icon={<Briefcase size={20} />} label="Designation" value={employeeData.designation || '-'} />
             <DetailWidget icon={<Briefcase size={20} />} label="Project" value={employeeData.project_name || '-'} />
             <DetailWidget icon={<User size={20} />} label="Reporting Manager" value={employeeData.manager || '-'} />
             <DetailWidget icon={<Briefcase size={20} />} label="Department" value={employeeData.department || '-'} />
             <DetailWidget icon={<MapPin size={20} />} label="Work Location" value={employeeData.location || '-'} />
             <DetailWidget icon={<Calendar size={20} />} label="Joining Date" value={employeeData.joining_date ? new Date(employeeData.joining_date).toLocaleDateString() : '-'} />
           </div>

           {(employeeData.status === 'Notice Period' || employeeData.status === 'Ramp Down') && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8 p-4">
                <h4 className="text-orange-800 font-bold flex items-center gap-2 mb-3">
                  <Clock size={18} />
                  Offboarding Schedule
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-medium text-orange-600 mb-1">UST Last Working Date</span>
                    <span className="font-bold text-orange-900">{employeeData.ust_lwd ? new Date(employeeData.ust_lwd).toLocaleDateString() : 'Pending'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-orange-600 mb-1">Nokia Last Working Date</span>
                    <span className="font-bold text-orange-900">{employeeData.nokia_lwd ? new Date(employeeData.nokia_lwd).toLocaleDateString() : 'Pending'}</span>
                  </div>
                </div>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}

function DetailWidget({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
