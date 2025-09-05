"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Welcome, {user?.firstName || 'User'}!</CardTitle>
          <CardDescription>{`Here's an overview of your MedAI CMS`}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
        <CardHeader>
          <CardTitle>Total Content</CardTitle>
          <CardDescription>254 items in your library</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">254</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Published</CardTitle>
          <CardDescription>187 live content items</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">187</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Drafts</CardTitle>
          <CardDescription>67 awaiting publication</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">67</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Media Files</CardTitle>
          <CardDescription>632 images, videos & docs</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">632</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
          <CardDescription>48 active users</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">48</p>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
