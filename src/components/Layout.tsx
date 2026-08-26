import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-shell bg-gray-50 font-sans text-gray-900">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-20 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div className={`sidebar bg-[#1e2a5e] shadow-2xl md:shadow-none ${isMobileMenuOpen ? 'open' : ''}`}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="main-area flex flex-col bg-[#f5f6fa]">
        {/* Top Header */}
        <header className="top-header bg-white border-b border-gray-200 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="md:hidden text-gray-600 hover:bg-gray-100 hover:text-primary-600 rounded-lg transition-colors p-2 flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            {/* Search Bar */}
            <div className="search-bar hidden md:flex items-center w-full max-w-xl bg-gray-50 border border-gray-200 rounded-lg px-4 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
              <Search className="text-gray-400 mr-2" size={16} />
              <input 
                type="text" 
                placeholder="Search employees, reports, or actions..." 
                className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-400 text-gray-700 h-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 ml-4">
            {/* Notification Bell */}
            <button className="relative text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors p-2 flex items-center justify-center">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer group">
              <div className="hidden sm:flex flex-col items-end">
                <span className="user-name font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">Admin User</span>
                <span className="user-role text-gray-500">HR Manager</span>
              </div>
              <div className="avatar rounded-full bg-primary-100 flex items-center justify-center text-primary-900 font-bold shadow-inner border border-primary-200 group-hover:bg-primary-200 transition-colors">
                AD
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
