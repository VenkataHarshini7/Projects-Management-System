import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  User,
  LogOut,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getNavItems = () => {
    if (userProfile?.role === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/projects', label: 'Projects', icon: FolderKanban },
        { path: '/admin/reports', label: 'Reports', icon: FileText }
      ];
    } else if (userProfile?.role === 'project_manager') {
      return [
        { path: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/manager/projects', label: 'Projects', icon: FolderKanban },
        { path: '/manager/resources', label: 'Resources', icon: Users },
        { path: '/manager/reports', label: 'Reports', icon: FileText }
      ];
    } else if (userProfile?.role === 'employee') {
      return [
        { path: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/employee/profile', label: 'Profile', icon: User },
        { path: '/employee/projects', label: 'My Projects', icon: FolderKanban }
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 p-2 rounded-md hover:bg-gray-100 lg:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              Resource Management Platform
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {userProfile?.fullName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userProfile?.role?.replace('_', ' ')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out mt-[60px] lg:mt-0`}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
