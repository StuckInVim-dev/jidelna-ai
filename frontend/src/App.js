import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Register from './components/Register';
import Login from './components/Login';
import Settings from './components/Settings';
import Menu from './components/Menu';
import FoodSelector from './components/FoodSelector';
import PreferencesPage from './components/PreferencesPage';
import Layout from './components/Layout';
import './App.css';

function App() {
  const [userData, setUserData] = useState({
    email: '',
    strava_username: '',
    konto: 0
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/settings', { 
        withCredentials: true 
      });
      
      if (response.data.success) {
        setUserData({
          email: response.data.email || '',
          strava_username: response.data.strava_username || '',
          konto: response.data.konto || 0
        });
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log('Not logged in or error fetching user data');
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <Router>
      <Layout isLoggedIn={isLoggedIn} userData={userData}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/menu" element={<Menu refreshUserData={fetchUserData} />} />
          <Route path="/food-selector" element={<FoodSelector refreshUserData={fetchUserData} />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/" element={
            <div className="py-12 px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl font-extrabold text-secondary-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                  Welcome to <span className="text-primary-600 dark:text-primary-400">Strava Canteen</span>
                </h1>
                <p className="mt-5 max-w-xl mx-auto text-xl text-secondary-500 dark:text-secondary-300">
                  Your digital solution for managing school canteen meals with ease.
                </p>
              </div>
              
              <div className="mt-16 grid gap-8 md:grid-cols-3">
                <div className="card group hover:shadow-premium transition-shadow duration-300">
                  <div className="p-6">
                    <div className="rounded-lg inline-flex p-3 bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">View Menus</h3>
                    <p className="mt-2 text-secondary-500 dark:text-secondary-400">Browse upcoming meals and plan your week ahead with our intuitive menu interface.</p>
                  </div>
                </div>
                
                <div className="card group hover:shadow-premium transition-shadow duration-300">
                  <div className="p-6">
                    <div className="rounded-lg inline-flex p-3 bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Order Online</h3>
                    <p className="mt-2 text-secondary-500 dark:text-secondary-400">Select and order meals directly from your device, making the process fast and convenient.</p>
                  </div>
                </div>
                
                <div className="card group hover:shadow-premium transition-shadow duration-300">
                  <div className="p-6">
                    <div className="rounded-lg inline-flex p-3 bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Manage Preferences</h3>
                    <p className="mt-2 text-secondary-500 dark:text-secondary-400">Set dietary preferences and get personalized meal recommendations tailored to your taste.</p>
                  </div>
                </div>
              </div>
              
              {!isLoggedIn && (
                <div className="mt-12 text-center">
                  <p className="text-secondary-600 dark:text-secondary-300 text-lg mb-6">Ready to get started? Create an account or log in.</p>
                  <div className="inline-flex space-x-4">
                    <a href="/login" className="btn btn-primary px-6 py-3">Log In</a>
                    <a href="/register" className="btn btn-secondary px-6 py-3">Register</a>
                  </div>
                </div>
              )}
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;