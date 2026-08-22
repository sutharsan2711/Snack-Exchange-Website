import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, ArrowRight, Shield, Eye, EyeOff, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse?.credential) {
      setError('No credential received from Google.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = await apiService.loginWithGoogle(credentialResponse.credential);
      if (userData.role !== 'ADMIN') {
        setError(`Access Denied: Your Google account (${userData.email}) is registered as a ${userData.role}. Admin access requires an Administrator account.`);
        setLoading(false);
        return;
      }

      localStorage.setItem('admin_user', JSON.stringify(userData));
      localStorage.setItem('admin_token', 'mock-admin-token-' + userData.id);
      navigate('/');
    } catch (err: any) {
      console.error('Admin Google login error:', err);
      setError(err.response?.data?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const userData = await apiService.login({
        email: email.trim(),
        password: password.trim(),
      });

      if (userData.role !== 'ADMIN') {
        setError('Unauthorized: Only administrators are permitted to access this panel.');
        setLoading(false);
        return;
      }

      // Save user info
      localStorage.setItem('admin_user', JSON.stringify(userData));
      localStorage.setItem('admin_token', 'mock-admin-token-' + userData.id);

      navigate('/');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const userData = await apiService.login({
        email: 'admin@snakeexchange.com',
        password: 'admin123',
      });
      localStorage.setItem('admin_user', JSON.stringify(userData));
      localStorage.setItem('admin_token', 'mock-admin-token-' + userData.id);
      navigate('/');
    } catch (err: any) {
      console.error('Demo admin login error:', err);
      setError('Failed to log in with demo account. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-8 space-y-8 relative z-10 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-black rounded-full uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>SNAKE EXCHANGE ADMIN</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
          <p className="text-slate-400 text-xs font-semibold">
            Authorized personnel only. Please sign in to manage your store.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Google Sign In for Admin */}
        <div className="space-y-3">
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in was cancelled or encountered an error.')}
              theme="filled_black"
              size="large"
              shape="pill"
              text="signin_with"
              width="360"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold py-1">
            <div className="flex-1 h-px bg-slate-800" />
            <span>OR SIGN IN WITH ADMIN CREDENTIALS</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@snakeexchange.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 rounded-xl text-sm font-semibold text-white outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 rounded-xl text-sm font-semibold text-white outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl hover:shadow-indigo-600/10 cursor-pointer transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In To Panel'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
            <div className="flex-1 h-px bg-slate-800" />
            <span>DEVELOPER QUICK SIGN-IN</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-3 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl font-bold text-xs border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Instant Login (admin@snakeexchange.com)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
