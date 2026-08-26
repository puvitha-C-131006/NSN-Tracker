import { useState, useEffect } from 'react';
import { Users, UserCheck, UserPlus, TrendingDown, Clock, ArrowRight, FileText, Settings, UserX, Calendar } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    rampDown: 0,
    noticePeriod: 0,
    newJoiners: 0,
    present: 0,
    absent: 0,
    onLeave: 0
  });

  const [loading, setLoading] = useState(true);

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

    // Fetch today's attendance
    const today = new Date().toISOString().split('T')[0];
    const { data: attendanceData } = await supabase.from('attendance').select('status').eq('date', today);
    
    let presentCount = 0, absentCount = 0, onLeaveCount = 0;
    if (attendanceData) {
      presentCount = attendanceData.filter(a => a.status === 'Present').length;
      absentCount = attendanceData.filter(a => a.status === 'Absent').length;
      onLeaveCount = attendanceData.filter(a => a.status === 'On Leave').length;
    }

    setMetrics({
      total: totalCount || 0,
      active: activeCount || 0,
      rampDown: rampDownCount || 0,
      noticePeriod: noticeCount || 0,
      newJoiners: newJoinersCount || 0,
      present: presentCount,
      absent: absentCount,
      onLeave: onLeaveCount
    });
    
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-gray-900 leading-none">Dashboard Overview</h1>
          <p className="page-subtitle text-gray-500 mt-1">Here is what's happening with your workforce today.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Last updated: Just now</span>
          <button onClick={fetchDashboardData} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold shadow-sm transition-all">
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="dashboard-card-grid">
        <DashboardCard 
          title="Total Employees" 
          value={metrics.total.toString()} 
          icon={<Users size={24} />} 
          trend="All time"
          trendUp={true}
        />
        <DashboardCard 
          title="Active Employees" 
          value={metrics.active.toString()} 
          icon={<UserCheck size={24} />} 
          trend="Currently active"
          trendUp={true}
        />
        <DashboardCard 
          title="New Joiners" 
          value={metrics.newJoiners.toString()} 
          icon={<UserPlus size={24} />} 
          trend="Last 30 days"
          trendUp={true}
        />
        <DashboardCard 
          title="Ramp Down" 
          value={metrics.rampDown.toString()} 
          icon={<TrendingDown size={24} />} 
          trend="Scheduled"
          trendUp={false}
        />
        <DashboardCard 
          title="Notice Period" 
          value={metrics.noticePeriod.toString()} 
          icon={<Clock size={24} />} 
          trend="Resignations"
          trendUp={false}
        />
        <DashboardCard 
          title="Present Today" 
          value={metrics.present.toString()} 
          icon={<UserCheck size={24} className="text-green-600" />} 
          trend="Today"
          trendUp={true}
        />
        <DashboardCard 
          title="Absent Today" 
          value={metrics.absent.toString()} 
          icon={<UserX size={24} className="text-red-600" />} 
          trend="Today"
          trendUp={false}
        />
        <DashboardCard 
          title="On Leave Today" 
          value={metrics.onLeave.toString()} 
          icon={<Calendar size={24} className="text-orange-500" />} 
          trend="Today"
          trendUp={false}
        />
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Left Column: Charts & Status */}
        <div className="flex-1 xl:flex-[2] space-y-6 min-w-0">
          {/* Charts Placeholder */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-800">Headcount Trend</h2>
              <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary-500 text-gray-600">
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="h-72 w-full bg-gray-50 border border-dashed border-gray-200 rounded-lg flex items-center justify-center flex-col gap-3">
               <FileBarChartPlaceholder />
               <p className="text-gray-400 font-medium">Headcount Chart Visualization</p>
            </div>
          </div>

          {/* Employee Status Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
             <h2 className="text-gray-800 mb-6">Employee Status Summary</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusItem label="Active" count={metrics.active.toString()} percentage={metrics.total ? Math.round((metrics.active / metrics.total) * 100) + '%' : '0%'} color="bg-green-500" />
                <StatusItem label="Notice Period" count={metrics.noticePeriod.toString()} percentage={metrics.total ? Math.round((metrics.noticePeriod / metrics.total) * 100) + '%' : '0%'} color="bg-orange-500" />
                <StatusItem label="Ramp Down" count={metrics.rampDown.toString()} percentage={metrics.total ? Math.round((metrics.rampDown / metrics.total) * 100) + '%' : '0%'} color="bg-red-500" />
             </div>
             {/* Progress Bar */}
             <div className="w-full h-3 bg-gray-100 rounded-full mt-6 flex overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: metrics.total ? `${(metrics.active / metrics.total) * 100}%` : '0%' }}></div>
                <div className="h-full bg-orange-500" style={{ width: metrics.total ? `${(metrics.noticePeriod / metrics.total) * 100}%` : '0%' }}></div>
                <div className="h-full bg-red-500" style={{ width: metrics.total ? `${(metrics.rampDown / metrics.total) * 100}%` : '0%' }}></div>
             </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Activities */}
        <div className="flex-1 xl:flex-[1] space-y-6 min-w-0">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickActionButton icon={<UserPlus size={18} />} label="Onboard New Employee" link="/new-joiners" />
              <QuickActionButton icon={<FileText size={18} />} label="Generate HR Report" link="/reports" />
              <QuickActionButton icon={<Settings size={18} />} label="System Configuration" link="/settings" />
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-800">Recent Activities</h2>
              <button className="text-primary-600 text-sm font-medium hover:text-primary-700">View All</button>
            </div>
            <div className="space-y-6">
              <ActivityItem 
                title="System Setup" 
                desc="Dashboard initialized." 
                time="Just now"
                type="neutral"
              />
              <p className="text-sm text-gray-400 italic text-center">Activity log will populate as events occur.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Helper Components for clean file structure */
function QuickActionButton({ icon, label, link }: { icon: React.ReactNode, label: string, link: string }) {
  return (
    <a href={link} className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-sm hover:bg-primary-50 transition-all group">
      <div className="flex items-center gap-3 text-gray-700 group-hover:text-primary-700 font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <ArrowRight size={18} className="text-gray-400 group-hover:text-primary-600 transition-transform group-hover:translate-x-1" />
    </a>
  );
}

function StatusItem({ label, count, percentage, color }: { label: string, count: string, percentage: string, color: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-800">{count}</span>
        <span className="text-sm font-semibold text-gray-400 pb-1">{percentage}</span>
      </div>
    </div>
  );
}

function ActivityItem({ title, desc, time, type }: { title: string, desc: string, time: string, type: 'positive' | 'warning' | 'neutral' }) {
  const bulletColor = type === 'positive' ? 'bg-green-500' : type === 'warning' ? 'bg-orange-500' : 'bg-blue-500';
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${bulletColor}`}></div>
        <div className="w-px h-full bg-gray-200 mt-2"></div>
      </div>
      <div className="pb-4">
        <h4 className="text-sm font-bold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
        <span className="text-xs font-semibold text-gray-400 mt-2 block">{time}</span>
      </div>
    </div>
  );
}

function FileBarChartPlaceholder() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 17v-4" />
      <path d="M12 17V7" />
      <path d="M17 17v-8" />
    </svg>
  );
}
