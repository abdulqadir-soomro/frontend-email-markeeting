"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { adminAPI } from "@/lib/api-client";
import { 
  Users, 
  Mail, 
  TrendingUp, 
  Activity, 
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  Globe,
  FileText
} from "lucide-react";

// Define admin emails (in production, store in database with role-based access)
const ADMIN_EMAILS = [
  'admin@gmail.com',
  'abdulqadir53970@gmail.com',
  // Add more admin emails here
];

interface User {
  id: string;
  email: string;
  createdAt: string;
  campaignCount?: number;
  subscriberCount?: number;
  lastActive?: string;
}

interface Campaign {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  status: string;
  sentCount: number;
  createdAt: string;
}

interface SystemStats {
  totalUsers: number;
  totalCampaigns: number;
  totalEmailsSent: number;
  totalSubscribers: number;
  activeToday: number;
  campaignsSentToday: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalCampaigns: 0,
    totalEmailsSent: 0,
    totalSubscribers: 0,
    activeToday: 0,
    campaignsSentToday: 0,
  });

  useEffect(() => {
    if (user) {
      const userIsAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');
      setIsAdmin(userIsAdmin);
      
      if (userIsAdmin) {
        loadAdminData();
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions",
          variant: "destructive",
        });
        router.push('/dashboard');
      }
    } else {
      router.push('/auth/login');
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel using API client
      const [usersData, campaignsData, statsData] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getCampaigns(),
        adminAPI.getStats(),
      ]);

      if (usersData.success) setUsers(usersData.users || []);
      if (campaignsData.success) setCampaigns(campaignsData.campaigns || []);
      if (statsData.success) setStats(statsData.stats || stats);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">You need admin permissions to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage users, campaigns, and system settings</p>
        </div>
        <Button onClick={loadAdminData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.activeToday} active today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.campaignsSentToday} sent today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmailsSent.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">All time total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscribers.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">Across all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per User</CardTitle>
            <BarChart3 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers > 0 ? Math.round(stats.totalSubscribers / stats.totalUsers) : 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">Subscribers per user</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-gray-600 mt-1">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Mail className="h-4 w-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage registered users and their activity</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Campaigns</TableHead>
                      <TableHead>Subscribers</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.campaignCount || 0}</TableCell>
                        <TableCell>{user.subscriberCount || 0}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {user.lastActive 
                            ? new Date(user.lastActive).toLocaleDateString()
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>All Campaigns</CardTitle>
              <CardDescription>Monitor all email campaigns across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No campaigns found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.userEmail}</TableCell>
                        <TableCell>{campaign.subject}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              campaign.status === "sent"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {campaign.status}
                          </span>
                        </TableCell>
                        <TableCell>{campaign.sentCount || 0}</TableCell>
                        <TableCell>
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>System-wide activity and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">System Status</p>
                    <p className="text-xs text-gray-600">All services are running normally</p>
                  </div>
                  <span className="text-xs text-gray-500">Now</span>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{stats.campaignsSentToday} campaigns sent today</p>
                    <p className="text-xs text-gray-600">Across all users</p>
                  </div>
                  <span className="text-xs text-gray-500">Today</span>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{stats.activeToday} active users today</p>
                    <p className="text-xs text-gray-600">Platform engagement</p>
                  </div>
                  <span className="text-xs text-gray-500">Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

