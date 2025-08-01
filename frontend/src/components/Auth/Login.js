import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithMicrosoft, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Fetch Microsoft auth URL
    const fetchAuthUrl = async () => {
      try {
        const response = await axios.get('/auth/microsoft-url');
        setAuthUrl(response.data.auth_url);
      } catch (error) {
        console.error('Failed to fetch Microsoft auth URL:', error);
      }
    };
    fetchAuthUrl();
  }, []);

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Please provide both email and password.',
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    setLoading(true);
    const result = await login({ email, password });
    setLoading(false);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Welcome back!',
        showConfirmButton: false,
        timer: 2500,
      });
      navigate('/dashboard');
    } else {
      Swal.fire({
        icon: 'error',
        title: result.error,
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  const handleMicrosoftLogin = () => {
    if (authUrl) {
      loginWithMicrosoft(authUrl);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Microsoft login is currently unavailable. Please try local login.',
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <header className="auth-header">
          <img src="/images/logo/nmdpra-logo.png" alt="NMDPRA Logo" className="logo" />
          <h1>NMDPRA Store Management System</h1>
          <p>Staff & Personnel Login</p>
        </header>
        
        <div className="auth-content">
          <form onSubmit={handleLocalLogin} className="local-login-form modern-form">
            <h2>Sign in with Email</h2>
            
            <div className="form-group input-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div className="form-group input-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ display: 'block' }}
                  >
                    {showPassword ? (
                      <>
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-5.94M1 1l22 22" />
                        <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5a3.5 3.5 0 0 0 2.47-5.97" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>
            
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in with Email'}
            </button>
          </form>
          
          <div className="divider modern-divider">
            <span>OR</span>
            <hr />
          </div>
          
          <div className="ms-login-section">
            <p>Sign in with your Microsoft account</p>
            {authUrl ? (
              <button onClick={handleMicrosoftLogin} className="login-button">
                Sign in with Microsoft
              </button>
            ) : (
              <p className="error">Login system is currently unavailable. Please try again later.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;