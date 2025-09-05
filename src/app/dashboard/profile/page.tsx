"use client";

import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

// Define profile data interface
interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
  isGoogleAuth?: boolean;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfileFromStorage = () => {
      try {
        // First try to use the user data from auth context if available
        if (user) {
          setProfileData({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            isGoogleAuth: user.isGoogleAuth,
            roles: user.roles,
            permissions: user.permissions,
          });
          setLoading(false);
          return;
        }

        // If no user in context, try to get from local storage
        const storedUserData = localStorage.getItem('medai_user');
        if (storedUserData) {
          const parsedUser = JSON.parse(storedUserData);
          setProfileData({
            id: parsedUser.id,
            email: parsedUser.email,
            firstName: parsedUser.firstName,
            lastName: parsedUser.lastName,
            avatar: parsedUser.avatar,
            isGoogleAuth: parsedUser.isGoogleAuth,
            roles: parsedUser.roles,
            permissions: parsedUser.permissions,
          });
          setLoading(false);
        } else {
          setError("No user profile data found");
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load profile data from storage:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile data");
        setLoading(false);
      }
    };

    fetchUserProfileFromStorage();
  }, [user]);

  // Display loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow-sm text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Use profileData if available, otherwise fall back to user from context
  const displayData = profileData || user;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center mb-6">
          <Avatar className="h-20 w-20 mr-4">
            <AvatarImage src={displayData?.avatar || ""} />
            <AvatarFallback className="text-2xl">{displayData?.firstName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {displayData?.firstName && displayData?.lastName
                ? `${displayData.firstName} ${displayData.lastName}`
                : displayData?.firstName || 'User'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">{displayData?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</h3>
              <p className="text-base font-medium">{displayData?.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">User ID</h3>
              <p className="text-base font-medium">{displayData?.id}</p>
            </div>
            {displayData?.roles && displayData.roles.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Roles</h3>
                <p className="text-base font-medium">{displayData.roles.join(', ')}</p>
              </div>
            )}
            {displayData?.isGoogleAuth !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Login Method</h3>
                <p className="text-base font-medium">{displayData.isGoogleAuth ? 'Google Authentication' : 'Email OTP'}</p>
              </div>
            )}
            {displayData?.permissions && displayData.permissions.length > 0 && (
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Permissions</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {displayData.permissions.map((permission, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-md text-xs">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Manage your account settings and preferences
        </p>

        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Change Password
          </button>
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}
