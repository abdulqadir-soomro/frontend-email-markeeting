"use client";

import { useEffect, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Plus, CheckCircle, Clock, RefreshCw, Trash2, Copy, Zap, FileText, Globe, Mail, X } from "lucide-react";
import { domainAPI } from "@/lib/api-client";

interface Domain {
  id: string;
  domain: string;
  status: string;
  dkimTokens: string[];
  createdAt: string;
  emails?: string[];
}

export default function DomainsPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDomain, setAddingDomain] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedEmailDomain, setSelectedEmailDomain] = useState<Domain | null>(null);
  const [customEmailPrefix, setCustomEmailPrefix] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState<Domain | null>(null);
  const [domainToReset, setDomainToReset] = useState<Domain | null>(null);

  useEffect(() => {
    fetchDomains();
  }, [user]);

  const fetchDomains = async () => {
    if (!user || !isAuthenticated) return;

    try {
      const data = await domainAPI.list();
      setDomains(data.data || []);
    } catch (error) {
      console.error("Error fetching domains:", error);
      toast({
        title: "Error",
        description: "Failed to fetch domains. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain || !user) return;

    setAddingDomain(true);

    try {
      const data = await domainAPI.add(newDomain);

      if (!data.success) {
        throw new Error(data.error || "Failed to add domain");
      }

      toast({
        title: "Success",
        description: data.message || "Domain added successfully. Please verify DNS records.",
      });

      setNewDomain("");
      setDialogOpen(false);
      fetchDomains();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add domain",
        variant: "destructive",
      });
    } finally {
      setAddingDomain(false);
    }
  };

  const handleVerifyDomain = async (domain: Domain) => {
    if (!user) return;

    try {
      const data = await domainAPI.verify(domain.id);

      toast({
        title: data.data?.status === "verified" ? "Domain Verified!" : "Verification Status",
        description: data.message || (data.data?.status === "verified"
          ? "Your domain is now verified and ready to use."
          : "DNS records verification pending. Please wait and try again."),
        variant: data.data?.status === "verified" ? "default" : "destructive",
      });

      fetchDomains();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify domain",
        variant: "destructive",
      });
    }
  };

  const handleResetVerification = (domain: Domain) => {
    setDomainToReset(domain);
    setResetConfirmOpen(true);
  };

  const confirmResetVerification = async () => {
    if (!user || !domainToReset) return;

    try {
      const data = await domainAPI.resetVerification(domainToReset.id);

      toast({
        title: "Verification Reset",
        description: data.message || "Domain verification status has been reset to pending",
      });

      fetchDomains();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset domain verification",
        variant: "destructive",
      });
    } finally {
      setResetConfirmOpen(false);
      setDomainToReset(null);
    }
  };


  const handleDeleteDomain = (domain: Domain) => {
    if (!domain.id || domain.id === 'undefined') {
      toast({
        title: "Error",
        description: "Invalid domain ID",
        variant: "destructive",
      });
      return;
    }
    setDomainToDelete(domain);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteDomain = async () => {
    if (!user || !domainToDelete) return;

    try {
      const data = await domainAPI.delete(domainToDelete.id);

      toast({
        title: "Success",
        description: data.message || "Domain deleted successfully",
      });

      fetchDomains();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete domain",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setDomainToDelete(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const suggestedEmailPrefixes = ["hello", "marketing", "newsletter", "team", "support", "info", "contact"];

  const handleViewEmails = (domain: Domain) => {
    console.log("Managing emails for domain:", domain); // Debug log
    setSelectedEmailDomain(domain);
    setEmailDialogOpen(true);
  };

  const handleAddEmailAddress = async (prefix: string) => {
    if (!selectedEmailDomain || !user || !prefix) return;

    const emailAddress = `${prefix}@${selectedEmailDomain.domain}`;
    const currentEmails = selectedEmailDomain.emails || [];

    if (currentEmails.includes(emailAddress)) {
      toast({
        title: "Already exists",
        description: "This email address is already added",
        variant: "destructive",
      });
      return;
    }

    setSavingEmail(true);
    try {
      const data = await domainAPI.addEmail(selectedEmailDomain.id, emailAddress);

      toast({
        title: "Success",
        description: `Added ${emailAddress}`,
      });

      setCustomEmailPrefix("");
      fetchDomains();
      
      // Update local state
      setSelectedEmailDomain({
        ...selectedEmailDomain,
        emails: data.data?.emails || [...currentEmails, emailAddress],
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add email address",
        variant: "destructive",
      });
    } finally {
      setSavingEmail(false);
    }
  };

  const handleRemoveEmailAddress = async (emailAddress: string) => {
    if (!selectedEmailDomain || !user) return;

    try {
      const data = await domainAPI.removeEmail(selectedEmailDomain.id, emailAddress);

      toast({
        title: "Success",
        description: `Removed ${emailAddress}`,
      });

      fetchDomains();
      
      // Update local state
      setSelectedEmailDomain({
        ...selectedEmailDomain,
        emails: data.data?.emails || (selectedEmailDomain.emails || []).filter(e => e !== emailAddress),
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove email address",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view domains.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Domains</h1>
          <p className="text-gray-600 mt-2">
            Manage and verify your sending domains
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Domain</DialogTitle>
              <DialogDescription>
                Enter your domain name to add it for verification
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddDomain} disabled={addingDomain}>
                {addingDomain ? "Adding..." : "Add Domain"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {domains.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No domains yet</h3>
            <p className="text-gray-600 text-center mb-6">
              Add your first domain to start sending emails
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Domain
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id || domain.domain || Math.random()}>
                  <TableCell className="font-medium">{domain.domain}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {domain.status === "verified" ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Verified</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-yellow-600">Pending</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(domain.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewEmails(domain)}
                        title="Manage email addresses"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDomain(domain)}
                        title="View DNS records"
                      >
                        <Globe className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerifyDomain(domain)}
                        title="Verify domain"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      {domain.status === 'verified' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetVerification(domain)}
                          title="Reset verification status"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDomain(domain)}
                        disabled={!domain.id || domain.id === 'undefined'}
                        title="Delete domain"
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

      {/* DNS Records Dialog */}
      <Dialog
        open={!!selectedDomain}
        onOpenChange={() => {
          setSelectedDomain(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Setup DNS Records for {selectedDomain?.domain}</DialogTitle>
            <DialogDescription>
              Add DNS records manually to verify your domain
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
            {/* SPF Record */}
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-base">SPF Record</h4>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">TXT</span>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600 font-medium">Host/Name:</Label>
                  <div className="bg-gray-50 p-3 rounded mt-1 text-sm font-mono border">
                    @
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600 font-medium">Value:</Label>
                  <div className="bg-gray-50 p-3 rounded mt-1 text-sm font-mono border break-all">
                    v=spf1 include:amazonses.com ~all
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    copyToClipboard("v=spf1 include:amazonses.com ~all")
                  }
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Value
                </Button>
              </div>
            </div>

            {/* DKIM Records */}
            {selectedDomain?.dkimTokens.map((token, index) => (
              <div key={`${selectedDomain.id}-${index}`} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-base">
                    DKIM Record {index + 1}
                  </h4>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">CNAME</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600 font-medium">Host/Name:</Label>
                    <div className="bg-gray-50 p-3 rounded mt-1 text-sm font-mono border break-all">
                      {token}._domainkey
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-1 text-xs"
                      onClick={() =>
                        copyToClipboard(`${token}._domainkey`)
                      }
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 font-medium">Value/Points to:</Label>
                    <div className="bg-gray-50 p-3 rounded mt-1 text-sm font-mono border break-all">
                      {token}.dkim.amazonses.com
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-1 text-xs"
                      onClick={() =>
                        copyToClipboard(`${token}.dkim.amazonses.com`)
                      }
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* DMARC Record - IMPORTANT! */}
            <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-base text-orange-900">DMARC Record</h4>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-semibold">REQUIRED!</span>
                </div>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">TXT</span>
              </div>
              <div className="space-y-3">
                <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 mb-3">
                  <p className="text-xs text-orange-900 font-semibold">
                    ⚠️ Missing DMARC is a common reason emails go to spam!
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-700 font-medium">Host/Name:</Label>
                  <div className="bg-white p-3 rounded mt-1 text-sm font-mono border-2 border-orange-300">
                    _dmarc
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-1 text-xs"
                    onClick={() => copyToClipboard("_dmarc")}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div>
                  <Label className="text-xs text-gray-700 font-medium">Value:</Label>
                  <div className="bg-white p-3 rounded mt-1 text-sm font-mono border-2 border-orange-300 break-all">
                    v=DMARC1; p=quarantine; rua=mailto:dmarc@{selectedDomain?.domain}; pct=100; adkim=s; aspf=s
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-1 text-xs"
                    onClick={() =>
                      copyToClipboard(`v=DMARC1; p=quarantine; rua=mailto:dmarc@${selectedDomain?.domain}; pct=100; adkim=s; aspf=s`)
                    }
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-sm mb-2 text-blue-900">📋 Setup Instructions</h5>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Log in to your domain provider (GoDaddy, Namecheap, etc.)</li>
                <li>Navigate to DNS Settings or DNS Management</li>
                <li><strong>Add ALL 4 record types above</strong> (SPF, DKIM x3, DMARC)</li>
                <li>Wait 24-48 hours for DNS propagation</li>
                <li>Click "Verify Domain" button to check status</li>
              </ul>
            </div>

            {/* Deliverability Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="font-semibold text-sm mb-2 text-red-900">🚨 Avoid Spam Folder</h5>
              <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                <li><strong>Don't use "noreply@"</strong> - Use "hello@" or "team@" instead</li>
                <li>Start with small volumes (50-100 emails/day) for new domains</li>
                <li>Gradually increase over 2-4 weeks (domain warmup)</li>
                <li>Test emails at <a href="https://www.mail-tester.com/" target="_blank" className="underline font-semibold">mail-tester.com</a></li>
                <li>
                  <a href="/docs/EMAIL_DELIVERABILITY_GUIDE.md" target="_blank" className="underline font-semibold text-red-900">
                    📖 Read full deliverability guide
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="border-t pt-4 mt-4">
            <Button variant="outline" onClick={() => {
              setSelectedDomain(null);
            }}>
              Close
            </Button>
            <Button onClick={() => selectedDomain && handleVerifyDomain(selectedDomain)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verify Domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Addresses Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={() => {
        setEmailDialogOpen(false);
        setSelectedEmailDomain(null);
        setCustomEmailPrefix("");
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Email Addresses for {selectedEmailDomain?.domain}</DialogTitle>
            <DialogDescription>
              Manage email addresses you can use to send campaigns from this domain
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto flex-1 pr-2">
            {/* Current Email Addresses */}
            {selectedEmailDomain?.emails && selectedEmailDomain.emails.length > 0 && (
              <div>
                <Label className="text-sm font-semibold mb-3 block">Your Email Addresses:</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {selectedEmailDomain.emails.map((email) => (
                    <div key={email} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Mail className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="font-mono text-sm truncate">{email}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(email)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveEmailAddress(email)}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Email Addresses */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Quick Add - Suggested:</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                {suggestedEmailPrefixes.map((prefix) => {
                  const emailAddress = `${prefix}@${selectedEmailDomain?.domain}`;
                  const isAdded = selectedEmailDomain?.emails?.includes(emailAddress);
                  
                  return (
                    <Button
                      key={prefix}
                      size="sm"
                      variant={isAdded ? "secondary" : "outline"}
                      className="justify-start text-left"
                      onClick={() => !isAdded && handleAddEmailAddress(prefix)}
                      disabled={isAdded || savingEmail}
                    >
                      {isAdded ? (
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                      )}
                      <span className="truncate">{emailAddress}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Custom Email Address */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Add Custom Email:</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="custom"
                  value={customEmailPrefix}
                  onChange={(e) => setCustomEmailPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9-_.]/g, ''))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && customEmailPrefix) {
                      handleAddEmailAddress(customEmailPrefix);
                    }
                  }}
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">@{selectedEmailDomain?.domain}</span>
                <Button
                  onClick={() => handleAddEmailAddress(customEmailPrefix)}
                  disabled={!customEmailPrefix || savingEmail}
                >
                  {savingEmail ? "Adding..." : "Add"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Use lowercase letters, numbers, hyphens, underscores, and dots only
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-sm mb-2 text-blue-900">💡 Best Practices</h5>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Only add email addresses for verified domains</li>
                <li>Use these emails when creating campaigns</li>
                <li><strong className="text-red-700">Avoid "noreply@"</strong> - Often flagged as spam</li>
                <li>✅ Better: hello@, team@, marketing@, support@</li>
                <li>AWS SES must verify the domain (not individual email addresses)</li>
              </ul>
            </div>

            {/* Deliverability Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="font-semibold text-sm mb-2 text-red-900">⚠️ Email Deliverability Tips</h5>
              <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                <li><strong>Avoid noreply@</strong> - Use real sender addresses instead</li>
                <li>Warmup new domains gradually (50-100 emails/day initially)</li>
                <li>Ensure DNS records are complete (SPF, DKIM, DMARC)</li>
                <li>
                  <a href="/docs/EMAIL_DELIVERABILITY_GUIDE.md" target="_blank" className="underline font-semibold">
                    📖 Read full deliverability guide
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => {
              setEmailDialogOpen(false);
              setSelectedEmailDomain(null);
              setCustomEmailPrefix("");
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Domain</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{domainToDelete?.domain}</strong>? 
              This action cannot be undone and will remove all associated email addresses.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteDomain}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Verification Confirmation Dialog */}
      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Verification Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset the verification status for <strong>{domainToReset?.domain}</strong>? 
              This will change the domain status back to "Pending" and you'll need to verify it again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={confirmResetVerification}
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
            >
              <X className="h-4 w-4 mr-2" />
              Reset Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}