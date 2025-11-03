"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
// import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  MousePointer, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Mail,
  Download,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3
} from "lucide-react";
import { trackingAPI } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

interface EmailTrackingRecord {
  id: string;
  recipientEmail: string;
  subscriberName: string;
  sentAt: string;
  opened: boolean;
  openedAt?: string;
  openCount: number;
  lastOpenUserAgent?: string;
  lastOpenIP?: string;
  lastOpenSource?: 'gmail-proxy' | 'direct' | 'unknown';
  clicked: boolean;
  clickedAt?: string;
  clickCount: number;
  lastClickUserAgent?: string;
  lastClickBrowser?: string;
  lastClickOS?: string;
  lastClickDevice?: string;
  lastClickIP?: string;
  bounced: boolean;
  bouncedAt?: string;
  bounceReason?: string;
  complained: boolean;
  complainedAt?: string;
  status: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained';
  timeToOpen?: number; // in minutes
}

interface TrackingSummary {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalComplained: number;
  totalOpenCount: number;
  totalClickCount: number;
  avgOpenTimeMinutes: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
}

interface EmailTrackingDataProps {
  campaignId: string;
  campaignSubject: string;
}

export default function EmailTrackingData({ campaignId, campaignSubject }: EmailTrackingDataProps) {
  const { toast } = useToast();
  const [records, setRecords] = useState<EmailTrackingRecord[]>([]);
  const [summary, setSummary] = useState<TrackingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters and pagination
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 50;

  const fetchTrackingData = async (page = 1, status = statusFilter, search = searchTerm) => {
    try {
      const params: any = {
        page,
        limit: recordsPerPage,
      };

      if (status !== "all") {
        params.status = status;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const data = await trackingAPI.getEmailTrackingData(campaignId, params);
      
      if (data.success) {
        setRecords(data.data.records);
        setSummary(data.data.summary);
        setTotalPages(data.data.pagination.totalPages);
        setTotalRecords(data.data.pagination.totalRecords);
        setCurrentPage(data.data.pagination.currentPage);
      } else {
        throw new Error(data.error || "Failed to fetch tracking data");
      }
    } catch (error: any) {
      console.error("Error fetching tracking data:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
  }, [campaignId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrackingData(currentPage, statusFilter, searchTerm);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchTrackingData(1, status, searchTerm);
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
    fetchTrackingData(1, statusFilter, search);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTrackingData(page, statusFilter, searchTerm);
  };

  const exportToCSV = () => {
    if (records.length === 0) return;

    const headers = [
      "Email",
      "Name", 
      "Status",
      "Sent At",
      "Opened",
      "Opened At",
      "Open Count",
      "Clicked",
      "Clicked At", 
      "Click Count",
      "Bounced",
      "Bounced At",
      "Bounce Reason",
      "Reported",
      "Reported At",
      "Time to Open (min)"
    ];

    const rows = records.map(record => [
      record.recipientEmail,
      record.subscriberName,
      record.status,
      new Date(record.sentAt).toLocaleString(),
      record.opened ? "Yes" : "No",
      record.openedAt ? new Date(record.openedAt).toLocaleString() : "",
      record.openCount,
      record.clicked ? "Yes" : "No", 
      record.clickedAt ? new Date(record.clickedAt).toLocaleString() : "",
      record.clickCount,
      record.bounced ? "Yes" : "No",
      record.bouncedAt ? new Date(record.bouncedAt).toLocaleString() : "",
      record.bounceReason || "",
      record.complained ? "Yes" : "No",
      record.complainedAt ? new Date(record.complainedAt).toLocaleString() : "",
      record.timeToOpen || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-tracking-${campaignSubject.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "Email tracking data downloaded successfully",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      delivered: { color: "bg-gray-100 text-gray-800", icon: Mail },
      opened: { color: "bg-blue-100 text-blue-800", icon: Eye },
      clicked: { color: "bg-green-100 text-green-800", icon: MousePointer },
      bounced: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
      complained: { color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.delivered;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const formatTimeToOpen = (minutes?: number | null) => {
    if (minutes === undefined || minutes === null) return "N/A";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
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
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
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
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{summary.totalSent}</p>
                  <p className="text-xs text-gray-600">Total Sent</p>
                </div>
                <Mail className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{summary.totalOpened}</p>
                  <p className="text-xs text-gray-600">Opened</p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {summary.openRate}% open rate
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{summary.totalClicked}</p>
                  <p className="text-xs text-gray-600">Clicked</p>
                </div>
                <MousePointer className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {summary.clickRate}% click rate
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{summary.totalBounced}</p>
                  <p className="text-xs text-gray-600">Bounced</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div className="mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {summary.bounceRate}% bounce rate
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{summary.totalComplained}</p>
                  <p className="text-xs text-gray-600">Reported</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {summary.complaintRate}% complaint rate
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-indigo-600">{summary.avgOpenTimeMinutes}m</p>
                  <p className="text-xs text-gray-600">Avg Open Time</p>
                </div>
                <Clock className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Email Tracking Details
              </CardTitle>
              <CardDescription>
                Detailed tracking data for "{campaignSubject}" - {totalRecords} total emails
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={records.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search by email</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search recipient emails..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="status-filter">Filter by status</Label>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="opened">Opened</SelectItem>
                  <SelectItem value="clicked">Clicked</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                  <SelectItem value="complained">Reported</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Recipient</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[120px]">Sent At</TableHead>
                    <TableHead className="w-[100px]">Opened</TableHead>
                    <TableHead className="w-[100px]">Clicked</TableHead>
                    <TableHead className="w-[180px]">Device (Last Click)</TableHead>
                    <TableHead className="w-[100px]">Bounced</TableHead>
                    <TableHead className="w-[100px]">Reported</TableHead>
                    <TableHead className="w-[120px]">Time to Open</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No tracking data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record.id} className="hover:bg-gray-50">
                        <TableCell className="w-[200px]">
                          <div className="space-y-1">
                            <p className="font-medium text-sm break-all">{record.recipientEmail}</p>
                            <p className="text-xs text-gray-500">{record.subscriberName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="w-[100px]">
                          {getStatusBadge(record.status)}
                        </TableCell>
                        <TableCell className="w-[120px] text-xs text-gray-600">
                          {formatDateTime(record.sentAt)}
                        </TableCell>
                        <TableCell className="w-[100px]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              {record.opened ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <Clock className="h-3 w-3 text-gray-400" />
                              )}
                              <span className="text-xs">
                                {record.opened ? "Yes" : "No"}
                              </span>
                            </div>
                            {record.opened && (
                              <div className="text-xs text-gray-500">
                                {formatDateTime(record.openedAt)}
                                {record.lastOpenSource === 'gmail-proxy' && (
                                  <span className="ml-1 text-[10px] px-1 py-0.5 bg-gray-100 border rounded">Gmail proxy</span>
                                )}
                                {record.openCount > 1 && (
                                  <span className="ml-1">({record.openCount}x)</span>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="w-[100px]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              {record.clicked ? (
                                <>
                                  <MousePointer className="h-3 w-3 text-purple-600" />
                                  <span className="text-xs font-semibold text-purple-600">
                                    YES!
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">No</span>
                                </>
                              )}
                            </div>
                            {record.clicked && (
                              <div className="text-xs bg-purple-50 text-purple-800 px-2 py-1 rounded">
                                🎯 {formatDateTime(record.clickedAt)}
                                {record.clickCount > 1 && (
                                  <span className="ml-1">({record.clickCount}x)</span>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="w-[180px] text-xs text-gray-600">
                          {record.lastClickDevice || record.lastClickOS || record.lastClickBrowser ? (
                            <div className="space-y-0.5">
                              <div>{record.lastClickDevice || '—'}</div>
                              <div className="text-gray-500">{record.lastClickOS || '—'} • {record.lastClickBrowser || '—'}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="w-[100px]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              {record.bounced ? (
                                <AlertTriangle className="h-3 w-3 text-red-600" />
                              ) : (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              )}
                              <span className="text-xs">
                                {record.bounced ? "Yes" : "No"}
                              </span>
                            </div>
                            {record.bounced && (
                              <div className="text-xs text-gray-500">
                                {formatDateTime(record.bouncedAt)}
                                {record.bounceReason && (
                                  <div className="text-red-600 mt-1 text-xs">
                                    {record.bounceReason}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="w-[100px]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                        {record.complained ? (
                                <AlertTriangle className="h-3 w-3 text-orange-600" />
                              ) : (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              )}
                              <span className="text-xs">
                                {record.complained ? "Yes" : "No"}
                              </span>
                            </div>
                            {record.complained && (
                              <div className="text-xs text-gray-500">
                                {formatDateTime(record.complainedAt)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="w-[120px] text-xs text-gray-600">
                          {formatTimeToOpen(record.timeToOpen)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {records.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tracking data found
              </div>
            ) : (
              records.map((record) => (
                <Card key={record.id} className="p-3">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm break-all text-gray-900">
                          {record.recipientEmail}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {record.subscriberName}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(record.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Sent:</span>
                        <p className="text-gray-900">{formatDateTime(record.sentAt)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Time to Open:</span>
                        <p className="text-gray-900">{formatTimeToOpen(record.timeToOpen)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Opened:</span>
                        <div className="flex items-center gap-1 mt-1">
                          {record.opened ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Clock className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="text-gray-900">
                            {record.opened ? "Yes" : "No"}
                          </span>
                        </div>
                        {record.opened && (
                          <p className="text-gray-500 mt-1">
                            {formatDateTime(record.openedAt)}
                            {record.openCount > 1 && (
                              <span className="ml-1">({record.openCount}x)</span>
                            )}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Clicked:</span>
                        <div className="flex items-center gap-1 mt-1">
                          {record.clicked ? (
                            <>
                              <MousePointer className="h-3 w-3 text-purple-600" />
                              <span className="text-purple-600 font-semibold">
                                YES - Clicked!
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500">No</span>
                            </>
                          )}
                        </div>
                        {record.clicked && (
                          <div className="mt-1 p-2 bg-purple-50 border border-purple-200 rounded">
                            <p className="text-purple-800 text-xs font-medium">
                              🎯 Clicked at: {formatDateTime(record.clickedAt)}
                            </p>
                            {record.clickCount > 1 && (
                              <p className="text-purple-600 text-xs mt-1">
                                🔄 Total clicks: {record.clickCount}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Bounced:</span>
                        <div className="flex items-center gap-1 mt-1">
                          {record.bounced ? (
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                          ) : (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          )}
                          <span className="text-gray-900">
                            {record.bounced ? "Yes" : "No"}
                          </span>
                        </div>
                        {record.bounced && (
                          <div className="mt-1">
                            <p className="text-gray-500">{formatDateTime(record.bouncedAt)}</p>
                            {record.bounceReason && (
                              <p className="text-red-600 text-xs mt-1">{record.bounceReason}</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Reported:</span>
                        <div className="flex items-center gap-1 mt-1">
                          {record.complained ? (
                            <AlertTriangle className="h-3 w-3 text-orange-600" />
                          ) : (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          )}
                          <span className="text-gray-900">
                              {record.complained ? "Yes" : "No"}
                          </span>
                        </div>
                        {record.complained && (
                          <p className="text-gray-500 mt-1">{formatDateTime(record.complainedAt)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, totalRecords)} of {totalRecords} records
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}