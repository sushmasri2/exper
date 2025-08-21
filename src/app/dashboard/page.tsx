"use client";

import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalContent: 0,
    publishedContent: 0,
    draftContent: 0,
    totalMedia: 0,
    totalUsers: 0
  });

  // Simulate fetching dashboard stats
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setStats({
        totalContent: 254,
        publishedContent: 187,
        draftContent: 67,
        totalMedia: 632,
        totalUsers: 48
      });
    }, 1000);
  }, []);

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-8">
          <h2 className="text-xl font-medium dark:text-white">Welcome back, {user?.name || user?.email?.split('@')[0] || 'google-user'}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {`Here's what's happening with your content today.`}
          </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">TOTAL CONTENT</h2>
            <span className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className="text-3xl font-semibold dark:text-white">{stats.totalContent}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Items in your library</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">PUBLISHED</h2>
            <span className="p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className="text-3xl font-semibold dark:text-white">{stats.publishedContent}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Live content items</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">DRAFTS</h2>
            <span className="p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className="text-3xl font-semibold dark:text-white">{stats.draftContent}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Awaiting publication</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">MEDIA FILES</h2>
            <span className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className="text-3xl font-semibold dark:text-white">{stats.totalMedia}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Images, videos & docs</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/content" className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span className="p-2 mr-3 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
            </span>
            <div>
              <h3 className="font-medium">Create Content</h3>
              <p className="text-sm text-gray-500">Add new article or page</p>
            </div>
          </Link>

          <Link href="/dashboard/media" className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span className="p-2 mr-3 bg-green-100 text-green-600 rounded">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <div>
              <h3 className="font-medium">Upload Media</h3>
              <p className="text-sm text-gray-500">Add images or documents</p>
            </div>
          </Link>

          <Link href="/dashboard/users" className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span className="p-2 mr-3 bg-yellow-100 text-yellow-600 rounded">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            </span>
            <div>
              <h3 className="font-medium">Invite User</h3>
              <p className="text-sm text-gray-500">Add team members</p>
            </div>
          </Link>

          <Link href="/dashboard/settings" className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span className="p-2 mr-3 bg-purple-100 text-purple-600 rounded">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </span>
            <div>
              <h3 className="font-medium">Settings</h3>
              <p className="text-sm text-gray-500">Configure your account</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="px-6 py-4 flex items-center">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">Content Updated</h3>
              <p className="text-sm text-gray-500">{`You updated "Introduction to Medical Science"`}</p>
            </div>
            <div className="text-sm text-gray-500">2 hours ago</div>
          </div>
          <div className="px-6 py-4 flex items-center">
            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">Media Uploaded</h3>
              <p className="text-sm text-gray-500">{`You uploaded 5 new images to "Anatomy Basics"`}</p>
            </div>
            <div className="text-sm text-gray-500">Yesterday</div>
          </div>
          <div className="px-6 py-4 flex items-center">
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">User Invited</h3>
              <p className="text-sm text-gray-500">{`You invited Dr. Emily Rodriguez to collaborate`}</p>
            </div>
            <div className="text-sm text-gray-500">2 days ago</div>
          </div>
          <div className="px-6 py-4 flex items-center">
            <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">Content Published</h3>
              <p className="text-sm text-gray-500">{`You published "Pathology Terms" glossary`}</p>
            </div>
            <div className="text-sm text-gray-500">3 days ago</div>
          </div>
        </div>
      </div>
    </div>
  );
}
