"use client";

import { useState } from "react";
import { useThemeSettings } from "@/hooks/use-theme-settings";

export default function SettingsPage() {
  const { pendingTheme, pendingDensity, setPendingTheme, setPendingDensity, applyChanges } = useThemeSettings();
  const [activeTab, setActiveTab] = useState('appearance');
  const [saving, setSaving] = useState(false);

  // Notification states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const handleApplyChanges = () => {
    setSaving(true);

    // Apply theme changes
    applyChanges();

    // Simulate API call for saving
    setTimeout(() => {
      setSaving(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg px-6 ring shadow-xl ring-gray-900/5 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
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
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 border-b-2 text-sm font-medium ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Notifications
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className={`border-2 ${pendingTheme === 'light' ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'} p-4 rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all`}
                    onClick={() => setPendingTheme('light')}
                  >
                    <div className="h-12 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mb-2"></div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Light</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Light background with dark text</p>
                  </div>

                  <div
                    className={`border-2 ${pendingTheme === 'dark' ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'} p-4 rounded-lg cursor-pointer bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 transition-all`}
                    onClick={() => setPendingTheme('dark')}
                  >
                    <div className="h-12 w-full bg-gray-900 border border-gray-700 rounded-md mb-2"></div>
                    <p className="text-sm font-medium text-white">Dark</p>
                    <p className="text-xs text-gray-400">Dark background with light text</p>
                  </div>

                  <div
                    className={`border-2 ${pendingTheme === 'system' ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'} p-4 rounded-lg cursor-pointer bg-gradient-to-r from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 hover:from-blue-100 hover:to-gray-50 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all`}
                    onClick={() => setPendingTheme('system')}
                  >
                    <div className="h-12 w-full bg-gradient-to-r from-white to-gray-900 rounded-md mb-2"></div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">System</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Follow system preferences</p>
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
                      className="h-4 w-4 border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-600 dark:focus:ring-blue-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800"
                      checked={pendingDensity === 'compact'}
                      onChange={() => setPendingDensity('compact')}
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
                      className="h-4 w-4 border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-600 dark:focus:ring-blue-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800"
                      checked={pendingDensity === 'comfortable'}
                      onChange={() => setPendingDensity('comfortable')}
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
                      className="h-4 w-4 border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-600 dark:focus:ring-blue-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800"
                      checked={pendingDensity === 'spacious'}
                      onChange={() => setPendingDensity('spacious')}
                    />
                    <label htmlFor="spacious" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Spacious
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  className={`px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                  onClick={handleApplyChanges}
                  disabled={saving}
                >
                  {saving ? 'Applying...' : 'Apply Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-3">Notifications</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Email notifications</span>
                    <button
                      type="button"
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent ${
                        emailNotifications ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                      } transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2`}
                    >
                      <span className="sr-only">
                        {emailNotifications ? 'Disable' : 'Enable'} email notifications
                      </span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          emailNotifications ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">System notifications</span>
                    <button
                      type="button"
                      onClick={() => setSystemNotifications(!systemNotifications)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent ${
                        systemNotifications ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                      } transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2`}
                    >
                      <span className="sr-only">
                        {systemNotifications ? 'Disable' : 'Enable'} system notifications
                      </span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          systemNotifications ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Push notifications</span>
                    <button
                      type="button"
                      onClick={() => setPushNotifications(!pushNotifications)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent ${
                        pushNotifications ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                      } transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2`}
                    >
                      <span className="sr-only">
                        {pushNotifications ? 'Disable' : 'Enable'} push notifications
                      </span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full ${
                          pushNotifications ? 'bg-white' : 'bg-white dark:bg-gray-400'
                        } shadow-lg ring-0 transition duration-200 ease-in-out ${
                          pushNotifications ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
