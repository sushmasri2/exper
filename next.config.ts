import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    // Get API URL from environment or fallback to localhost
    let apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000/api';
    apiUrl = apiUrl.replace('/api', ''); // Remove /api if present

    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Allow scripts from these sources
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
              // Allow styles from these sources
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
              // Allow images from these sources
              "img-src 'self' data: https://*.googleusercontent.com https://github.com https://avatars.githubusercontent.com",
              // Allow fonts from these sources
              "font-src 'self' https://fonts.gstatic.com",
              // Allow frames from these sources - important for Google auth
              "frame-src 'self' https://accounts.google.com",
              // Allow sites that can embed this app in frames
              "frame-ancestors 'self' https://accounts.google.com",
              // Allow connections to these sources - dynamically include API URL
              `connect-src 'self' https://oauth2.googleapis.com ${apiUrl}`
            ].join('; ')
          }
        ]
      }
    ];
  }
};

export default nextConfig;
