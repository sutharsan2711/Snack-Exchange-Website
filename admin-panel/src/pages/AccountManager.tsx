import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import {
  Users, ShieldAlert, CheckCircle, XCircle, Plus, Mail, Key, User, Phone, MapPin, Search, UserCheck, Shield, ChefHat
} from 'lucide-react';

interface AccountUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  active: boolean;
}

export const AccountManager: React.FC = () => {
  const [users, setUsers] = useState<AccountUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states for creating staff
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError('Could not load user accounts. Verify backend is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, email, and password are required.');
      return;
    }

    setSubmitting(true);

    try {
      await apiService.createUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        phone: phone.trim(),
        address: address.trim(),
        role: role,
      });

      setSuccess(`Account for ${name} (${role}) created successfully!`);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setAddress('');
      setShowAddForm(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to create user:', err);
      setError(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: number, currentActive: boolean) => {
    setError('');
    setSuccess('');
    try {
      const updated = await apiService.updateUserStatus(userId, !currentActive);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: updated.active } : u));
      setSuccess(`User status updated successfully!`);
      // Auto-hide success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setError('Failed to update account status.');
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-scale-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            Staff & User Management
          </h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Control, register, and configure security permissions for Customer and Admin accounts.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Staff Form' : 'Register New Staff'}</span>
        </button>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Register Staff Form */}
      {showAddForm && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl animate-scale-up space-y-6">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            Create Administrator Account
          </h2>

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="E.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin2@snakeexchange.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Residential/Office Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="123 Staff Lane, New Delhi"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Staff Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 focus:bg-white"
              >
                <option value="ADMIN">ADMINISTRATOR (Full Portal Access)</option>
              </select>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                {submitting ? 'Creating...' : 'Register User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Database Table Display */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl text-[11px] font-bold text-slate-500">
            {['ALL', 'ADMIN', 'CUSTOMER'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  roleFilter === r ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'hover:text-slate-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* User list */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-semibold animate-pulse">
            Syncing accounts directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-semibold">
            No registered users found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Access Role</th>
                  <th className="px-6 py-4">Contact & Location</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                {filteredUsers.map(user => {
                  const Icon = user.role === 'ADMIN' ? Shield : user.role === 'CHEF' ? ChefHat : Users;
                  const roleColor = user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                    user.role === 'CHEF' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                    'bg-slate-50 text-slate-600 border border-slate-100';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${roleColor} flex items-center justify-center`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">{user.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium block">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${roleColor}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4 space-y-0.5">
                        <p className="text-slate-600 font-bold">{user.phone || 'N/A'}</p>
                        <p className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[200px]" title={user.address}>
                          {user.address || 'No registered address'}
                        </p>
                      </td>

                      {/* Status Checkbox */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          {user.active ? (
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 font-black rounded-lg text-[9px] uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 font-black rounded-lg text-[9px] uppercase tracking-wider flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Deactivated
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.active)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                            user.active
                              ? 'bg-red-50 text-red-600 hover:bg-red-100/70 border border-red-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100/70 border border-emerald-100'
                          }`}
                        >
                          {user.active ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
