import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, ShoppingBag, Scissors, Ruler, Briefcase, Settings, FileText, User, Package, Calendar, Shirt, Tag, ChevronDown, ChevronRight, Shield, BookOpen, Trash2, Truck, ShoppingCart, DollarSign, LucideIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  path?: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
  children?: NavItem[];
}

const Sidebar = () => {
  const location = useLocation();
  const { userInfo: user } = useAuth();
  const navRef = useRef<HTMLElement>(null);
  
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => {
    const saved = sessionStorage.getItem('sidebarExpandedMenus');
    return saved ? JSON.parse(saved) : { 'Administration': true };
  });

  useEffect(() => {
    sessionStorage.setItem('sidebarExpandedMenus', JSON.stringify(expandedMenus));
  }, [expandedMenus]);

  useEffect(() => {
    const navElement = navRef.current;
    if (navElement) {
      const savedScroll = sessionStorage.getItem('sidebarScrollTop');
      if (savedScroll) {
        navElement.scrollTop = parseInt(savedScroll, 10);
      }

      const handleScroll = () => {
        sessionStorage.setItem('sidebarScrollTop', navElement.scrollTop.toString());
      };

      navElement.addEventListener('scroll', handleScroll);
      return () => navElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Tailor'] },
    { path: '/customers', label: 'Customers', icon: Users, roles: ['Admin', 'Tailor'] },
    { path: '/measurements', label: 'Measurements', icon: Ruler, roles: ['Admin', 'Tailor'] },
    { path: '/employees', label: 'Employees', icon: UserCheck, roles: ['Admin'] },
    { path: '/styles', label: 'Styles', icon: Scissors, roles: ['Admin', 'Tailor'] },
    { path: '/lookbook', label: 'Lookbook', icon: BookOpen, roles: ['Admin', 'Tailor'] },
    { path: '/orders', label: 'Orders', icon: ShoppingBag, roles: ['Admin', 'Tailor'] },
    { path: '/calendar', label: 'Schedule', icon: Calendar, roles: ['Admin', 'Tailor'] },
    { 
      label: 'Procurement', 
      icon: ShoppingCart, 
      roles: ['Admin'],
      children: [
        { path: '/suppliers', label: 'Suppliers', icon: Truck },
        { path: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
        { path: '/materials', label: 'Inventory', icon: Package },
      ]
    },
    { path: '/finance', label: 'Finance', icon: DollarSign, roles: ['Admin'] },
    { path: '/itemtypes', label: 'Templates', icon: Tag, roles: ['Admin'] },
    { path: '/jobs', label: 'Job Cards', icon: Briefcase, roles: ['Admin', 'Tailor'] },
    { path: '/reports', label: 'Reports', icon: FileText, roles: ['Admin'] },
    { 
      label: 'Administration', 
      icon: Shield, 
      roles: ['Admin'],
      children: [
        { path: '/users', label: 'Users', icon: User },
        { path: '/company', label: 'Company Settings', icon: Settings },
        { path: '/trash', label: 'Trash', icon: Trash2 },
      ]
    },
  ];

  const renderNavItem = (item: NavItem) => {
    if (user && item.roles && !item.roles.includes(user.role)) return null;

    if (item.children) {
      const hasActiveChild = item.children.some(child => child.path && isActive(child.path));
      const isExpanded = hasActiveChild || expandedMenus[item.label];
      const Icon = item.icon;

      return (
        <div key={item.label}>
          <button
            onClick={() => !hasActiveChild && toggleMenu(item.label)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 ${
              hasActiveChild || isExpanded
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            } ${hasActiveChild ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <div className="flex items-center">
              <Icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </div>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-2">
              {item.children.map(child => (
                child.path && (
                  <Link
                    key={child.path}
                    to={child.path}
                    className={`flex items-center px-4 py-2 rounded-e-lg transition-colors duration-200 text-sm ${
                      isActive(child.path)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    <child.icon className="w-4 h-4 mr-3" />
                    <span>{child.label}</span>
                  </Link>
                )
              ))}
            </div>
          )}
        </div>
      );
    }

    const Icon = item.icon;
    return item.path ? (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center px-4 py-3 rounded-e-lg transition-colors duration-200 ${
          isActive(item.path)
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5 mr-3" />
        <span>{item.label}</span>
      </Link>
    ) : null;
  };

  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen transition-colors duration-200">
      <div className="p-6 flex items-center">
        <div className="relative mr-3">
          <Shirt className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <Tag className="w-4 h-4 text-blue-400 dark:text-blue-200 absolute -bottom-1 -right-2 transform -rotate-12" />
        </div>
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">FTMS</h1>
      </div>
      
      <nav ref={navRef} className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map(renderNavItem)}
      </nav>
    </div>
  );
};

export default Sidebar;