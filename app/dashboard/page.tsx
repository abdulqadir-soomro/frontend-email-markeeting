"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Users, Globe, TrendingUp } from "lucide-react";
import { domainAPI, subscriberAPI, campaignAPI } from "@/lib/api-client";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    domains: 0,
    subscribers: 0,
    campaigns: 0,
    totalSent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || !isAuthenticated) return;

      try {
        // Fetch domains
        const domainsData = await domainAPI.list();

        // Fetch subscribers
        const subscribersData = await subscriberAPI.list();

        // Fetch campaigns
        const campaignsData = await campaignAPI.list();

        const totalSent = campaignsData.data?.reduce(
          (sum: number, campaign: any) => sum + (campaign.sentCount || 0),
          0
        );

        setStats({
          domains: domainsData.data?.length || 0,
          subscribers: subscribersData.data?.length || 0,
          campaigns: campaignsData.data?.length || 0,
          totalSent: totalSent || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const statCards = [
    {
      title: "Verified Domains",
      value: stats.domains,
      icon: Globe,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Subscribers",
      value: stats.subscribers,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Campaigns",
      value: stats.campaigns,
      icon: Mail,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Emails Sent",
      value: stats.totalSent,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-10 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-lg border border-gray-200">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's an overview of your email marketing platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/dashboard/domains"
              className="block p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">Add a Domain</h3>
              <p className="text-sm text-gray-600">
                Verify your domain to start sending emails
              </p>
            </a>
            <a
              href="/dashboard/subscribers"
              className="block p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">
                Upload Subscribers
              </h3>
              <p className="text-sm text-gray-600">
                Import your subscriber list via CSV
              </p>
            </a>
            <a
              href="/dashboard/campaigns"
              className="block p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">Create Campaign</h3>
              <p className="text-sm text-gray-600">
                Design and send your first email campaign
              </p>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium">Verify Your Domain</h4>
                <p className="text-sm text-gray-600">
                  Add SPF and DKIM records to your DNS settings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium">Add Subscribers</h4>
                <p className="text-sm text-gray-600">
                  Upload your contact list or add them manually
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium">Create & Send</h4>
                <p className="text-sm text-gray-600">
                  Design your campaign and reach your audience
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

