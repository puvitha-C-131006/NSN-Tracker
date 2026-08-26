import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  sendRampDownEmail, 
  sendNoticePeriodEmail, 
  sendMovementEmail, 
  sendAdvancementEmail 
} from '../lib/emailService';

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [emailToast, setEmailToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  
  const [options, setOptions] = useState({
    account_status: [] as string[],
    attrition_type: ['Movement', 'Advancement', 'Resignation', 'Performance', 'Other']
  });

  useEffect(() => {
    fetchOptions();
    if (id) fetchEmployee();
  }, [id]);

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

  const fetchEmployee = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching employee:", error);
      setErrorMsg(error.message || 'Employee not found.');
    } else if (data) {
      const mappedData = { ...data, account_status: data.status, ust_id: data.employee_id };
      setFormData(mappedData);
      setOriginalData(mappedData);
    } else {
      setErrorMsg('Employee not found.');
    }
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    const { error } = await supabase
      .from('employees')
      .update({
        status: formData.account_status
      })
      .eq('id', id);

    if (error) {
      setErrorMsg(error.message);
      setIsSaving(false);
      return;
    }

    // Handle Email Triggers
    const statusChanged = originalData.account_status !== formData.account_status;
    const attritionChanged = originalData.attrition_type !== formData.attrition_type;

    let emailSent = false;

    if (formData.account_status === 'Ramp Down' && formData.nokia_lwd) {
      await sendRampDownEmail(formData.email, formData.manager, formData.nokia_lwd);
      emailSent = true;
    }
    
    if (formData.account_status === 'Notice Period' && formData.ust_lwd) {
      await sendNoticePeriodEmail(formData.manager, formData.employee_name, formData.ust_lwd);
      emailSent = true;
    }
    
    if (formData.account_status === 'Active' && formData.attrition_type === 'Movement' && attritionChanged) {
      await sendMovementEmail(formData.email, formData.manager);
    }

    if (formData.account_status === 'Active' && formData.attrition_type === 'Advancement' && attritionChanged) {
      await sendAdvancementEmail(formData.email, formData.manager);
    }

    if (emailSent) {
      setEmailToast(true);
      setTimeout(() => setEmailToast(false), 3000);
    }

    // Log to History table
    if (statusChanged) {
      await supabase.from('employee_history').insert([{
        employee_ust_id: formData.ust_id,
        change_type: 'Status Change',
        old_value: originalData.account_status,
        new_value: formData.account_status
      }]);
    }

    setShowSuccess(true);
    setIsSaving(false);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/active-employees');
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-6 text-center text-red-600 font-medium bg-red-50 rounded-lg">
        {errorMsg}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link to="/active-employees" className="btn p-2 hover:bg-gray-200 rounded-full transition-colors bg-gray-100 flex items-center justify-center">
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <h1 className="text-gray-900 leading-none">Edit Employee</h1>
      </div>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center gap-3 shadow-sm transition-all duration-300">
          <CheckCircle2 size={20} className="text-green-600" />
          <span className="font-medium">Employee updated!</span>
        </div>
      )}

      {emailToast && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 flex items-center gap-3 shadow-sm transition-all duration-300 mt-2">
          <CheckCircle2 size={20} className="text-blue-600" />
          <span className="font-medium">Email sent to engineer</span>
        </div>
      )}

      {errorMsg && !showSuccess && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 shadow-sm">
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{formData.employee_name}</h2>
            <p className="text-sm text-gray-500 mt-1">ID: {formData.ust_id} | Project: {formData.project_name}</p>
          </div>
          <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
            Current Status: {originalData.account_status}
          </span>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
              <select name="account_status" value={formData.account_status} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700">
                {options.account_status?.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attrition Type</label>
              <select name="attrition_type" value={formData.attrition_type || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700">
                <option value="">None</option>
                {options.attrition_type?.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nokia LWD</label>
              <input name="nokia_lwd" value={formData.nokia_lwd || ''} onChange={handleInputChange} type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-700" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UST LWD</label>
              <input name="ust_lwd" value={formData.ust_lwd || ''} onChange={handleInputChange} type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-700" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks / Attrition Reason</label>
              <input name="attrition_reason" value={formData.attrition_reason || ''} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-700" placeholder="Reason for status change or attrition" />
            </div>

          </div>
        </div>

        <div className="bg-gray-50 border-t border-gray-100 p-6 flex justify-end gap-3">
          <Link to="/active-employees" className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-center shadow-sm">
            Cancel
          </Link>
          <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70">
            <Save size={18} />
            {isSaving ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </form>
    </div>
  );
}
