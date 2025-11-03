"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculatePercentage, formatDateTime } from "@/lib/utils";
import { BarChart3, TrendingUp, Mail, MousePointer } from "lucide-react";
import { campaignAPI } from "@/lib/api-client";

interface CampaignAnalytics {
  campaign: {
    _id: string;
    id: string;
    subject: string;
    fromEmail: string;
    status: string;
    sentCount: number;
    openCount: number;
    clickCount: number;
    createdAt: string;
    sentAt?: string;
  };
  analytics: {
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    openRate: string;
    clickRate: string;
    bounceRate: string;
  };
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const fetchCampaigns = async () => {
    if (!user) return;

    try {
      // First get all sent campaigns
      const campaignList = await campaignAPI.list({ status: 'sent' });
      
      // Then get detailed analytics for each campaign
      const campaignsWithAnalytics = await Promise.all(
        campaignList.data?.map(async (campaign: any) => {
          try {
            const analyticsData = await campaignAPI.getAnalytics(campaign._id);
            return {
              campaign: {
                ...campaign,
                id: campaign._id,
                sentCount: campaign.sentCount || 0,
                openCount: campaign.openCount || 0,
                clickCount: campaign.clickCount || 0,
              },
              analytics: analyticsData.data.analytics
            };
          } catch (error) {
            // Fallback to campaign data if analytics fails
            return {
              campaign: {
                ...campaign,
                id: campaign._id,
                sentCount: campaign.sentCount || 0,
                openCount: campaign.openCount || 0,
                clickCount: campaign.clickCount || 0,
              },
              analytics: {
                totalSent: campaign.sentCount || 0,
                totalOpened: campaign.openCount || 0,
                totalClicked: campaign.clickCount || 0,
                totalBounced: campaign.bounceCount || 0,
                openRate: calculatePercentage(campaign.openCount || 0, campaign.sentCount || 0),
                clickRate: calculatePercentage(campaign.clickCount || 0, campaign.sentCount || 0),
                bounceRate: calculatePercentage(campaign.bounceCount || 0, campaign.sentCount || 0),
              }
            };
          }
        }) || []
      );
      
      setCampaigns(campaignsWithAnalytics);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSent = campaigns.reduce((sum, c) => sum + (c.analytics.totalSent || 0), 0);
  const totalOpens = campaigns.reduce((sum, c) => sum + (c.analytics.totalOpened || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.analytics.totalClicked || 0), 0);
  const totalBounced = campaigns.reduce((sum, c) => sum + (c.analytics.totalBounced || 0), 0);

  const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
  const avgClickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;
  const avgBounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-10 w-16" />
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
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Track the performance of your email campaigns
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Sent
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSent}</div>
            <p className="text-xs text-gray-500 mt-1">
              Across {campaigns.length} campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Opens
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOpens}</div>
            <p className="text-xs text-gray-500 mt-1">
              {avgOpenRate.toFixed(1)}% open rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Clicks
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-100">
              <MousePointer className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClicks}</div>
            <p className="text-xs text-gray-500 mt-1">
              {avgClickRate.toFixed(1)}% click rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Bounced
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-100">
              <BarChart3 className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBounced}</div>
            <p className="text-xs text-gray-500 mt-1">
              {avgBounceRate.toFixed(1)}% bounce rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details */}
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <BarChart3 className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No campaign data yet</h3>
            <p className="text-gray-600 text-center">
              Send your first campaign to see analytics here
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>
              Detailed metrics for each sent campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Opens</TableHead>
                  <TableHead>Open Rate</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Click Rate</TableHead>
                  <TableHead>Bounced</TableHead>
                  <TableHead>Sent Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map(({ campaign, analytics }) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{campaign.subject}</div>
                        <div className="text-xs text-gray-500">
                          {campaign.fromEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{analytics.totalSent || 0}</TableCell>
                    <TableCell>{analytics.totalOpened || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                parseFloat(analytics.openRate),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{analytics.openRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{analytics.totalClicked || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                parseFloat(analytics.clickRate),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {analytics.clickRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{analytics.totalBounced || 0}</TableCell>
                    <TableCell className="text-sm">
                      {campaign.sentAt
                        ? formatDateTime(campaign.sentAt)
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}