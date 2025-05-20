import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  LayoutDashboard, 
  Users, 
  FileUp, 
  LogOut, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const isAdmin = user?.role === 'admin';

  const links = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      showTo: ['user', 'admin'],
    },
    {
      title: 'Tenders',
      path: '/tenders',
      icon: <FileText size={20} />,
      showTo: ['user', 'admin'],
    },
    {
      title: 'Upload Tender',
      path: '/tenders/upload',
      icon: <FileUp size={20} />,
      showTo: ['user', 'admin'],
    },
    {
      title: 'Manage Users',
      path: '/admin/users',
      icon: <Users size={20} />,
      showTo: ['admin'],
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: <Settings size={20} />,
      showTo: ['user', 'admin'],
    },
  ];

  // Filter links based on user role
  const filteredLinks = links.filter((link) => 
    link.showTo.includes(user?.role || '')
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggle}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-indigo-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-indigo-700">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <FileText size={24} />
            <span className="text-xl font-semibold">Tender System</span>
          </Link>
          <button onClick={toggle} className="lg:hidden">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-indigo-300 text-sm">Welcome,</p>
          <p className="font-medium">{user?.name}</p>
          <p className="text-xs text-indigo-300 mt-1 capitalize">
            {user?.role} Account
          </p>
        </div>

        <nav className="mt-4">
          <ul className="space-y-1">
            {filteredLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center px-4 py-3 text-sm ${
                    location.pathname === link.path
                      ? 'bg-indigo-900 text-white'
                      : 'text-indigo-100 hover:bg-indigo-700'
                  }`}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.title}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={logout}
                className="w-full flex items-center px-4 py-3 text-sm text-indigo-100 hover:bg-indigo-700"
              >
                <span className="mr-3">
                  <LogOut size={20} />
                </span>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={toggle}
        className="fixed bottom-4 right-4 z-20 lg:hidden bg-indigo-600 text-white p-3 rounded-full shadow-lg"
      >
        <Menu size={24} />
      </button>
    </>
  );
};

export default Sidebar;