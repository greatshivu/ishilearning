import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Turnstile from '../components/Turnstile';
import { GoogleLogin } from "@react-oauth/google";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Please complete the captcha');
      return;
    }
    try {
      const res = await api.post('/auth/login', { email, password, turnstileToken: token });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.readableMessage || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">Login</h2>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div className="flex justify-center">
            <Turnstile onVerify={setToken} />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
           <GoogleLogin
                onSuccess={async (credentialResponse) => {
                    console.log(credentialResponse.credential);
                    try {
                          const res = await api.post('/auth/sso/google', { idToken: credentialResponse.credential });
                          login(res.data.token, res.data.user);
                          navigate('/');
                        } catch (err: any) {
                          setError(err.readableMessage || 'Login failed');
                        }
                }}
                onError={() => {
                    console.log("Login Failed");
                }}
            />
        </form>
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
        </div>
        <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          <Link to="/forgot-password" title="Forgot Password" className="text-blue-500 hover:underline">Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
