import { useState, useRef, useEffect, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, UserCog , ChevronDown, ChevronLeft, Moon, Sun } from 'lucide-react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import NotificationDropdown from './NotificationDropdown';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../constants';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout = ({ children, title }: LayoutProps) => {
  const { userInfo, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden transition-colors duration-200">
      {userInfo && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm relative z-30 shrink-0 transition-colors duration-200">
          <div className="flex justify-between items-center px-8 py-4">
            <div className="flex items-center">
                {!userInfo && (
                    <Link to="/login" className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <ChevronLeft size={24} />
                    </Link>
                )}
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{title}</h2>
            </div>
            <div className="flex items-center space-x-4">
              {userInfo && <NotificationDropdown />}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              <div className="relative" ref={dropdownRef}>
                {userInfo ? (
                  <>
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-3 focus:outline-none"
                    >
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{userInfo?.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{userInfo?.role}</p>
                      </div>
                      {userInfo?.avatar ? (
                        <img 
                          src={`${API_URL}${userInfo.avatar.startsWith('/') ? '' : '/'}${userInfo.avatar}`} 
                          alt={userInfo.username} 
                          className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                          {userInfo?.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {isDropdownOpen ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-400 dark:border-gray-600 z-50">
                        <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white dark:bg-gray-800 transform rotate-45 border-t border-l border-gray-400 dark:border-gray-600"></div>
                        <div className="absolute -top-px right-4 w-3 h-2 bg-white dark:bg-gray-800"></div>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 relative z-10"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <UserCog className="w-4 h-4 mr-2" />
                          Profile & Settings
                        </Link>
                        <button
                          onClick={handleLogoutClick}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 relative z-10"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link to="/track-order" className="text-gray-600 hover:text-gray-900 font-medium dark:text-gray-400 dark:hover:text-gray-200">
                        Track Order
                    </Link>
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium dark:text-indigo-400 dark:hover:text-indigo-300">
                        Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
          <div className="flex-1 p-8">
            {children}
          </div>
          <Footer />
        </main>
      </div>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
        isDangerous={true}
      />
    </div>
  );
};

export default Layout;
