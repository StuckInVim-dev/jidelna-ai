import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/register', 
        { email, password },
        { withCredentials: true }
      );
      if (response.data.success) {
        navigate('/login');
      } else {
        setError(response.data.error || 'Registration failed');
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError('Email address is already registered. Please use a different email or try logging in.');
      } else {
        setError('Failed to connect to the server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Create an account</h2>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            Join Strava Canteen to manage your meals online.
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="form-input"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="form-input"
              placeholder="Create a strong password"
            />
            <p className="form-helper">
              Password must be at least 6 characters long
            </p>
          </div>
          
          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 dark:border-secondary-700 rounded dark:bg-secondary-800"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-secondary-700 dark:text-secondary-300">
              I agree to the <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>
            </label>
          </div>
          
          <div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full btn btn-primary py-2.5 relative"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-secondary-600 dark:text-secondary-400">Already have an account? </span>
          <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
