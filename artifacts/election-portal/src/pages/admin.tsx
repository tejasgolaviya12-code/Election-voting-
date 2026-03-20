import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { LayoutDashboard, Vote, Users as UsersIcon, Settings } from "lucide-react";
import AdminDashboard from "./admin-dashboard";
import AdminElections from "./admin-elections";
import AdminCandidates from "./admin-candidates";
import AdminUsers from "./admin-users";

export default function AdminLayout() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      setLocation("/");
    }
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading || !isAdmin) return <div className="p-20 flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" /></div>;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'elections', label: 'Elections', icon: Vote },
    { id: 'candidates', label: 'Candidates', icon: UsersIcon },
    { id: 'users', label: 'Users', icon: Settings },
  ];

  return (
    <div className="flex h-full min-h-[calc(100vh-80px)] bg-slate-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white tracking-wide">Admin Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Control Center</p>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? 'bg-primary text-white font-medium shadow-lg shadow-primary/20' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Tab Scroller */}
        <div className="md:hidden bg-slate-900 overflow-x-auto flex px-2 py-2 hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center px-4 py-2 mx-1 rounded-lg text-sm ${
                activeTab === tab.id ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'elections' && <AdminElections />}
          {activeTab === 'candidates' && <AdminCandidates />}
          {activeTab === 'users' && <AdminUsers />}
        </div>
      </div>
    </div>
  );
}
