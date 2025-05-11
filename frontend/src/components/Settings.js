import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Settings() {
  const [stravaUsername, setStravaUsername] = useState('');
  const [stravaPassword, setStravaPassword] = useState('');
  const [canteenNumber, setCanteenNumber] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/settings', { withCredentials: true });
        if (response.data.success) {
          setStravaUsername(response.data.strava_username || '');
          setCanteenNumber(response.data.canteen_number || '');
        } else {
          setError(response.data.error || 'Failed to fetch settings');
        }
      } catch (error) {
        setError('Failed to connect to the server');
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/settings',
        { strava_username: stravaUsername, strava_password: stravaPassword, canteen_number: canteenNumber },
        { withCredentials: true }
      );
      if (response.data.success) {
        setMessage(response.data.message);
        setError('');
      } else {
        setMessage('');
        setError(response.data.error || 'Failed to save settings');
      }
    } catch (error) {
      setMessage('');
      setError('Failed to connect to the server');
    }
  };

  return (
    <div className="center-container">
      <div className="card">
        <h2 className="text-center">Settings</h2>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="stravaUsername">Strava Username:</label>
          <input
            type="text"
            id="stravaUsername"
            value={stravaUsername}
            onChange={(e) => setStravaUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="stravaPassword">Strava Password:</label>
          <input
            type="password"
            id="stravaPassword"
            value={stravaPassword}
            onChange={(e) => setStravaPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="canteenNumber">Canteen Number:</label>
          <input
            type="text"
            id="canteenNumber"
            value={canteenNumber}
            onChange={(e) => setCanteenNumber(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="mx-auto">Save Strava Details</button>
        </form>
      </div>
    </div>
  );
}

export default Settings;
