# Adding New Pages to MedAI CMS Frontend

This guide explains how to add new pages to the MedAI CMS Frontend application and how to make them either protected (requiring authentication) or public.

## Table of Contents
1. [Understanding the Project Structure](#understanding-the-project-structure)
2. [Adding a New Page](#adding-a-new-page)
3. [Making a Page Protected](#making-a-page-protected)
4. [Making a Page Public](#making-a-page-public)
5. [Example: Adding a User List Page](#example-adding-a-user-list-page)

## Understanding the Project Structure

Our application uses Next.js App Router, which follows a file-system based routing approach:

- `src/app`: Contains all the routes in the application
- Each directory in `src/app` represents a route segment
- `page.tsx` files define the main content for a route
- `layout.tsx` files define the shared UI for a group of routes

## Adding a New Page

To add a new page to the application:

1. Identify where in the route hierarchy the page should be placed
2. Create a new directory (if needed) for the route segment
3. Create a `page.tsx` file inside that directory
4. Optionally create a `layout.tsx` file if the page requires a unique layout

## Making a Page Protected

Protected pages require users to be authenticated. If an unauthenticated user tries to access a protected page, they will be redirected to the login page.

To make a page protected:

1. Import and wrap your page content with the `ProtectedRoute` component
2. The component handles authentication checks and redirects

```tsx
"use client";

import ProtectedRoute from "@/components/protected-route";

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      {/* Your page content here */}
    </ProtectedRoute>
  );
}
```

## Making a Page Public

Public pages are accessible to anyone, regardless of authentication status. If an authenticated user tries to access a public page like the login page, they will be redirected to the dashboard.

To make a page public:

1. Import and wrap your page content with the `PublicRoute` component
2. The component handles authentication checks and redirects

```tsx
"use client";

import PublicRoute from "@/components/public-route";

export default function MyPublicPage() {
  return (
    <PublicRoute>
      {/* Your page content here */}
    </PublicRoute>
  );
}
```

## Example: Adding a User List Page

Let's create a user list page as an example. This will be a protected page that displays a list of users.

### Step 1: Create the Directory Structure

First, create a directory structure for the user list page. Since this is related to the dashboard functionality, we'll place it under the dashboard directory:

```
src/app/dashboard/users/page.tsx
```

### Step 2: Create the Page Component

Create the `page.tsx` file:

```tsx
"use client";

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/context/auth-context';
import { showToast } from '@/lib/toast';

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>
      <UsersList />
    </div>
  );
}

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        // Adjust the endpoint according to your API
        const response = await get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        showToast({
          type: 'error',
          title: 'Failed to load users',
          message: 'There was a problem loading the users list.'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [get]);

  if (loading) {
    return (
      <div className="flex justify-center my-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Last Login</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      {new Date(user.lastLogin).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-primary hover:text-primary/80 mr-3">
                        Edit
                      </button>
                      <button className="text-destructive hover:text-destructive/80">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Update Dashboard Navigation

Make sure your user list page is accessible from the dashboard navigation.
The navigation items are defined in `src/app/dashboard/dashboard-client.tsx`. The users link is already defined in the navLinks array:

```tsx
const navLinks = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard /> },
  { href: "/dashboard/content", label: "Content", icon: <FileText /> },
  { href: "/dashboard/media", label: "Media Library", icon: <Image /> },
  { href: "/dashboard/users", label: "Users", icon: <Users /> },
  { href: "/dashboard/settings", label: "Settings", icon: <Settings /> },
];
```

### Step 4: Ensuring the Page is Protected

Since this page is under the `/dashboard` route and the dashboard layout already includes the `ProtectedRoute` component, the page is automatically protected.

The dashboard layout is defined in `src/app/dashboard/dashboard-client.tsx` and wraps all child routes with `ProtectedRoute`:

```tsx
export function DashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  // ...
  return (
    <ProtectedRoute>
      {/* Dashboard layout content */}
      {children}
    </ProtectedRoute>
  );
}
```

### Step 5: Testing the New Page

To test your new page:

1. Start the development server with `npm run dev`
2. Navigate to `http://localhost:3000/dashboard/users`
3. Verify that:
   - Unauthenticated users are redirected to the login page
   - Authenticated users can see the users list page
   - The navigation highlights the "Users" item when on this page

## Best Practices

- **Client vs. Server Components**:
  - Use "use client" directive when you need client-side interactivity
  - Leave server components without "use client" for better performance

- **Data Fetching**:
  - For protected pages, always fetch data after checking authentication
  - Handle loading and error states appropriately

- **Layout Consistency**:
  - Make sure new pages follow the design system of the application
  - Reuse UI components from the components directory

- **Route Protection**:
  - Always wrap public routes with `PublicRoute`
  - Always wrap protected routes with `ProtectedRoute` (or ensure they're under a layout that does)

- **Permissions**:
  - Beyond simple authentication, implement role-based access control where needed
  - Check user.roles or user.permissions in the auth context when rendering sensitive content

