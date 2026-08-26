import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Mail, Lock, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Query users table for matching email and password
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, role, employee_ref_id')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (userError || !userData) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }

    // Success! Update auth state
    login({
      id: userData.id,
      full_name: userData.full_name || '',
      email: userData.email,
      role: userData.role,
      employee_ref_id: userData.employee_ref_id
    });

    if (userData.role === 'Admin' || userData.role === 'HR Manager' || userData.role === 'admin') {
      navigate('/dashboard');
    } else {
      // Default for Employee or others
      navigate('/leave-permission');
    }
  };

  return (
    <div className="flex w-full min-h-[100dvh] box-border bg-white font-sans selection:bg-[#1e2a5e] selection:text-white">
      {/* Left Panel: Branding Side (~45% width) */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 text-white relative overflow-hidden" 
           style={{ background: 'linear-gradient(135deg, #1e2a5e 0%, #2d3a8c 100%)' }}>
        
        {/* Subtle abstract shapes/blobs */}
        <div className="absolute top-[-15%] left-[-15%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[600px] h-[600px] bg-[#4f46e5]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-[#38bdf8]/10 rounded-full blur-[60px] pointer-events-none" />

        {/* Top: Logo & Name */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20 shadow-xl">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-[24px] font-bold tracking-tight text-white">NSN Tracker</span>
        </div>

        {/* Middle: Hero Content */}
        <div className="relative z-10 flex flex-col gap-6 mt-12 mb-auto pt-16">
          <h1 className="text-[42px] font-bold text-white leading-[1.1] tracking-tight">
            Manage your workforce,<br />effortlessly.
          </h1>
          <p className="text-[16px] text-white/80 leading-relaxed max-w-md font-light">
            Empower your organization with real-time insights, streamlined processes, and a unified platform for all your HR needs.
          </p>
          
          {/* Feature Bullets */}
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#38bdf8]" />
              <span className="text-white/90 text-sm font-medium">Real-time employee tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#38bdf8]" />
              <span className="text-white/90 text-sm font-medium">Automated leave management</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#38bdf8]" />
              <span className="text-white/90 text-sm font-medium">Insightful analytics dashboard</span>
            </div>
          </div>
        </div>

        {/* Bottom: Footer */}
        <div className="relative z-10 text-[13px] text-white/60 font-medium tracking-wide">
          &copy; 2026 NSN Tracker. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Form Side (~55% width) */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 bg-[#f8fafc] relative">
        <div className="w-full max-w-[440px] mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 transition-all">
          
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-8 justify-center">
            <div className="bg-gradient-to-br from-[#1e2a5e] to-[#2d3a8c] p-3.5 rounded-xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#1e2a5e] tracking-tight">NSN Tracker</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-[32px] font-bold text-[#1e2a5e] mb-2 tracking-tight">Welcome back</h2>
            <p className="text-[15px] text-gray-500 font-medium">Please enter your details to sign in.</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3.5 bg-red-50/80 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full flex-shrink-0" />
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[14px] font-semibold text-gray-700">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2d3a8c] transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-[3px] focus:ring-[#2d3a8c]/15 focus:border-[#2d3a8c] transition-all hover:border-gray-300"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-[14px] font-semibold text-gray-700">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2d3a8c] transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-[3px] focus:ring-[#2d3a8c]/15 focus:border-[#2d3a8c] transition-all hover:border-gray-300"
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 pb-2">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  className="h-4 w-4 text-[#2d3a8c] focus:ring-[#2d3a8c] border-gray-300 rounded cursor-pointer transition-colors" 
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-[14px] font-medium text-gray-600 cursor-pointer select-none hover:text-gray-800 transition-colors">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-[14px] font-semibold text-[#2d3a8c] hover:underline hover:text-[#1e2a5e] transition-colors">
                Forgot password?
              </a>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#2d3a8c]/20 text-[15px] font-bold text-white bg-gradient-to-r from-[#1e2a5e] to-[#2d3a8c] hover:from-[#151d45] hover:to-[#212b6b] focus:outline-none focus:ring-[3px] focus:ring-[#2d3a8c]/30 transition-all hover:-translate-y-[1px] active:translate-y-[1px] active:scale-[0.99] disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>

            <div className="relative mt-6 mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-400 font-medium">or</span>
              </div>
            </div>

            <p className="text-center text-[14px] text-gray-500 font-medium">
              Don't have an account? <a href="#" className="text-[#2d3a8c] font-semibold hover:underline">Contact your administrator</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
