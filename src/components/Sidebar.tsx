import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  UserPlus, 
  FileBarChart, 
  Settings, 
  LogOut,
  X,
  Calendar,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const allNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Overall Employees', path: '/employees', icon: Users },
  { name: 'Active Employees', path: '/active-employees', icon: UserCheck },
  { name: 'New Joiner', path: '/new-joiners', icon: UserPlus },
  { name: 'Leave Management', path: '/leave-permission', icon: Calendar },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { name: 'Reports', path: '/reports', icon: FileBarChart },
  { name: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate('/login');
  };

  return (
    <div className="flex flex-col w-full text-white h-full">
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#3b5bdb]/30 shrink-0">
        <h1 className="sidebar-logo font-bold tracking-wider">NSN Tracker</h1>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-gray-300 hover:text-white p-2 flex items-center justify-center">
            <X size={24} />
          </button>
        )}
      </div>
      <nav className="sidebar-nav">
        {((role === 'Employee' || role === 'employee')
          ? [
              { name: 'Leave Management', path: '/leave-permission', icon: Calendar },
              { name: 'Settings', path: '/settings', icon: Settings },
            ]
          : allNavItems
        ).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`nav-item flex items-center gap-4 mx-4 rounded-xl transition-colors duration-200 ${
                isActive 
                  ? 'bg-[#3b5bdb] text-white font-semibold' 
                  : 'text-gray-300 hover:bg-[#3b5bdb]/50 hover:text-white font-medium'
              }`}
            >
              <Icon size={24} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="pt-4 mt-2 border-t border-[#3b5bdb]/30 shrink-0">
        <button 
          onClick={handleLogout}
          className="nav-item w-full flex items-center gap-4 mx-4 rounded-xl text-gray-300 hover:bg-[#3b5bdb]/50 hover:text-white transition-colors duration-200"
        >
          <LogOut size={24} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
