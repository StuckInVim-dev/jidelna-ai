import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';
import Register from './components/Register';
import Login from './components/Login';
import Settings from './components/Settings';
import Menu from './components/Menu';
import FoodSelector from './components/FoodSelector';
import PreferencesPage from './components/PreferencesPage';
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

  return (
    <Router>
      <div className="App">
        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/settings">Settings</Link>
            </li>
            <li>
              <Link to="/menu">Menu</Link>
            </li>
            <li>
              <Link to="/food-selector">Food Selector</Link>
            </li>
            <li>
              <Link to="/preferences">Preferences</Link>
            </li>
          </ul>
          
          {isLoggedIn && (
            <div className="user-info">
              {userData.strava_username && (
                <span className="user-name">{userData.strava_username}</span>
              )}
              {userData.email && (
                <span className="user-email">{maskEmail(userData.email)}</span>
              )}
              {userData.konto !== undefined && (
                <span className="user-balance">{userData.konto.toFixed(2)} Kč</span>
              )}
            </div>
          )}
        </nav>

        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/menu" element={<Menu refreshUserData={fetchUserData} />} />
          <Route path="/food-selector" element={<FoodSelector refreshUserData={fetchUserData} />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/" element={
              <div className="home-container">
                <h1>Welcome to Strava Canteen</h1>
                <div className="home-description">
                  <p>Your digital solution for managing school canteen meals with ease.</p>
                  <div className="features">
                    <div className="feature-card">
                      <h3>View Menus</h3>
                      <p>Browse upcoming meals and plan your week ahead.</p>
                    </div>
                    <div className="feature-card">
                      <h3>Order Online</h3>
                      <p>Select and order meals directly from your device.</p>
                    </div>
                    <div className="feature-card">
                      <h3>Manage Preferences</h3>
                      <p>Set dietary preferences and get personalized recommendations.</p>
                    </div>
                  </div>
                  {!isLoggedIn && (
                    <div className="cta-buttons">
                      <Link to="/login" className="btn btn-primary">Login</Link>
                      <Link to="/register" className="btn btn-secondary">Register</Link>
                    </div>
                  )}
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;