"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import Breadcrumbs from '@/components/breadcrumb';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, density, setTheme, setDensity, applyChanges } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Local state to track pending theme/density changes
  const [pendingTheme, setPendingTheme] = useState(theme);
  const [pendingDensity, setPendingDensity] = useState(density);

  // Update local state when theme context changes
  useEffect(() => {
    setPendingTheme(theme);
    setPendingDensity(density);
  }, [theme, density]);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    bio: 'Medical professional with 10+ years of experience in healthcare education.',
    notifications: {
      email: true,
      browser: false,
      mobile: true
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert('Profile settings saved successfully!');
    }, 1000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    setSaving(true);

    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      alert('Password changed successfully!');
    }, 1000);
  };

  return (
    <div>
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Settings' }
          ]}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 border-b-2 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-3 border-b-2 text-sm font-medium ${
                activeTab === 'password'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Change Password
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`px-6 py-3 border-b-2 text-sm font-medium ${
                activeTab === 'appearance'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Appearance
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm text-gray-400 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Notification Preferences</h3>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="email-notifications"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded"
                        checked={profileData.notifications.email}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          notifications: {...profileData.notifications, email: e.target.checked}
                        })}
                      />
                      <label htmlFor="email-notifications" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                        Email Notifications
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="browser-notifications"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded"
                        checked={profileData.notifications.browser}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          notifications: {...profileData.notifications, browser: e.target.checked}
                        })}
                      />
                      <label htmlFor="browser-notifications" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                        Browser Notifications
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="mobile-notifications"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded"
                        checked={profileData.notifications.mobile}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          notifications: {...profileData.notifications, mobile: e.target.checked}
                        })}
                      />
                      <label htmlFor="mobile-notifications" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                        Mobile App Notifications
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className={`px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                    disabled={saving}
                  >
                    {saving ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className={`border-2 ${pendingTheme === 'light' ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'} p-4 rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all`}
                    onClick={() => {
                      setPendingTheme('light');
                      setTheme('light');
                    }}
                  >
                    <div className="h-8 bg-gray-100 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-500 rounded w-1/2"></div>
                    <p className="text-xs text-center mt-2 font-medium text-gray-800 dark:text-gray-200">Light</p>
                  </div>
                  <div
                    className={`border-2 ${pendingTheme === 'dark' ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'} p-4 rounded-lg cursor-pointer bg-gray-900 dark:bg-gray-900 hover:bg-gray-800 dark:hover:bg-black transition-all`}
                    onClick={() => {
                      setPendingTheme('dark');
                      setTheme('dark');
                    }}
                  >
                    <div className="h-8 bg-gray-700 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-600 dark:bg-gray-600 rounded w-1/2"></div>
                    <p className="text-xs text-center mt-2 font-medium text-white dark:text-white">Dark</p>
                  </div>
                  <div
                    className={`border-2 ${pendingTheme === 'system' ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'} p-4 rounded-lg cursor-pointer bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 hover:from-blue-100 hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all`}
                    onClick={() => {
                      setPendingTheme('system');
                      setTheme('system');
                    }}
                  >
                    <div className="h-8 bg-gradient-to-r from-blue-100 to-white dark:from-gray-600 dark:to-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-100 dark:from-gray-500 dark:to-gray-600 rounded w-1/2"></div>
                    <p className="text-xs text-center mt-2 font-medium text-gray-800 dark:text-gray-200">System</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Layout Density</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      id="compact"
                      name="density"
                      type="radio"
                      className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600"
                      checked={pendingDensity === 'compact'}
                      onChange={() => {
                        setPendingDensity('compact');
                        setDensity('compact');
                      }}
                    />
                    <label htmlFor="compact" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Compact
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="comfortable"
                      name="density"
                      type="radio"
                      className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600"
                      checked={pendingDensity === 'comfortable'}
                      onChange={() => {
                        setPendingDensity('comfortable');
                        setDensity('comfortable');
                      }}
                    />
                    <label htmlFor="comfortable" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Comfortable
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="spacious"
                      name="density"
                      type="radio"
                      className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600"
                      checked={pendingDensity === 'spacious'}
                      onChange={() => {
                        setPendingDensity('spacious');
                        setDensity('spacious');
                      }}
                    />
                    <label htmlFor="spacious" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Spacious
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    // Make sure theme and density are set before applying changes
                    setTheme(pendingTheme);
                    setDensity(pendingDensity);
                    applyChanges();
                  }}
                >
                  Apply Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
