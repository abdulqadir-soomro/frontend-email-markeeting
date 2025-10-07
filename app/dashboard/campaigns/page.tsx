"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Mail, Send, Trash2, Eye, Settings, Globe, Users, Download, FileDown, Upload, RefreshCw, CheckCircle, X, Clock } from "lucide-react";

interface Campaign {
  id: string;
  subject: string;
  fromEmail: string;
  htmlContent: string;
  status: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  createdAt: string;
  sentAt?: string;
  fromName?: string;
}

interface Domain {
  id: string;
  domain: string;
  status: string;
  emailAddresses?: string[];
}

interface Template {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  category: string;
}

interface Recipient {
  email: string;
  name: string;
  status: string;
  sentAt?: string;
  openedAt?: string;
}

export default function CampaignsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  // Form state
  const [subject, setSubject] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromDomain, setFromDomain] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [sendMethodDialogOpen, setSendMethodDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [sendingMethod, setSendingMethod] = useState<"gmail" | "aws">("aws");
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [recipientsDialogOpen, setRecipientsDialogOpen] = useState(false);
  const [selectedCampaignForRecipients, setSelectedCampaignForRecipients] = useState<Campaign | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [quickSendDialogOpen, setQuickSendDialogOpen] = useState(false);
  const [csvRecipients, setCsvRecipients] = useState<{ email: string; name: string }[]>([]);
  const [quickSendFile, setQuickSendFile] = useState<File | null>(null);
  const [quickSending, setQuickSending] = useState(false);
  const quickSendFileRef = useRef<HTMLInputElement>(null);

  // Sending Progress States
  const [sendingProgress, setSendingProgress] = useState(false);
  const [currentSendingEmail, setCurrentSendingEmail] = useState("");
  const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0, failed: 0 });
  const [sendingLogs, setSendingLogs] = useState<Array<{ email: string; status: "success" | "failed"; timestamp: string }>>([]);

  // Campaign Details State
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState<Campaign | null>(null);
  const [campaignStats, setCampaignStats] = useState<{
    totalSent: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    fetchDomains();
    fetchTemplates();
    checkGmailStatus();
  }, [user]);

  const fetchCampaigns = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/campaigns/list?userId=${user.uid}`);
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDomains = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/domains/list?userId=${user.uid}`);
      const data = await res.json();
      // Only show verified domains
      const verifiedDomains = data.domains?.filter(
        (d: Domain) => d.status === "verified"
      );
      setDomains(verifiedDomains || []);
    } catch (error) {
      console.error("Error fetching domains:", error);
    }
  };

  const fetchTemplates = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/templates/list?userId=${user.uid}`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId === "scratch") {
      setSubject("");
      setHtmlContent("");
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setHtmlContent(template.htmlContent);
      toast({
        title: "Template loaded",
        description: `"${template.name}" has been loaded`,
      });
    }
  };

  const handleCreateCampaign = async () => {
    // Validation based on sending method
    if (sendingMethod === "gmail") {
      if (!gmailConnected) {
        toast({
          title: "Gmail Not Connected",
          description: "Please connect Gmail in Settings first",
          variant: "destructive",
        });
        return;
      }
      if (!subject || !htmlContent || !user) {
        toast({
          title: "Error",
          description: "Please fill in subject and content",
          variant: "destructive",
        });
        return;
      }
    } else {
      // AWS SES validation
      if (!subject || !fromDomain || !htmlContent || !user) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    }

    setCreating(true);

    try {
      const fromEmail = sendingMethod === "gmail" 
        ? gmailEmail 
        : fromDomain; // fromDomain now contains the full email address

      const res = await fetch("/api/campaigns/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          subject,
          fromEmail,
          fromName: fromName || (sendingMethod === "gmail" ? gmailEmail.split('@')[0] : fromEmail.split('@')[0]),
          htmlContent,
          sendingMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create campaign");
      }

      toast({
        title: "Success",
        description: `Campaign created successfully (${sendingMethod === "gmail" ? "Gmail" : "AWS SES"})`,
      });

      // Reset form
      setSubject("");
      setFromName("");
      setFromDomain("");
      setHtmlContent("");
      setSelectedTemplate("");
      setSendingMethod("aws");
      setDialogOpen(false);
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const checkGmailStatus = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/gmail/status?userId=${user.uid}`);
      const data = await response.json();
      setGmailConnected(data.connected || false);
      setGmailEmail(data.email || "");
    } catch (error) {
      console.error("Error checking Gmail status:", error);
    }
  };

  const handleSendClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setSendMethodDialogOpen(true);
  };

  const handleSendCampaign = async () => {
    if (!user || !selectedCampaign) return;

    setSendMethodDialogOpen(false);
    setSending(selectedCampaign.id);

    try {
      // Show progress dialog
      setSendingProgress(true);
      setSendProgress({ sent: 0, total: 0, failed: 0 });
      setSendingLogs([]);
      setCurrentSendingEmail("Initializing campaign...");

      // Get subscribers count first
      const subsResponse = await fetch(`/api/subscribers/list?userId=${user.uid}`);
      const subsData = await subsResponse.json();
      const activeSubscribers = subsData.subscribers?.filter((s: any) => s.status === "active") || [];
      
      setSendProgress({ sent: 0, total: activeSubscribers.length, failed: 0 });
      setCurrentSendingEmail(`Sending to ${activeSubscribers.length} subscribers...`);

      const res = await fetch("/api/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          campaignId: selectedCampaign.id,
          sendingMethod: sendingMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send campaign");
      }

      setSendProgress({ sent: data.sent, total: activeSubscribers.length, failed: data.failed });
      setCurrentSendingEmail("✅ Campaign sent successfully!");

      toast({
        title: "Campaign Sent!",
        description: `Successfully sent to ${data.sent} subscribers`,
      });

      fetchCampaigns();
      
      // Keep progress dialog open for 2 seconds to show completion
      setTimeout(() => {
        setSendingProgress(false);
      }, 2000);
    } catch (error: any) {
      setCurrentSendingEmail("❌ Error occurred");
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setTimeout(() => {
        setSendingProgress(false);
      }, 2000);
    } finally {
      setSending(null);
    }
  };

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (!user) return;
    if (!confirm(`Delete campaign "${campaign.subject}"?`)) return;

    try {
      const res = await fetch("/api/campaigns/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          campaignId: campaign.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete campaign");
      }

      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });

      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleViewRecipients = async (campaign: Campaign) => {
    setSelectedCampaignForRecipients(campaign);
    setRecipientsDialogOpen(true);
    setLoadingRecipients(true);

    try {
      const res = await fetch(`/api/campaigns/recipients?userId=${user?.uid}&campaignId=${campaign.id}`);
      const data = await res.json();
      
      if (data.success) {
        setRecipients(data.recipients || []);
      }
    } catch (error) {
      console.error("Error fetching recipients:", error);
      toast({
        title: "Error",
        description: "Failed to load recipients",
        variant: "destructive",
      });
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleExportRecipients = () => {
    if (!selectedCampaignForRecipients || recipients.length === 0) return;

    // Create CSV content
    const headers = ["Email", "Name", "Status", "Sent At", "Opened At"];
    const rows = recipients.map(r => [
      r.email,
      r.name,
      r.status,
      r.sentAt || "N/A",
      r.openedAt || "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-${selectedCampaignForRecipients.id}-recipients.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "Recipients list downloaded successfully",
    });
  };

  const handleQuickSendFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQuickSendFile(file);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());
      const parsedRecipients: { email: string; name: string }[] = [];

      // Skip header row and parse CSV
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parsing (handles quoted fields)
        const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
        if (matches && matches.length >= 1) {
          const email = matches[0].replace(/^"|"$/g, "").trim();
          const name = matches[1] ? matches[1].replace(/^"|"$/g, "").trim() : email.split("@")[0];

          // Basic email validation
          if (email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            parsedRecipients.push({ email, name });
          }
        }
      }

      setCsvRecipients(parsedRecipients);

      if (parsedRecipients.length === 0) {
        toast({
          title: "Warning",
          description: "No valid email addresses found in CSV",
          variant: "destructive",
        });
      } else {
        toast({
          title: "CSV Loaded",
          description: `Found ${parsedRecipients.length} valid recipients`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to parse CSV file",
        variant: "destructive",
      });
    }
  };

  const handleViewCampaignDetails = async (campaign: Campaign) => {
    setSelectedCampaignDetails(campaign);
    setDetailsDialogOpen(true);
    setLoadingStats(true);
    setCampaignStats(null);

    if (!user?.uid) {
      setLoadingStats(false);
      return;
    }

    try {
      // Fetch campaign statistics with both userId and campaignId
      const response = await fetch(`/api/campaigns/recipients?userId=${user.uid}&campaignId=${campaign.id}`);
      const data = await response.json();

      console.log("Campaign stats response:", data);

      if (response.ok && data.recipients) {
        const totalSent = data.recipients.length;
        const opened = data.recipients.filter((r: any) => r.opened).length;
        const clicked = data.recipients.filter((r: any) => r.clicked).length;
        const openRate = totalSent > 0 ? (opened / totalSent) * 100 : 0;
        const clickRate = totalSent > 0 ? (clicked / totalSent) * 100 : 0;

        console.log(`Stats calculated: Sent: ${totalSent}, Opened: ${opened}, Clicked: ${clicked}`);

        setCampaignStats({
          totalSent,
          opened,
          clicked,
          openRate,
          clickRate,
        });
      } else {
        console.error("Failed to load recipients:", data);
      }
    } catch (error) {
      console.error("Error fetching campaign stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleQuickSend = async () => {
    if (!user || csvRecipients.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a CSV with recipients first",
        variant: "destructive",
      });
      return;
    }

    if (!subject || !htmlContent) {
      toast({
        title: "Error",
        description: "Please fill in subject and email content",
        variant: "destructive",
      });
      return;
    }

    if (sendingMethod === "aws" && !fromDomain) {
      toast({
        title: "Error",
        description: "Please select a sender email address",
        variant: "destructive",
      });
      return;
    }

    if (sendingMethod === "gmail" && !gmailConnected) {
      toast({
        title: "Error",
        description: "Gmail is not connected",
        variant: "destructive",
      });
      return;
    }

    setQuickSending(true);
    setSendingProgress(true);
    setSendProgress({ sent: 0, total: csvRecipients.length, failed: 0 });
    setSendingLogs([]);

    try {
      const fromEmail = sendingMethod === "gmail" ? gmailEmail : fromDomain;
      let sent = 0;
      let failed = 0;

      // Send emails one by one to show real-time progress
      for (let i = 0; i < csvRecipients.length; i++) {
        const recipient = csvRecipients[i];
        setCurrentSendingEmail(`📧 Sending to ${recipient.email}... (${i + 1}/${csvRecipients.length})`);

        try {
          let personalizedContent = htmlContent.replace(/\{\{name\}\}/g, recipient.name || recipient.email.split('@')[0]);

          if (sendingMethod === "gmail") {
            const response = await fetch("/api/gmail/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.uid,
                to: recipient.email,
                subject,
                htmlContent: personalizedContent,
                recipientName: recipient.name || recipient.email.split('@')[0],
              }),
            });
            const data = await response.json();
            if (data.success) {
              sent++;
              setSendingLogs(prev => [...prev, { 
                email: recipient.email, 
                status: "success", 
                timestamp: new Date().toLocaleTimeString() 
              }]);
            } else {
              failed++;
              setSendingLogs(prev => [...prev, { 
                email: recipient.email, 
                status: "failed", 
                timestamp: new Date().toLocaleTimeString() 
              }]);
            }
            // Rate limiting for Gmail
            await new Promise(resolve => setTimeout(resolve, 1500));
          } else {
            // AWS SES - send via API
            const response = await fetch("/api/campaigns/send-single", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                from: fromEmail,
                to: recipient.email,
                subject,
                htmlContent: personalizedContent,
              }),
            });
            const data = await response.json();
            if (data.success) {
              sent++;
              setSendingLogs(prev => [...prev, { 
                email: recipient.email, 
                status: "success", 
                timestamp: new Date().toLocaleTimeString() 
              }]);
            } else {
              failed++;
              setSendingLogs(prev => [...prev, { 
                email: recipient.email, 
                status: "failed", 
                timestamp: new Date().toLocaleTimeString() 
              }]);
            }
            // Small delay to avoid overwhelming SES
            await new Promise(resolve => setTimeout(resolve, 200));
          }

          setSendProgress({ sent, total: csvRecipients.length, failed });
        } catch (error) {
          console.error(`Failed to send to ${recipient.email}:`, error);
          failed++;
          setSendProgress({ sent, total: csvRecipients.length, failed });
          setSendingLogs(prev => [...prev, { 
            email: recipient.email, 
            status: "failed", 
            timestamp: new Date().toLocaleTimeString() 
          }]);
        }
      }

      setCurrentSendingEmail(`✅ Completed! Sent: ${sent}, Failed: ${failed}`);

      toast({
        title: "Success! 🎉",
        description: `Sent to ${sent} recipients. ${failed} failed.`,
      });

      // Reset form
      setTimeout(() => {
        setQuickSendDialogOpen(false);
        setCsvRecipients([]);
        setQuickSendFile(null);
        setSubject("");
        setHtmlContent("");
        setFromDomain("");
        if (quickSendFileRef.current) {
          quickSendFileRef.current.value = "";
        }
        setSendingProgress(false);
      }, 3000);
    } catch (error: any) {
      setCurrentSendingEmail("❌ Error occurred");
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setTimeout(() => {
        setSendingProgress(false);
      }, 2000);
    } finally {
      setQuickSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-2">
            Create and manage your email campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setQuickSendDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Quick Send CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Design your email campaign to send to subscribers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Sending Method Selector */}
              <div className="space-y-2">
                <Label>Sending Method *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => gmailConnected && setSendingMethod("gmail")}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      sendingMethod === "gmail"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    } ${!gmailConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-4 w-4" />
                      <span className="font-semibold text-sm">Gmail</span>
                      {sendingMethod === "gmail" && (
                        <div className="ml-auto h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {gmailConnected ? (
                        <>From: {gmailEmail}</>
                      ) : (
                        <>Not connected</>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {gmailConnected ? "✓ Up to 500/day" : "⚠ Connect in Settings"}
                    </p>
                  </div>

                  <div
                    onClick={() => setSendingMethod("aws")}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      sendingMethod === "aws"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="h-4 w-4" />
                      <span className="font-semibold text-sm">AWS SES</span>
                      {sendingMethod === "aws" && (
                        <div className="ml-auto h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">From: Verified domain</p>
                    <p className="text-xs text-gray-500 mt-1">✓ Up to 50,000+/day</p>
                  </div>
                </div>
                {sendingMethod === "gmail" && !gmailConnected && (
                  <p className="text-xs text-red-600">
                    <a href="/dashboard/settings" className="underline font-medium">
                      Connect Gmail
                    </a>{" "}
                    in Settings to use this option
                  </p>
                )}
              </div>

              {/* Template Selector */}
              <div className="space-y-2">
                <Label htmlFor="template">Start with a Template (Optional)</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template or start from scratch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scratch">
                      ✏️ Start from Scratch
                    </SelectItem>
                    {templates.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-t">
                          YOUR TEMPLATES
                        </div>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            📧 {template.name} ({template.category})
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                {templates.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No templates yet.{" "}
                    <a
                      href="/dashboard/templates"
                      className="text-blue-600 hover:underline"
                    >
                      Create templates
                    </a>{" "}
                    to speed up campaign creation.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line *</Label>
                <Input
                  id="subject"
                  placeholder="Your amazing subject line"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  placeholder="Your Company"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                />
              </div>

              {sendingMethod === "aws" && (
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email Address *</Label>
                  {domains.length === 0 ? (
                    <p className="text-sm text-red-600">
                      You need to verify a domain first. Go to{" "}
                      <a href="/dashboard/domains" className="underline font-semibold">
                        Domains page
                      </a>
                      .
                    </p>
                  ) : (
                    <>
                      <Select
                        value={fromDomain}
                        onValueChange={(value) => {
                          setFromDomain(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select email address" />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.map((domain) => {
                            const emailAddresses = domain.emailAddresses || [];
                            return (
                              <div key={domain.id}>
                                {emailAddresses.length > 0 ? (
                                  <>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-b">
                                      {domain.domain}
                                    </div>
                                    {emailAddresses.map((email) => (
                                      <SelectItem key={email} value={email}>
                                        📧 {email}
                                      </SelectItem>
                                    ))}
                                  </>
                                ) : (
                                  <SelectItem key={`${domain.id}-default`} value={`noreply@${domain.domain}`}>
                                    📧 noreply@{domain.domain}
                                  </SelectItem>
                                )}
                              </div>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        💡 Configure email addresses in{" "}
                        <a
                          href="/dashboard/domains"
                          className="text-blue-600 hover:underline"
                        >
                          Domains page
                        </a>
                      </p>
                    </>
                  )}
                </div>
              )}

              {sendingMethod === "gmail" && (
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {gmailEmail || "Gmail not connected"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Emails will be sent from your connected Gmail account
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="htmlContent">Email Content (HTML) *</Label>
                <Textarea
                  id="htmlContent"
                  placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  💡 Tip: Use {`{{name}}`} in your content to personalize with subscriber names
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setPreviewHtml(htmlContent);
                  setPreviewOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview HTML
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign} disabled={creating}>
                {creating ? "Creating..." : "Create Campaign"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {domains.length === 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800">
              <strong>Note:</strong> You need to verify at least one domain before
              creating campaigns. Visit the{" "}
              <a href="/dashboard/domains" className="underline font-semibold">
                Domains page
              </a>{" "}
              to get started.
            </p>
          </CardContent>
        </Card>
      )}

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <Mail className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
            <p className="text-gray-600 text-center mb-6">
              Create your first email campaign to get started
            </p>
            <Button onClick={() => setDialogOpen(true)} disabled={domains.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Opens</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id} className="hover:bg-gray-50">
                  <TableCell className="max-w-md">
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{campaign.subject}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span>{campaign.fromEmail}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {campaign.status === "sent" ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Sent
                            </span>
                            {campaign.sentAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(campaign.sentAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Draft
                          </span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="space-y-1">
                      <p className="text-gray-900">
                        {campaign.sentAt 
                          ? new Date(campaign.sentAt).toLocaleString()
                          : new Date(campaign.createdAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {campaign.sentAt ? "Sent" : "Created"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{campaign.sentCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{campaign.openCount || 0}</span>
                      </div>
                      {campaign.sentCount > 0 && (
                        <p className="text-xs text-gray-500">
                          {((campaign.openCount || 0) / campaign.sentCount * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{campaign.clickCount || 0}</span>
                      </div>
                      {campaign.sentCount > 0 && (
                        <p className="text-xs text-gray-500">
                          {((campaign.clickCount || 0) / campaign.sentCount * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewCampaignDetails(campaign)}
                        title="View campaign details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {campaign.status === "sent" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewRecipients(campaign)}
                          title="View recipients"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      )}
                      {campaign.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => handleSendClick(campaign)}
                          disabled={sending === campaign.id}
                        >
                          {sending === campaign.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCampaign(campaign)}
                        title="Delete campaign"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Send Method Selection Dialog */}
      <Dialog open={sendMethodDialogOpen} onOpenChange={setSendMethodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Sending Method</DialogTitle>
            <DialogDescription>
              Select how you want to send this campaign
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div
              onClick={() => setSendingMethod("gmail")}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                sendingMethod === "gmail"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${!gmailConnected ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Gmail
                </h4>
                {sendingMethod === "gmail" && (
                  <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Send from your personal Gmail account
              </p>
              <div className="text-xs space-y-1">
                <p>✓ Up to 500 emails per day</p>
                <p>✓ Sends from your Gmail address</p>
                <p>
                  {gmailConnected ? (
                    <span className="text-green-600 font-medium">● Connected</span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      ● Not connected - <a href="/dashboard/settings" className="underline">Connect in Settings</a>
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div
              onClick={() => setSendingMethod("aws")}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                sendingMethod === "aws"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  AWS SES
                </h4>
                {sendingMethod === "aws" && (
                  <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Send from verified domains
              </p>
              <div className="text-xs space-y-1">
                <p>✓ Up to 50,000+ emails per day</p>
                <p>✓ Sends from your verified domains</p>
                <p>✓ Better for large campaigns</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendMethodDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendCampaign}
              disabled={sendingMethod === "gmail" && !gmailConnected}
            >
              Send Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* HTML Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg p-4 max-h-[70vh] overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
          <DialogFooter>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recipients Dialog */}
      <Dialog open={recipientsDialogOpen} onOpenChange={setRecipientsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Campaign Recipients</DialogTitle>
            <DialogDescription>
              {selectedCampaignForRecipients?.subject} - Sent to {recipients.length} subscriber(s)
            </DialogDescription>
          </DialogHeader>

          {loadingRecipients ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-semibold">{recipients.length}</span> total recipients
                  </div>
                  <div className="text-sm text-gray-600">
                    Sent from: <span className="font-mono">{selectedCampaignForRecipients?.fromEmail}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportRecipients}
                  disabled={recipients.length === 0}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="border rounded-lg max-h-[60vh] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Opened</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No recipients found
                        </TableCell>
                      </TableRow>
                    ) : (
                      recipients.map((recipient, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{recipient.email}</TableCell>
                          <TableCell>{recipient.name}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                recipient.status === "sent"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {recipient.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {recipient.sentAt ? new Date(recipient.sentAt).toLocaleString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            {recipient.openedAt ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <Eye className="h-4 w-4" />
                                <span className="text-xs">
                                  {new Date(recipient.openedAt).toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Not opened</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          <DialogFooter>
            <Button onClick={() => setRecipientsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Send Dialog */}
      <Dialog open={quickSendDialogOpen} onOpenChange={setQuickSendDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Send - Upload CSV & Send</DialogTitle>
            <DialogDescription>
              Upload a CSV file and send emails immediately to all recipients
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Step 1: Upload CSV */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Step 1: Upload Recipients CSV</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  ref={quickSendFileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleQuickSendFileUpload}
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <Button onClick={() => quickSendFileRef.current?.click()} variant="outline">
                  {quickSendFile ? "Change CSV File" : "Choose CSV File"}
                </Button>
                {quickSendFile && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ {quickSendFile.name} - {csvRecipients.length} recipients loaded
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-3">
                  CSV format: email,name<br/>
                  Example: john@example.com,John Doe
                </p>
              </div>
            </div>

            {csvRecipients.length > 0 && (
              <>
                {/* Recipients Preview */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <Label className="text-sm font-semibold mb-2 block">Recipients Preview ({csvRecipients.length})</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {csvRecipients.slice(0, 10).map((recipient, index) => (
                      <div key={index} className="text-xs flex justify-between">
                        <span className="font-mono">{recipient.email}</span>
                        <span className="text-gray-500">{recipient.name}</span>
                      </div>
                    ))}
                    {csvRecipients.length > 10 && (
                      <p className="text-xs text-gray-500 pt-2">
                        ...and {csvRecipients.length - 10} more
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 2: Configure Email */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Step 2: Configure Email</Label>
                  
                  {/* Template Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="quickTemplate">Start with a Template (Optional)</Label>
                    <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template or start from scratch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scratch">
                          ✏️ Start from Scratch
                        </SelectItem>
                        {templates.length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-t">
                              YOUR TEMPLATES
                            </div>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                📧 {template.name} ({template.category})
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    {templates.length === 0 && (
                      <p className="text-xs text-gray-500">
                        No templates yet.{" "}
                        <a
                          href="/dashboard/templates"
                          className="text-blue-600 hover:underline"
                        >
                          Create templates
                        </a>{" "}
                        to speed up email creation.
                      </p>
                    )}
                  </div>

                  {/* Sending Method */}
                  <div className="space-y-2">
                    <Label>Sending Method *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => gmailConnected && setSendingMethod("gmail")}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          sendingMethod === "gmail"
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        } ${!gmailConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="font-semibold text-sm">Gmail</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {gmailConnected ? gmailEmail : "Not connected"}
                        </p>
                      </div>

                      <div
                        onClick={() => setSendingMethod("aws")}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          sendingMethod === "aws"
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span className="font-semibold text-sm">AWS SES</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Verified domain</p>
                      </div>
                    </div>
                  </div>

                  {/* From Email */}
                  {sendingMethod === "aws" && (
                    <div className="space-y-2">
                      <Label htmlFor="quickFromEmail">From Email *</Label>
                      <Select value={fromDomain} onValueChange={setFromDomain}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select email address" />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.map((domain) => {
                            const emailAddresses = domain.emailAddresses || [];
                            return (
                              <div key={domain.id}>
                                {emailAddresses.length > 0 ? (
                                  <>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-b">
                                      {domain.domain}
                                    </div>
                                    {emailAddresses.map((email) => (
                                      <SelectItem key={email} value={email}>
                                        📧 {email}
                                      </SelectItem>
                                    ))}
                                  </>
                                ) : (
                                  <SelectItem key={`${domain.id}-default`} value={`hello@${domain.domain}`}>
                                    📧 hello@{domain.domain}
                                  </SelectItem>
                                )}
                              </div>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="quickSubject">Subject Line *</Label>
                    <Input
                      id="quickSubject"
                      placeholder="Your email subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  {/* Email Content */}
                  <div className="space-y-2">
                    <Label htmlFor="quickContent">Email Content (HTML) *</Label>
                    <Textarea
                      id="quickContent"
                      placeholder="<h1>Hello!</h1><p>Your email content...</p>"
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      className="min-h-[150px] font-mono text-sm"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        💡 Use {`{{name}}`} to personalize with recipient names
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPreviewHtml(htmlContent);
                          setPreviewOpen(true);
                        }}
                        disabled={!htmlContent}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Note:</strong> Emails will be sent immediately to all {csvRecipients.length} recipients. 
                    This action cannot be undone. Recipients won't be added to your subscriber list.
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setQuickSendDialogOpen(false);
                setCsvRecipients([]);
                setQuickSendFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleQuickSend}
              disabled={quickSending || csvRecipients.length === 0 || !subject || !htmlContent}
            >
              {quickSending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending to {csvRecipients.length}...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to {csvRecipients.length} Recipients
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sending Progress Dialog */}
      <Dialog open={sendingProgress} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              Sending Emails in Progress
            </DialogTitle>
            <DialogDescription>
              Please wait while we send your emails. Do not close this window.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Email Being Sent */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">{currentSendingEmail}</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">
                  {sendProgress.sent} / {sendProgress.total} sent
                  {sendProgress.failed > 0 && (
                    <span className="text-red-600 ml-2">({sendProgress.failed} failed)</span>
                  )}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${sendProgress.total > 0 ? ((sendProgress.sent + sendProgress.failed) / sendProgress.total) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  {sendProgress.total > 0
                    ? Math.round(((sendProgress.sent + sendProgress.failed) / sendProgress.total) * 100)
                    : 0}
                  % Complete
                </span>
                <span>
                  {sendProgress.total - sendProgress.sent - sendProgress.failed} remaining
                </span>
              </div>
            </div>

            {/* Sending Logs */}
            {sendingLogs.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Recent Activity</Label>
                  <span className="text-xs text-gray-500">Last {Math.min(sendingLogs.length, 10)} emails</span>
                </div>
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  <div className="divide-y">
                    {sendingLogs.slice(-10).reverse().map((log, idx) => (
                      <div
                        key={idx}
                        className={`p-3 flex items-center justify-between ${
                          log.status === "success" ? "bg-green-50" : "bg-red-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {log.status === "success" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm font-medium text-gray-900">{log.email}</span>
                        </div>
                        <span className="text-xs text-gray-500">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{sendProgress.sent}</p>
                <p className="text-xs text-green-600">Sent Successfully</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-700">{sendProgress.failed}</p>
                <p className="text-xs text-red-600">Failed</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {sendProgress.total - sendProgress.sent - sendProgress.failed}
                </p>
                <p className="text-xs text-blue-600">Remaining</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Mail className="h-6 w-6 text-blue-600" />
              Campaign Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this campaign
            </DialogDescription>
          </DialogHeader>

          {selectedCampaignDetails && (
            <div className="space-y-6 py-4">
              {/* Campaign Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Subject Line</Label>
                    <p className="text-lg font-medium mt-1">{selectedCampaignDetails.subject}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">From Email</Label>
                    <p className="text-sm mt-1">{selectedCampaignDetails.fromEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Status</Label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedCampaignDetails.status === "sent"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedCampaignDetails.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Created At</Label>
                    <p className="text-sm mt-1">
                      {new Date(selectedCampaignDetails.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-600">Campaign Statistics</Label>
                  {loadingStats ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : campaignStats ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-3xl font-bold text-blue-700">{campaignStats.totalSent}</p>
                        <p className="text-xs text-blue-600 mt-1">Total Sent</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-3xl font-bold text-green-700">{campaignStats.opened}</p>
                        <p className="text-xs text-green-600 mt-1">Opened</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-3xl font-bold text-purple-700">
                          {campaignStats.openRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-purple-600 mt-1">Open Rate</p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-3xl font-bold text-orange-700">
                          {campaignStats.clickRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-orange-600 mt-1">Click Rate</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">
                        {selectedCampaignDetails.status === "draft"
                          ? "Statistics will be available after sending"
                          : "No statistics available"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-600">Email Content Preview</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPreviewHtml(selectedCampaignDetails.htmlContent);
                      setPreviewOpen(true);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Full Preview
                  </Button>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedCampaignDetails.htmlContent.substring(0, 1000) + 
                        (selectedCampaignDetails.htmlContent.length > 1000 ? '...' : ''),
                    }}
                    className="prose prose-sm max-w-none"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Label className="text-sm font-semibold text-gray-600">Quick Actions:</Label>
                {selectedCampaignDetails.status === "sent" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      handleViewRecipients(selectedCampaignDetails);
                    }}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    View Recipients
                  </Button>
                )}
                {selectedCampaignDetails.status === "draft" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      handleSendClick(selectedCampaignDetails);
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Campaign
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    handleDeleteCampaign(selectedCampaignDetails);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Campaign
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

