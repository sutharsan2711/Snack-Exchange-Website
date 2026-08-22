import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import {
  User, Mail, Phone, MapPin, Lock, Save,
  CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck,
  Sparkles, LogOut, KeyRound, AlertCircle, Eye, EyeOff
} from 'lucide-react';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser, logout } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [orderCount, setOrderCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login?redirect=/profile');
      return;
    }

    const fetchLatestProfileAndOrders = async () => {
      try {
        setLoading(true);
        // Fetch latest profile from DB
        const profileData = await apiService.getProfile(user.id);
        setName(profileData.name || '');
        setEmail(profileData.email || '');
        setPhone(profileData.phone || '');
        setAddress(profileData.address || '');
        updateUser(profileData);

        // Fetch customer's orders count
        const orders = await apiService.getOrders();
        setOrderCount(orders.length);
      } catch (err) {
        console.error('Error fetching profile:', err);
        // Fallback to store data
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setAddress(user.address || '');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProfileAndOrders();
  }, [isAuthenticated, user?.id, navigate]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Full name cannot be empty.');
      return;
    }

    setSaving(true);

    try {
      const payload: any = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      };

      if (isChangingPassword && password.trim()) {
        if (password.length < 6) {
          setErrorMessage('New password must be at least 6 characters.');
          setSaving(false);
          return;
        }
        payload.password = password.trim();
      }

      if (user) {
        const updated = await apiService.updateProfile(user.id, payload);
        updateUser(updated);
        setSuccessMessage('Your profile and delivery details have been updated successfully!');
        setPassword('');
        setIsChangingPassword(false);

        // Auto-dismiss alert after 4 seconds
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMessage(err.response?.data?.message || 'Could not update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const initialLetter = (name || user?.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ACCOUNT SETTINGS</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Profile</h1>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Manage your personal contact details, saved delivery addresses, and login credentials.
          </p>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs rounded-xl transition-all cursor-pointer self-start md:self-auto border border-red-150 shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card & Quick Stats */}
        <div className="space-y-6">
          
          {/* Main User Identity Badge */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-center relative overflow-hidden">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-primary to-orange-400 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-primary/20 mb-4 ring-4 ring-orange-50">
              {initialLetter}
            </div>
            
            <h2 className="text-xl font-black text-slate-900">{name || user?.name}</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">{email || user?.email}</p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-extrabold rounded-full border border-emerald-100 mt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified Customer Account</span>
            </div>

            {/* Quick Action Navigation */}
            <div className="mt-6 pt-6 border-t border-slate-50 space-y-2">
              <Link
                to="/orders"
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-primary/5 hover:text-primary rounded-2xl text-xs font-extrabold text-slate-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  <span>My Orders & Live Tracking</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                to="/"
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-extrabold text-slate-700 transition-all cursor-pointer"
              >
                <span>Browse Food Menu</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Activity Overview Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Account Overview</span>
              <span className="px-2.5 py-0.5 bg-white/10 text-[11px] font-extrabold rounded-full text-orange-300">Active</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-400 font-bold block">Total Orders</span>
                <span className="text-2xl font-black text-white">{orderCount}</span>
              </div>
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-400 font-bold block">Loyalty Tier</span>
                <span className="text-sm font-black text-orange-400 mt-1 block">VIP Foodie</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
            
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <span>Personal & Delivery Information</span>
              </h3>
              <p className="text-slate-400 text-xs font-semibold mt-1">
                Keep your address updated for instant checkout and smooth doorstep food deliveries.
              </p>
            </div>

            {/* Success Alert */}
            {successMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2.5 animate-scale-up">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error Alert */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2.5 animate-scale-up">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Alex Johnson"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary rounded-xl text-sm font-semibold text-slate-800 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Address (Read-only for security) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Email Address</label>
                  <span className="text-[11px] font-bold text-slate-400">Account identifier</span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Delivery Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary rounded-xl text-sm font-semibold text-slate-800 outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Delivery drivers will use this number to contact you upon arrival.</p>
              </div>

              {/* Default Delivery Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Default Shipping / Delivery Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Flat No., Street Name, Landmark, City, Pincode"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary rounded-xl text-sm font-semibold text-slate-800 outline-none transition-all resize-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">This address will be automatically pre-filled when you checkout.</p>
              </div>

              {/* Password Section (Only for non-OAuth accounts) */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Account Password</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(!isChangingPassword);
                      setPassword('');
                    }}
                    className="text-xs font-extrabold text-primary hover:underline cursor-pointer"
                  >
                    {isChangingPassword ? 'Cancel Password Change' : 'Change Password'}
                  </button>
                </div>

                {isChangingPassword && (
                  <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-150 animate-scale-up">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password (min. 6 characters)"
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-800 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
