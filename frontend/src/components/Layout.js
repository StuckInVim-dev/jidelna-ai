import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserCircleIcon, 
  CogIcon, 
  CalendarIcon, 
  HeartIcon, 
  UserAddIcon,
  LoginIcon 
} from '@heroicons/react/outline';

const Layout = ({ children, isLoggedIn, userData }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  // Function to mask email (show only first 3 characters + domain)
  const maskEmail = (email) => {
    if (!email) return '';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    
    const username = parts[0];
    const domain = parts[1];
    
    if (username.length <= 3) return email;
    return `${username.substring(0, 3)}...@${domain}`;
  };
  
  // Common nav links for all users
  const commonNavLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
  ];

  // Nav links for logged-in users only
  const authenticatedNavLinks = [
    { name: 'Menu', path: '/menu', icon: CalendarIcon },
    { name: 'Food Selector', path: '/food-selector', icon: HeartIcon },
    { name: 'Preferences', path: '/preferences', icon: CogIcon },
    { name: 'Settings', path: '/settings', icon: UserCircleIcon }
  ];

  // Nav links for guests only
  const guestNavLinks = [
    { name: 'Login', path: '/login', icon: LoginIcon },
    { name: 'Register', path: '/register', icon: UserAddIcon }
  ];

  // Determine which nav links to show based on login status
  const navLinks = [...commonNavLinks, ...(isLoggedIn ? authenticatedNavLinks : [])];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-secondary-900">
      {/* Header */}
      <header className="bg-white dark:bg-secondary-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and main nav */}
            <div className="flex-1 flex items-center justify-between">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-primary-600 dark:text-primary-400 font-bold text-xl">
                  Strava Canteen
                </Link>
              </div>
              
              {/* Desktop navigation */}
              <nav className="hidden md:flex md:space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`
                      inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
                      ${location.pathname === link.path 
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-secondary-700' 
                        : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-secondary-700'}
                    `}
                  >
                    <link.icon className="mr-1.5 h-5 w-5" />
                    {link.name}
                  </Link>
                ))}
              </nav>
            
              {/* User info and auth buttons (desktop) */}
              <div className="hidden md:flex md:items-center md:space-x-3">
                {isLoggedIn ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                      {userData.strava_username && (
                        <span className="text-sm font-medium text-secondary-900 dark:text-secondary-200">
                          {userData.strava_username}
                        </span>
                      )}
                      {userData.email && (
                        <span className="text-xs text-secondary-500 dark:text-secondary-400">
                          {maskEmail(userData.email)}
                        </span>
                      )}
                    </div>
                    {userData.konto !== undefined && (
                      <div className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm font-medium">
                        {userData.konto.toFixed(2)} Kč
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {guestNavLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`btn ${link.name === 'Login' ? 'btn-primary' : 'btn-outline'}`}
                      >
                        <link.icon className="mr-1.5 h-5 w-5" />
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-secondary-700 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                <svg 
                  className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg 
                  className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  flex items-center px-3 py-2 text-base font-medium
                  ${location.pathname === link.path 
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-secondary-700' 
                    : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-secondary-700'}
                `}
              >
                <link.icon className="mr-3 h-6 w-6" />
                {link.name}
              </Link>
            ))}
          </div>
          
          {/* User info and auth links (mobile) */}
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-secondary-700">
            {isLoggedIn ? (
              <>
                <div className="flex items-center px-4 py-2">
                  <div className="flex-shrink-0">
                    <UserCircleIcon className="h-10 w-10 text-secondary-400 dark:text-secondary-500" />
                  </div>
                  <div className="ml-3">
                    {userData.strava_username && (
                      <div className="text-base font-medium text-secondary-800 dark:text-secondary-200">
                        {userData.strava_username}
                      </div>
                    )}
                    {userData.email && (
                      <div className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                        {maskEmail(userData.email)}
                      </div>
                    )}
                  </div>
                  {userData.konto !== undefined && (
                    <div className="ml-auto px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm font-medium">
                      {userData.konto.toFixed(2)} Kč
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-3 space-y-1 px-4">
                {guestNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center px-4 py-2 text-base font-medium text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-secondary-700"
                  >
                    <link.icon className="mr-3 h-6 w-6" />
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-secondary-800 shadow-inner">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-secondary-500 dark:text-secondary-400">
              &copy; {new Date().getFullYear()} Strava Canteen. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 