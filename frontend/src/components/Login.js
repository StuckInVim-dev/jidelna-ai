import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      if (response.data.success) {
        navigate('/settings');
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (error) {
      setError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Login to your account</h2>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            Welcome back! Please enter your credentials.
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
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <a href="#" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                Forgot password?
              </a>
            </div>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="form-input"
              placeholder="••••••••"
            />
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
                  Logging in...
                </>
              ) : 'Login'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-secondary-600 dark:text-secondary-400">Don't have an account? </span>
          <Link to="/register" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
