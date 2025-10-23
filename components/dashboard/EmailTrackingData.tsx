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
  clicked: boolean;
  clickedAt?: string;
  clickCount: number;
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
      "Complained",
      "Complained At",
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

  const formatTimeToOpen = (minutes?: number) => {
    if (!minutes) return "N/A";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading tracking data...</span>
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
                  <p className="text-xs text-gray-600">Complained</p>
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
                  <SelectItem value="complained">Complained</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Records Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Clicked</TableHead>
                  <TableHead>Bounced</TableHead>
                  <TableHead>Complained</TableHead>
                  <TableHead>Time to Open</TableHead>
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
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{record.recipientEmail}</p>
                          <p className="text-xs text-gray-500">{record.subscriberName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDateTime(record.sentAt)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {record.opened ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm">
                              {record.opened ? "Yes" : "No"}
                            </span>
                          </div>
                          {record.opened && (
                            <div className="text-xs text-gray-500">
                              {formatDateTime(record.openedAt)}
                              {record.openCount > 1 && (
                                <span className="ml-1">({record.openCount}x)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {record.clicked ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm">
                              {record.clicked ? "Yes" : "No"}
                            </span>
                          </div>
                          {record.clicked && (
                            <div className="text-xs text-gray-500">
                              {formatDateTime(record.clickedAt)}
                              {record.clickCount > 1 && (
                                <span className="ml-1">({record.clickCount}x)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {record.bounced ? (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            <span className="text-sm">
                              {record.bounced ? "Yes" : "No"}
                            </span>
                          </div>
                          {record.bounced && (
                            <div className="text-xs text-gray-500">
                              {formatDateTime(record.bouncedAt)}
                              {record.bounceReason && (
                                <div className="text-red-600 mt-1">
                                  {record.bounceReason}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {record.complained ? (
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            <span className="text-sm">
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
                      <TableCell className="text-sm text-gray-600">
                        {formatTimeToOpen(record.timeToOpen)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
