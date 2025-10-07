"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Users, Globe, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    domains: 0,
    subscribers: 0,
    campaigns: 0,
    totalSent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Fetch domains
        const domainsRes = await fetch(`/api/domains/list?userId=${user.uid}`);
        const domainsData = await domainsRes.json();

        // Fetch subscribers
        const subscribersRes = await fetch(
          `/api/subscribers/list?userId=${user.uid}`
        );
        const subscribersData = await subscribersRes.json();

        // Fetch campaigns
        const campaignsRes = await fetch(
          `/api/campaigns/list?userId=${user.uid}`
        );
        const campaignsData = await campaignsRes.json();

        const totalSent = campaignsData.campaigns?.reduce(
          (sum: number, campaign: any) => sum + (campaign.sentCount || 0),
          0
        );

        setStats({
          domains: domainsData.domains?.length || 0,
          subscribers: subscribersData.subscribers?.length || 0,
          campaigns: campaignsData.campaigns?.length || 0,
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
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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

