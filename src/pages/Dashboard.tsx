import React, { useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Mail, LogOut, Search, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import DashboardHome from '../components/dashboard/DashboardHome';
import LeadsList from '../components/dashboard/LeadsList';
import EmailTemplates from '../components/dashboard/EmailTemplates';
import SettingsPage from '../components/dashboard/Settings';
import { storeLead } from '../lib/supabase';

export default function Dashboard() {
  const { agency, signOut } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for leads from embedded scanners
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'NEW_LEAD') {
        console.log('Received lead from embedded scanner:', event.data.lead);
        try {
          // Store the lead in the dashboard's localStorage
          await storeLead(event.data.lead);
          console.log('Successfully stored lead from embedded scanner');
        } catch (error) {
          console.error('Failed to store lead from embedded scanner:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">GBP Optimizer</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink
                  to="/dashboard"
                  end
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Overview
                </NavLink>
                <NavLink
                  to="/scanner"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <Search className="h-4 w-4 mr-2" />
                  Scanner
                </NavLink>
                <NavLink
                  to="/dashboard/leads"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <Users className="h-4 w-4 mr-2" />
                  Leads
                </NavLink>
                <NavLink
                  to="/dashboard/email-templates"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Templates
                </NavLink>
                <NavLink
                  to="/dashboard/settings"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </NavLink>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">{agency?.name}</span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/leads" element={<LeadsList />} />
          <Route path="/email-templates" element={<EmailTemplates />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}