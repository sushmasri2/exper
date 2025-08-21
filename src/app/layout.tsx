import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
import { ThemeProviderClient } from '@/components/theme-provider-client';
import './globals.css';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Content Management System',
    default: 'Content Management System',
  },
  description: 'A powerful, intuitive content management system designed for modern teams',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical inline script to prevent flash - this must be first */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Apply theme immediately before anything else loads
                  const storedTheme = localStorage.getItem('theme');
                  const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const isDark = storedTheme ? storedTheme === 'dark' : systemDarkMode;

                  // Add theme class immediately
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.backgroundColor = '#0a0a0a';
                  } else {
                    document.documentElement.style.backgroundColor = '#ffffff';
                  }
                } catch (e) {}
              })();
            `
          }}
        />

        {/* Prevents iOS from auto-formatting content which can cause hydration issues */}
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />

      </head>
      <body
        className={`${poppins.variable} antialiased`}
      >
        {/* ThemeProviderClient will apply theme classes on the client side only */}
        <ThemeProviderClient />
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
