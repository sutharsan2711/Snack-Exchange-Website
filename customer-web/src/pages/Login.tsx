import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const userData = await apiService.login({
          email: email.trim(),
          password: password.trim()
        });

        if (userData.role !== 'CUSTOMER') {
          setError('This portal is only for Customers.');
          setLoading(false);
          return;
        }

        login(userData);
        setLoading(false);
        navigate(redirect);
      } else {
        const userData = await apiService.register({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          phone: phone.trim() || '+91 98765 43210',
          address: '123 Main Street, Sector 4, New Delhi',
        });
        login(userData);
        setLoading(false);
        navigate(redirect);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse?.credential) {
      setError('No credential received from Google.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = await apiService.loginWithGoogle(credentialResponse.credential);
      login(userData);
      setLoading(false);
      navigate(redirect);
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.response?.data?.message || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  // Quick Demo Login Handler
  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const userData = await apiService.login({
        email: 'customer@example.com',
        password: 'customer123'
      });
      login(userData);
      setLoading(false);
      navigate(redirect);
    } catch (err: any) {
      console.error('Demo auth error:', err);
      setError(err.response?.data?.message || 'Demo authentication failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-50 via-brand-light to-primary/5 relative">
      {/* Back to Home Link */}
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-primary transition-colors bg-white/80 backdrop-blur-xs px-4 py-2 rounded-full border border-slate-200 shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Store Menu</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden p-8 space-y-8 animate-scale-up">
        
        {/* Top Branding & Mode Switch */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-2">
            <Sparkles className="w-4 h-4 fill-primary" />
            <span>SNAKE EXCHANGE CUSTOMER PORTAL</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className="text-slate-400 text-xs font-medium">
            {mode === 'login'
              ? 'Sign in to track orders & earn loyalty rewards'
              : 'Join us to get fast deliveries & exclusive discount coupons'}
          </p>

          {/* Mode Switcher Pills */}
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600 mt-4">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-slate-950 shadow-sm font-black' : 'hover:text-slate-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'signup' ? 'bg-white text-slate-950 shadow-sm font-black' : 'hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl text-center animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* Google One-Click Login Section */}
        <div className="space-y-3">
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in was cancelled or encountered an error.')}
              theme="outline"
              size="large"
              shape="pill"
              text={mode === 'login' ? 'signin_with' : 'signup_with'}
              width="360"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold py-1">
            <div className="flex-1 h-px bg-slate-100" />
            <span>OR WITH EMAIL</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name (Signup Mode only) */}
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          {/* Phone (Signup Mode only) */}
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
              {mode === 'login' && (
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your email!'); }} className="text-xs font-bold text-primary hover:underline">
                  Forgot Password?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-60 mt-2"
          >
            <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Account' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
          <div className="flex-1 h-px bg-slate-100" />
          <span>QUICK TESTING</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Demo 1-Click Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-3 border-2 border-slate-200 hover:border-primary/40 bg-slate-50 hover:bg-primary/5 rounded-2xl font-extrabold text-xs text-slate-700 hover:text-primary transition-all cursor-pointer flex items-center justify-center space-x-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Instant Demo Login (Alex Johnson)</span>
        </button>

        {/* Footer info */}
        <p className="text-[11px] text-center text-slate-400 font-medium leading-relaxed">
          By continuing, you agree to Snake Exchange's{' '}
          <span className="font-bold text-slate-600">Terms of Service</span> &{' '}
          <span className="font-bold text-slate-600">Privacy Policy</span>.
        </p>

      </div>
    </div>
  );
};
