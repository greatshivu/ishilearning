import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, Lock, Phone as PhoneIcon, Save } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    currentPassword: '',
    newPassword: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await api.get('/profile');
      setFormData(prev => ({ ...prev, fullName: res.data.fullName, phone: res.data.phone || '' }));
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/profile', formData);
      setSuccess('Profile updated successfully!');
      setError('');
    } catch (err: any) {
      setError(err.readableMessage || 'Failed to update profile');
      setSuccess('');
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-8 text-3xl font-bold">Your Profile</h1>
      
      {success && <p className="mb-4 rounded-lg bg-green-100 p-4 text-green-700">{success}</p>}
      {error && <p className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium"><User size={16} /> Full Name</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border p-3 dark:border-gray-700 dark:bg-gray-800"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium"><PhoneIcon size={16} /> Phone Number</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border p-3 dark:border-gray-700 dark:bg-gray-800"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>

        <hr className="dark:border-gray-800" />

        <div className="space-y-4">
          <h3 className="font-bold">Change Password (Optional)</h3>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium"><Lock size={16} /> Current Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border p-3 dark:border-gray-700 dark:bg-gray-800"
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium"><Lock size={16} /> New Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border p-3 dark:border-gray-700 dark:bg-gray-800"
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            />
          </div>
        </div>

        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition-colors">
          <Save size={18} /> Update Profile
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
