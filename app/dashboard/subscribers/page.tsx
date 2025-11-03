"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/components/ui/use-toast";
import { Upload, Users, Trash2, Download, Search, FileDown, Check, X, Mail, Plus, Edit, Eye, Filter, TrendingUp, Activity } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { subscriberAPI } from "@/lib/api-client";

interface Subscriber {
  id: string;
  email: string;
  name: string;
  status: string;
  createdAt: string;
  tags?: string[];
  source?: string;
  lastEmailSent?: string;
  emailsSent?: number;
  emailsOpened?: number;
}

export default function SubscribersPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered subscribers based on search and status
  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: subscribers.length,
    active: subscribers.filter((s) => s.status === "active").length,
    inactive: subscribers.filter((s) => s.status === "inactive").length,
  };

  useEffect(() => {
    fetchSubscribers();
  }, [user]);

  const fetchSubscribers = async () => {
    if (!user) return;

    try {
      const data = await subscriberAPI.list();
      setSubscribers(data.data || []);
    } catch (error: any) {
      console.error("Error fetching subscribers:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch subscribers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    try {
      const text = await file.text();
      
      const data = await subscriberAPI.uploadCSV(text);

      toast({
        title: "Upload Complete",
        description: `Added ${data.data.added} subscribers. ${data.data.skipped} skipped.`,
      });

      fetchSubscribers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteSubscriber = async (subscriber: Subscriber) => {
    if (!user) return;
    if (!confirm(`Delete ${subscriber.email}?`)) return;

    try {
      await subscriberAPI.delete(subscriber.id);

      toast({
        title: "Success",
        description: "Subscriber deleted successfully",
      });

      fetchSubscribers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subscriber",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    const csv = "email,name\njohn@example.com,John Doe\njane@example.com,Jane Smith";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportSubscribers = () => {
    if (subscribers.length === 0) return;

    const headers = ["Email", "Name", "Status", "Added"];
    const rows = subscribers.map((s) => [
      s.email,
      s.name || "",
      s.status,
      new Date(s.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: `${subscribers.length} subscribers exported successfully`,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredSubscribers.map((s) => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0 || !user) return;
    if (!confirm(`Delete ${selectedIds.size} subscriber(s)?`)) return;

    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedIds);
      await subscriberAPI.bulkDelete(ids);

      toast({
        title: "Success",
        description: `${selectedIds.size} subscriber(s) deleted successfully`,
      });

      setSelectedIds(new Set());
      fetchSubscribers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subscribers",
        variant: "destructive",
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleAddSubscriber = async () => {
    if (!newEmail || !user) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({
        title: "Error",
        description: "Invalid email format",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await subscriberAPI.add({
        email: newEmail,
        name: newName || newEmail.split("@")[0],
      });

      toast({
        title: "Success",
        description: "Subscriber added successfully",
      });

      setNewEmail("");
      setNewName("");
      setAddDialogOpen(false);
      fetchSubscribers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add subscriber",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubscriber = async () => {
    if (!selectedSubscriber || !user) return;

    setSaving(true);
    try {
      await subscriberAPI.update(selectedSubscriber.id, {
        name: editName,
        status: editStatus,
      });

      toast({
        title: "Success",
        description: "Subscriber updated successfully",
      });

      setEditDialogOpen(false);
      setSelectedSubscriber(null);
      fetchSubscribers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscriber",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setEditEmail(subscriber.email);
    setEditName(subscriber.name || "");
    setEditStatus(subscriber.status);
    setEditDialogOpen(true);
  };

  const openDetailsDialog = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-9 w-40 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-20" />
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscribers</h1>
          <p className="text-gray-600 mt-2">
            Manage your email subscriber list
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Template
          </Button>
          <Button variant="outline" onClick={handleExportSubscribers} disabled={subscribers.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subscriber
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <X className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Instructions</CardTitle>
            <CardDescription>
              Follow these guidelines to upload your subscriber list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Prepare a CSV file with columns: email, name</li>
              <li>Download the template above if you need a starting point</li>
              <li>Make sure all email addresses are valid</li>
              <li>Click "Upload CSV" and select your file</li>
              <li>Duplicates will be automatically skipped</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {uploading && (
        <Card className="mb-6">
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-lg">Uploading subscribers...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {subscribers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No subscribers yet</h3>
            <p className="text-gray-600 text-center mb-6">
              Upload a CSV file to add your first subscribers
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Subscribers
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {subscribers.length} Subscriber{subscribers.length !== 1 ? "s" : ""}
              </CardTitle>
              <div className="flex items-center gap-4">
                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                {/* Search */}
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {selectedIds.size} subscriber(s) selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedIds(new Set())}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.size === filteredSubscribers.length && filteredSubscribers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchQuery ? "No subscribers match your search" : "No subscribers found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubscribers.map((subscriber, index) => (
                      <TableRow key={subscriber.id || `subscriber-${index}`}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(subscriber.id)}
                            onCheckedChange={(checked: boolean | "indeterminate") =>
                              handleSelectOne(subscriber.id, checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium font-mono text-sm">
                          {subscriber.email}
                        </TableCell>
                        <TableCell>{subscriber.name || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              subscriber.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {subscriber.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(subscriber.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDetailsDialog(subscriber)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(subscriber)}
                              title="Edit subscriber"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteSubscriber(subscriber)}
                              title="Delete subscriber"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Results Info */}
            {searchQuery && (
              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredSubscribers.length} of {subscribers.length} subscribers
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Subscriber Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subscriber</DialogTitle>
            <DialogDescription>
              Add a new subscriber to your email list manually
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">Email Address *</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="subscriber@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newName">Name (Optional)</Label>
              <Input
                id="newName"
                placeholder="John Doe"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubscriber} disabled={saving || !newEmail}>
              {saving ? "Adding..." : "Add Subscriber"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscriber Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscriber</DialogTitle>
            <DialogDescription>
              Update subscriber information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                value={editEmail}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editName">Name</Label>
              <Input
                id="editName"
                placeholder="John Doe"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubscriber} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subscriber Details</DialogTitle>
            <DialogDescription>
              Complete information about this subscriber
            </DialogDescription>
          </DialogHeader>
          {selectedSubscriber && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Email Address</Label>
                  <p className="font-mono text-sm font-medium">{selectedSubscriber.email}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Name</Label>
                  <p className="text-sm font-medium">{selectedSubscriber.name || "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Status</Label>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedSubscriber.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedSubscriber.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Added On</Label>
                  <p className="text-sm">{new Date(selectedSubscriber.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Engagement Statistics
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedSubscriber.emailsSent ?? 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Emails Sent</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedSubscriber.emailsOpened ?? 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Emails Opened</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600">
                      {(() => {
                        const sent = selectedSubscriber.emailsSent ?? 0;
                        const opened = selectedSubscriber.emailsOpened ?? 0;
                        return sent > 0 ? Math.round((opened / sent) * 100) : 0;
                      })()}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Open Rate</div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {selectedSubscriber.source && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Source</Label>
                  <p className="text-sm">{selectedSubscriber.source}</p>
                </div>
              )}

              {selectedSubscriber.lastEmailSent && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Last Email Sent</Label>
                  <p className="text-sm">{new Date(selectedSubscriber.lastEmailSent).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setDetailsDialogOpen(false);
              if (selectedSubscriber) openEditDialog(selectedSubscriber);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Subscriber
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}