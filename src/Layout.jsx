import { useState } from 'react';
import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routeArray } from '@/config/routes';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Redirect root to dashboard
  if (location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-dark-bg">
      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-dark-surface lg:border-r lg:border-surface-700">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-surface-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ApperIcon name="Store" className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">StoreSync AI</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {routeArray.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-surface-300 hover:bg-surface-700 hover:text-white'
                  }`
                }
              >
                <ApperIcon 
                  name={route.icon} 
                  className="w-5 h-5 mr-3 flex-shrink-0" 
                />
                {route.label}
              </NavLink>
            ))}
          </nav>

          {/* User info placeholder */}
          <div className="p-4 border-t border-surface-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <ApperIcon name="User" className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Store Manager</p>
                <p className="text-xs text-surface-400">storemanager@company.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isMobileMenuOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-dark-surface border-r border-surface-700"
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Mobile header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-surface-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ApperIcon name="Store" className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">StoreSync AI</h1>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-surface-700 transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5 text-surface-400" />
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {routeArray.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-surface-300 hover:bg-surface-700 hover:text-white'
                  }`
                }
              >
                <ApperIcon 
                  name={route.icon} 
                  className="w-5 h-5 mr-3 flex-shrink-0" 
                />
                {route.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-dark-surface border-b border-surface-700 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-700 transition-colors"
          >
            <ApperIcon name="Menu" className="w-6 h-6 text-surface-300" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ApperIcon name="Store" className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">StoreSync AI</h1>
          </div>
          <div className="w-10"></div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;