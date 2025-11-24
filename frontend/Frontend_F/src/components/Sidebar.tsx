import React, { useState } from 'react';
import {
  Home, User, Users, Wrench, BookOpen, LogOut, Briefcase,
  Menu, X, Globe, ChevronDown, List, Bell, ChevronLeft, ChevronRight, Sprout
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { Language } from '../types';
// import { useClerk } from '@clerk/clerk-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeSection?: string;
  setActiveSection?: (section: string) => void;
  userType: 'farmer' | 'worker';
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, userType }) => {
  const { user, language, setLanguage, setUser } = useApp();
  // const { signOut } = useClerk();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    // signOut().then(() => navigate('/'));
    navigate('/');
  };

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  ];
  // Helper to check if item is active
  const isActive = (itemPath: string, itemId: string) => {
    if (itemPath === '/agri-tools') return location.pathname === '/agri-tools';
    if (itemPath === '/lease-equipment') return location.pathname === '/lease-equipment';

    // If we are using state-based navigation (activeSection prop provided)
    if (activeSection && setActiveSection) {
      return activeSection === itemId;
    }

    // Fallback for route based
    return location.pathname === itemPath;
  };

  const handleNavigation = (item: any) => {
    if (item.path === '/agri-tools' || item.path === '/lease-equipment') {
      // Navigate to new page
      return;
    }

    const dashboardPath = userType === 'farmer' ? '/farmer-dashboard' : '/worker-dashboard';

    // If it's a dashboard section and we have the setter, use it
    if (setActiveSection) {
      setActiveSection(item.id);
      // Also ensure we are on the dashboard route
      if (location.pathname !== '/farmer-dashboard' && location.pathname !== '/worker-dashboard') {
        navigate(`${dashboardPath}?tab=${item.id}`);
      }
    } else {
      // If we don't have the setter (e.g. on AgriTools page), navigate to dashboard with tab param
      navigate(`${dashboardPath}?tab=${item.id}`);
    }
  };

  const farmerMenuItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/farmer-dashboard' },
    { id: 'profile', icon: User, label: 'Profile', path: '/farmer-dashboard' },
    { id: 'find-workers', icon: Users, label: 'Find Workers', path: '/farmer-dashboard' },
    { id: 'job-listings', icon: List, label: 'Job Listings', path: '/farmer-dashboard' },
    { id: 'applications', icon: Bell, label: 'Applications', path: '/farmer-dashboard' },
    { id: 'lease-assets', icon: Wrench, label: 'Lease Land & Equipment', path: '/lease-equipment' },
    { id: 'news', icon: BookOpen, label: 'News & Education', path: '/farmer-dashboard' },
    { id: 'agri-tools', icon: Sprout, label: 'Agri-Tools (AI & Data)', path: '/agri-tools' },
  ];

  const workerMenuItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/worker-dashboard' },
    { id: 'profile', icon: User, label: 'Profile', path: '/worker-dashboard' },
    { id: 'find-work', icon: Briefcase, label: 'Find Work', path: '/worker-dashboard' },
    { id: 'applications', icon: Bell, label: 'Applications', path: '/worker-dashboard' },
    { id: 'news', icon: BookOpen, label: 'News & Education', path: '/worker-dashboard' },
    { id: 'agri-tools', icon: Sprout, label: 'Agri-Tools (AI & Data)', path: '/agri-tools' },
  ];

  const menuItems = userType === 'farmer' ? farmerMenuItems : workerMenuItems;

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg h-full flex flex-col border-r border-gray-200 transition-all duration-300`}>
      {/* Header */}
      <div className={`${isCollapsed ? 'p-3' : 'p-6'} border-b border-gray-200 bg-green-50`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <img
                src="/image.png"
                alt="FarmConnect Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{user?.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{user?.userType}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        {isCollapsed && (
          <div className="mt-2 flex justify-center">
            <img
              src="/image.png"
              alt="FarmConnect Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.id}>
              {item.path === '/agri-tools' || item.path === '/lease-equipment' ? (
                <Link
                  to={item.path}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg transition-all text-left font-medium hover:bg-gray-100 ${isActive(item.path, item.id)
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon size={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              ) : (
                <button
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg transition-all text-left font-medium hover:bg-gray-100 ${isActive(item.path, item.id)
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon size={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Language Selector */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-medium"
            >
              <div className="flex items-center space-x-3">
                <Globe size={20} className="text-green-600" />
                <span>Language</span>
              </div>
              <ChevronDown size={16} className="text-green-600" />
            </button>

            {showLanguageDropdown && (
              <div className="absolute bottom-full mb-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[160px] z-30 overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors font-medium border-b border-gray-100 last:border-b-0 ${language === lang.code ? 'bg-green-50 text-green-800' : 'text-gray-700'
                      }`}
                  >
                    <span className="mr-3 text-lg">{lang.flag}</span>
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;