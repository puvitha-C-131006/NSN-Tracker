import { useState } from 'react';
import { User, Bell, Palette, Shield, Info, Save, X, Key, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const { user, role } = useAuth();
  
  // Modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    if (!user?.email) {
      setErrorMsg('Not authenticated.');
      return;
    }

    setIsUpdating(true);

    // Verify current password matches what is in the DB
    const { data: userData, error: verifyError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .eq('password', currentPassword)
      .single();

    if (verifyError || !userData) {
      setErrorMsg('Current password is incorrect.');
      setIsUpdating(false);
      return;
    }

    // Update to new password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', userData.id);

    if (updateError) {
      setErrorMsg('Failed to update password.');
    } else {
      setSuccessMsg('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        closePasswordModal();
      }, 2000);
    }
    
    setIsUpdating(false);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-gray-900 leading-none">Settings</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* 1. User Profile */}
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
              <User size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">User Profile</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none text-gray-700" value={user?.full_name || 'Loading...'} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none text-gray-700" value={user?.email || 'Loading...'} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none text-gray-700 capitalize" value={role || 'Loading...'} readOnly />
            </div>
            <div className="flex items-end">
              <button onClick={() => setIsPasswordModalOpen(true)} className="w-full px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
                <Key size={18} />
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* 2. Application Settings */}
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
              <Palette size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Application Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700 transition-colors">
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
                <option value="system">System Default</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-700 transition-colors">
                <option value="en">English (US)</option>
                <option value="uk">English (UK)</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Notification Settings */}
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
              <Bell size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Notification Settings</h2>
          </div>
          <div className="space-y-4 max-w-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive alerts via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">System Notifications</p>
                <p className="text-sm text-gray-500">In-app popup notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 4. Admin Settings */}
        {role === 'admin' && (
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                <Shield size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Admin Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group">
                <span className="font-medium text-gray-700 group-hover:text-primary-700">Manage Users</span>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-primary-600" />
              </button>
              <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group">
                <span className="font-medium text-gray-700 group-hover:text-primary-700">Manage Roles</span>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-primary-600" />
              </button>
              <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group">
                <span className="font-medium text-gray-700 group-hover:text-primary-700">Audit Logs</span>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-primary-600" />
              </button>
            </div>
          </div>
        )}

        {/* 5. About */}
        <div className="p-6 sm:p-8 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
              <Info size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">About</h2>
          </div>
          <div className="ml-11 text-sm text-gray-600">
            <p><span className="font-medium text-gray-800">Application Name:</span> NSN Tracker</p>
            <p className="mt-1"><span className="font-medium text-gray-800">Version:</span> 1.0.0</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 border-t border-gray-100 p-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
          <button type="button" className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2 shadow-sm transition-colors">
            <X size={18} />
            Cancel
          </button>
          <button type="button" className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center gap-2 shadow-sm transition-colors">
            <Save size={18} />
            Save Changes
          </button>
        </div>

      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
              <button onClick={closePasswordModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium">
                  {successMsg}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input 
                    type={showCurrent ? "text" : "password"} 
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input 
                    type={showNew ? "text" : "password"} 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirm ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closePasswordModal} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdating} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50">
                  {isUpdating ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
