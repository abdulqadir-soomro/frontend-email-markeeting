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
import { Skeleton } from "@/components/ui/skeleton";
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
  const [manualVerifyOpen, setManualVerifyOpen] = useState(false);
  const [selectedDomainForManualVerify, setSelectedDomainForManualVerify] = useState<Domain | null>(null);
  const [manualVerifying, setManualVerifying] = useState(false);
  const [addDomainMethod, setAddDomainMethod] = useState<string>('automatic');
  const [dnsRecords, setDnsRecords] = useState<any>(null);
  const [loadingDnsRecords, setLoadingDnsRecords] = useState(false);
  const [autoVerifyDialogOpen, setAutoVerifyDialogOpen] = useState(false);
  const [selectedDomainForAutoVerify, setSelectedDomainForAutoVerify] = useState<Domain | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('manual');
  const [providerCredentials, setProviderCredentials] = useState({ apiKey: '', apiSecret: '', username: '', password: '' });
  const [autoVerifying, setAutoVerifying] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, [user]);

  const fetchDomains = async () => {
    if (!user || !isAuthenticated) return;

    try {
      const data = await domainAPI.list();
      setDomains(data.data || []);
      return data.data || [];
    } catch (error) {
      console.error("Error fetching domains:", error);
      toast({
        title: "Error",
        description: "Failed to fetch domains. Please try again.",
        variant: "destructive",
      });
      return [];
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
      const errorMessage = error.response?.data?.error || error.message || "Failed to add domain";
      const isBlacklisted = error.response?.status === 403;
      
      toast({
        title: isBlacklisted ? "Domain Not Allowed" : "Error",
        description: errorMessage,
        variant: "destructive",
        duration: isBlacklisted ? 8000 : 5000,
      });
    } finally {
      setAddingDomain(false);
    }
  };

  const handleOpenAutoVerify = async (domain: Domain) => {
    setSelectedDomainForAutoVerify(domain);
    setAutoVerifyDialogOpen(true);
    setLoadingDnsRecords(true);

    try {
      const data = await domainAPI.getDNSRecords(domain.id);
      console.log('DNS Records API response:', data);
      // Extract the dnsRecords array from the response
      const recordsArray = data.data?.dnsRecords || data.data || [];
      setDnsRecords(recordsArray);
    } catch (error) {
      console.error("Error fetching DNS records:", error);
      toast({
        title: "Warning",
        description: "Could not load DNS records.",
        variant: "destructive",
      });
    } finally {
      setLoadingDnsRecords(false);
    }
  };

  const handleAutoVerify = async () => {
    if (!selectedDomainForAutoVerify) return;

    setAutoVerifying(true);

    try {
      if (selectedProvider === 'manual') {
        // Traditional verification - just check if DNS exists
        const data = await domainAPI.verify(selectedDomainForAutoVerify.id);
        
        if (data.data?.status === "verified") {
          toast({
            title: "✅ Domain Verified!",
            description: "All DNS records are configured correctly. Your domain is ready to use!",
          });
        } else {
          toast({
            title: "⏳ Verification Pending",
            description: "DNS records not found yet. Please add them manually or use a DNS provider integration.",
            variant: "destructive",
          });
        }
      } else {
        // Provider integration - automatically add DNS records
        console.log('DNS Records state:', dnsRecords);
        
        if (!dnsRecords || !Array.isArray(dnsRecords) || dnsRecords.length === 0) {
          toast({
            title: "❌ Error",
            description: "DNS records not loaded. Please close this dialog and click the 🌐 Globe icon first to load DNS records.",
            variant: "destructive",
          });
          setAutoVerifying(false);
          return;
        }
        
        toast({
          title: "🚀 Auto-Adding DNS Records",
          description: `Connecting to ${selectedProvider} to add DNS records automatically...`,
        });

        // Here you would call the provider-specific API
        const result = await addDNSViaProvider(
          selectedDomainForAutoVerify,
          selectedProvider,
          providerCredentials,
          dnsRecords
        );

        if (result.success) {
          toast({
            title: "✅ DNS Records Added!",
            description: `Successfully added DNS records to ${selectedProvider}. Verifying now...`,
          });

          // Wait a bit then verify
          setTimeout(async () => {
            const data = await domainAPI.verify(selectedDomainForAutoVerify.id);
            if (data.data?.status === "verified") {
              toast({
                title: "✅ Domain Verified!",
                description: "DNS records added and domain is now verified!",
              });
            } else {
              toast({
                title: "⏳ Verify in Progress",
                description: "DNS records added. Verification may take a few minutes.",
              });
            }
          }, 2000);
        } else {
          // Show error toast if Hostinger API failed
          toast({
            title: "⚠️ Hostinger API Unavailable",
            description: result.error || "Please use the Manual DNS configuration method instead.",
            variant: "destructive",
          });
          return; // Exit without throwing error
        }
      }

      await fetchDomains();
      
      // Keep dialog open for a moment to show success message
      setTimeout(() => {
        setAutoVerifyDialogOpen(false);
        setSelectedDomainForAutoVerify(null);
        setDnsRecords(null);
      }, 1500);
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to add DNS records",
        variant: "destructive",
      });
      
      // Refresh domains list to ensure domain is still there
      await fetchDomains();
    } finally {
      setAutoVerifying(false);
    }
  };

  // Real Hostinger DNS Integration via Backend
  const addDNSViaProvider = async (
    domain: Domain, 
    provider: string, 
    credentials: any,
    records?: any
  ): Promise<{ success: boolean; message: string; error?: string }> => {
    try {
      if (provider !== 'hostinger') {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      if (!credentials.apiKey) {
        throw new Error('API token is required for Hostinger');
      }

      if (!records || !Array.isArray(records)) {
        throw new Error('DNS records not loaded. Please wait for records to load or use manual DNS configuration.');
      }

      console.log(`Calling backend to add ${records.length} DNS records to Hostinger for ${domain.domain}...`);

      // Call backend API instead of directly calling Hostinger (avoids CORS)
      const result = await domainAPI.addDNSViaHostinger(domain.id, {
        apiToken: credentials.apiKey,
        dnsRecords: records,
      });

      return result;
    } catch (error: any) {
      console.error('Hostinger DNS API error:', error);
      
      // Show helpful message if Hostinger API is unavailable
      if (error.message?.includes('Hostinger API endpoint error') || 
          error.message?.includes('Cloudflare')) {
        return {
          success: false,
          message: 'Hostinger API is currently unavailable',
          error: 'Please use the Manual DNS configuration (📄 Manual button) to add your DNS records directly in Hostinger HPanel.',
        };
      }
      
      return {
        success: false,
        message: '❌ Failed to add DNS records to Hostinger',
        error: error.message || 'Unknown error occurred',
      };
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

  const handleOpenManualVerify = async (domain: Domain) => {
    setSelectedDomainForManualVerify(domain);
    setManualVerifyOpen(true);
    setLoadingDnsRecords(true);

    try {
      const data = await domainAPI.getDNSRecords(domain.id);
      setDnsRecords(data.data);
    } catch (error) {
      console.error("Error fetching DNS records:", error);
      toast({
        title: "Warning",
        description: "Could not load DNS records. You can still proceed with manual verification.",
        variant: "destructive",
      });
    } finally {
      setLoadingDnsRecords(false);
    }
  };

  const handleManualVerify = async () => {
    if (!selectedDomainForManualVerify || !user) return;

    setManualVerifying(true);

    try {
      const data = await domainAPI.verifyManual(selectedDomainForManualVerify.id, {
        verificationMethod: 'aws-ses', // Check AWS SES verification status
        dnsRecords: [],
      });

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Domain verified successfully in AWS SES",
        });
        
        await fetchDomains();
        
        // Keep dialog open for a moment to show success message
        setTimeout(() => {
          setManualVerifyOpen(false);
          setSelectedDomainForManualVerify(null);
          setDnsRecords(null);
        }, 1500);
      } else {
        // Show detailed error message
        const errorMessage = data.error || data.message || "Domain verification failed";
        const details = data.details;
        
        let fullMessage = errorMessage;
        if (details?.verificationStatus) {
          fullMessage += `\nAWS SES Status: ${details.verificationStatus}`;
        }
        if (details?.dkimStatus) {
          fullMessage += `\nDKIM Status: ${details.dkimStatus}`;
        }
        
        toast({
          title: "Verification Failed",
          description: fullMessage,
          variant: "destructive",
          duration: 6000, // Show longer for detailed errors
        });
        await fetchDomains();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to verify domain";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 6000,
      });
      await fetchDomains();
    } finally {
      setManualVerifying(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2 mt-4">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-28" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddDomain();
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addMethod">Configuration Method</Label>
                <select
                  id="addMethod"
                  value={addDomainMethod}
                  onChange={(e) => setAddDomainMethod(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="automatic">Automatic (AWS SES)</option>
                  <option value="manual">Manual (DNS Provider)</option>
                </select>
              </div>

              {addDomainMethod === 'automatic' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Automatic Configuration:</strong> Your domain will be added to AWS SES automatically. 
                    You'll need to add DNS records after domain is added.
                  </p>
                </div>
              )}

              {addDomainMethod === 'manual' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Manual Configuration:</strong> Add your domain with manual DNS setup. 
                    You'll configure DNS records through your DNS provider.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setNewDomain("");
                  setAddDomainMethod('automatic');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddDomain} disabled={addingDomain || !newDomain}>
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
                    <div className="flex items-center gap-1 flex-wrap">
                      {/* Email & DNS Management */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewEmails(domain)}
                        title="Manage email addresses"
                        className="h-8"
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDomain(domain)}
                        title="View DNS records"
                        className="h-8"
                      >
                        <Globe className="h-3 w-3" />
                      </Button>
                      
                      {/* Verification Buttons */}
                      <div className="flex items-center gap-1 border-l pl-1">
                      <Button
                        size="sm"
                        variant={domain.status === 'verified' ? 'secondary' : 'default'}
                        onClick={() => handleOpenAutoVerify(domain)}
                        title="Automatic Verification - Select DNS provider to auto-add records"
                        disabled={domain.status === 'verified'}
                        className={`h-8 text-xs ${domain.status === 'verified' ? 'opacity-50' : ''}`}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Auto
                      </Button>
                        <Button
                          size="sm"
                          variant={domain.status === 'verified' ? 'secondary' : 'default'}
                          onClick={() => handleOpenManualVerify(domain)}
                          title="Manual Verification via DNS Provider"
                          disabled={domain.status === 'verified'}
                          className={`h-8 text-xs ${domain.status === 'verified' ? 'opacity-50' : ''}`}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Manual
                        </Button>
                      </div>

                      {/* Additional Actions */}
                      <div className="flex items-center gap-1 border-l pl-1">
                        {domain.status === 'verified' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetVerification(domain)}
                            title="Reset verification status"
                            className="h-8 text-orange-600 hover:text-orange-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDomain(domain)}
                          disabled={!domain.id || domain.id === 'undefined'}
                          title="Delete domain"
                          className="h-8"
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
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
                  <p className="text-xs text-orange-900 font-semibold mb-2">
                    ⚠️ Missing DMARC is a common reason emails go to spam!
                  </p>
                  <p className="text-xs text-orange-800">
                    💡 Start with <code className="bg-orange-200 px-1 rounded">p=none</code> for monitoring (2-4 weeks), then move to <code className="bg-orange-200 px-1 rounded">p=quarantine</code> after reviewing reports.
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
                    v=DMARC1; p=none; rua=mailto:dmarc@{selectedDomain?.domain}; ruf=mailto:dmarc@{selectedDomain?.domain}; pct=100; aspf=r; adkim=r
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-1 text-xs"
                    onClick={() =>
                      copyToClipboard(`v=DMARC1; p=none; rua=mailto:dmarc@${selectedDomain?.domain}; ruf=mailto:dmarc@${selectedDomain?.domain}; pct=100; aspf=r; adkim=r`)
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
            <Button onClick={() => selectedDomain && handleOpenAutoVerify(selectedDomain)}>
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

      {/* Manual Verification Dialog */}
      <Dialog open={manualVerifyOpen} onOpenChange={(open) => {
        setManualVerifyOpen(open);
        if (!open) {
          setSelectedDomainForManualVerify(null);
          setDnsRecords(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manual Domain Verification</DialogTitle>
            <DialogDescription>
              Add the DNS records below to your DNS provider, then click "Check AWS SES Verification" to verify <strong>{selectedDomainForManualVerify?.domain}</strong> is actually verified in AWS SES.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* DNS Records Display */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Required DNS Records
              </h4>
              
              {loadingDnsRecords ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : dnsRecords && dnsRecords.dkimTokens ? (
                <div className="space-y-3">
                  {/* SPF Record */}
                  <div className="border rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">REQUIRED</span>
                        <span className="text-xs font-semibold">SPF Record</span>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">TXT</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-600">Name/Host:</span>
                        <div className="bg-gray-50 p-2 rounded text-sm font-mono mt-1">@</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">Value:</span>
                        <div className="bg-gray-50 p-2 rounded text-sm font-mono mt-1 break-all">
                          v=spf1 include:amazonses.com ~all
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full mt-2"
                        onClick={() => copyToClipboard("v=spf1 include:amazonses.com ~all")}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Value
                      </Button>
                    </div>
                  </div>

                  {/* DKIM Records */}
                  {dnsRecords.dkimTokens.map((token: string, index: number) => (
                    <div key={index} className="border rounded-lg p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold">DKIM Record {index + 1} of {dnsRecords.dkimTokens.length}</span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">CNAME</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-gray-600">Name/Host:</span>
                          <div className="bg-gray-50 p-2 rounded text-sm font-mono mt-1 break-all">
                            {token}._domainkey
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-1 text-xs"
                            onClick={() => copyToClipboard(`${token}._domainkey`)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Value/Points To:</span>
                          <div className="bg-gray-50 p-2 rounded text-sm font-mono mt-1 break-all">
                            {token}.dkim.amazonses.com
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-1 text-xs"
                            onClick={() => copyToClipboard(`${token}.dkim.amazonses.com`)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* DMARC Record */}
                  <div className="border-2 border-orange-200 rounded-lg p-3 bg-orange-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-semibold">REQUIRED!</span>
                        <span className="text-xs font-semibold">DMARC Record</span>
                      </div>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">TXT</span>
                    </div>
                    <p className="text-xs text-orange-900 mb-2">
                      ⚠️ Missing DMARC is a common reason emails go to spam!
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-700">Name/Host:</span>
                        <div className="bg-white p-2 rounded text-sm font-mono mt-1">_dmarc</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-700">Value:</span>
                        <div className="bg-white p-2 rounded text-sm font-mono mt-1 break-all">
                          v=DMARC1; p=none; rua=mailto:dmarc@{selectedDomainForManualVerify?.domain}; ruf=mailto:dmarc@{selectedDomainForManualVerify?.domain}; pct=100; aspf=r; adkim=r
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => copyToClipboard(`v=DMARC1; p=none; rua=mailto:dmarc@${selectedDomainForManualVerify?.domain}; ruf=mailto:dmarc@${selectedDomainForManualVerify?.domain}; pct=100; aspf=r; adkim=r`)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Value
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center py-4">
                  Could not load DNS records. Please check the domain configuration.
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-sm mb-3 text-blue-900">📋 How to Add DNS Records</h5>
              <ol className="text-xs text-blue-800 space-y-2 list-decimal list-inside">
                <li>Log in to your DNS provider (GoDaddy, Namecheap, Cloudflare, etc.)</li>
                <li>Navigate to DNS Management or DNS Settings for your domain</li>
                <li>Add each DNS record shown above:
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>SPF Record: Type = TXT, Name = @, Value = (copy from above)</li>
                    <li>DKIM Records: Type = CNAME, Name = (copy from above), Value = (copy from above)</li>
                    <li>DMARC Record: Type = TXT, Name = _dmarc, Value = (copy from above)</li>
                  </ul>
                </li>
                <li>Save all changes and wait 24-48 hours for DNS propagation</li>
                <li>Click "Check AWS SES Verification" below to verify the domain is actually verified in AWS SES</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                <strong>⚠️ Important:</strong> Add all DNS records to your provider first, then click "Check AWS SES Verification" below. 
                This will check if AWS SES has actually verified your domain. DNS changes typically take 24-48 hours to propagate.
              </p>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => {
              setManualVerifyOpen(false);
              setSelectedDomainForManualVerify(null);
              setDnsRecords(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleManualVerify} disabled={manualVerifying}>
              {manualVerifying ? "Checking AWS SES..." : "Check AWS SES Verification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto Verify Dialog */}
      <Dialog open={autoVerifyDialogOpen} onOpenChange={(open) => {
        setAutoVerifyDialogOpen(open);
        if (!open) {
          setSelectedDomainForAutoVerify(null);
          setDnsRecords(null);
          setSelectedProvider('manual');
          setProviderCredentials({ apiKey: '', apiSecret: '', username: '', password: '' });
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>⚡ Automatic Domain Verification</DialogTitle>
            <DialogDescription>
              Select your DNS provider to automatically add DNS records for <strong>{selectedDomainForAutoVerify?.domain}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label htmlFor="provider">DNS Provider</Label>
              <select
                id="provider"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="manual">Manual Check (Verify Existing DNS)</option>
                <option value="cloudflare">Cloudflare</option>
                <option value="godaddy">GoDaddy</option>
                <option value="namecheap">Namecheap</option>
                <option value="hostinger">Hostinger</option>
                <option value="digitalocean">DigitalOcean</option>
                <option value="aws-route53">AWS Route53</option>
              </select>
            </div>

            {/* Provider Authentication */}
            {selectedProvider !== 'manual' && (
              <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                <h5 className="font-semibold text-sm">Provider Authentication</h5>
                
                {selectedProvider === 'cloudflare' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="cf-api-key" className="text-xs">API Token</Label>
                      <Input
                        id="cf-api-key"
                        type="password"
                        placeholder="Your Cloudflare API Token"
                        value={providerCredentials.apiKey}
                        onChange={(e) => setProviderCredentials({ ...providerCredentials, apiKey: e.target.value })}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Create token at: Cloudflare Dashboard → My Profile → API Tokens</p>
                    </div>
                  </div>
                )}

                {selectedProvider === 'godaddy' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="gd-api-key" className="text-xs">API Key</Label>
                      <Input
                        id="gd-api-key"
                        placeholder="Your GoDaddy API Key"
                        value={providerCredentials.apiKey}
                        onChange={(e) => setProviderCredentials({ ...providerCredentials, apiKey: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gd-api-secret" className="text-xs">API Secret</Label>
                      <Input
                        id="gd-api-secret"
                        type="password"
                        placeholder="Your GoDaddy API Secret"
                        value={providerCredentials.apiSecret}
                        onChange={(e) => setProviderCredentials({ ...providerCredentials, apiSecret: e.target.value })}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Get credentials from: GoDaddy Developer Settings</p>
                    </div>
                  </div>
                )}

                {selectedProvider === 'digitalocean' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="do-token" className="text-xs">DigitalOcean Token</Label>
                      <Input
                        id="do-token"
                        type="password"
                        placeholder="Your DigitalOcean API Token"
                        value={providerCredentials.apiKey}
                        onChange={(e) => setProviderCredentials({ ...providerCredentials, apiKey: e.target.value })}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Generate at: DigitalOcean → API → Tokens</p>
                    </div>
                  </div>
                )}

                {selectedProvider === 'aws-route53' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="aws-access-key" className="text-xs">Access Key ID</Label>
                      <Input
                        id="aws-access-key"
                        placeholder="AWS Access Key ID"
                        value={providerCredentials.apiKey}
                        onChange={(e) => setProviderCredentials({ ...providerCredentials, apiKey: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="aws-secret-key" className="text-xs">Secret Access Key</Label>
                      <Input
                        id="aws-secret-key"
                        type="password"
                        placeholder="AWS Secret Access Key"
                        value={providerCredentials.apiSecret}
                        onChange={(e) => setProviderCredentials({ ...providerCredentials, apiSecret: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {selectedProvider === 'namecheap' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="username" className="text-xs">Username</Label>
                      <Input
                        id="username"
                        placeholder="Your Namecheap username"
                        value={providerCredentials.username}
                        onChange={(e) => setProviderCredentials({ ...providerCredentials, username: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-xs">API Token</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Your Namecheap API token"
                        value={providerCredentials.password}
                        onChange={(e) => setProviderCredentials({ ...providerCredentials, password: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {selectedProvider === 'hostinger' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="hostinger-api-token" className="text-xs">API Token</Label>
                      <Input
                        id="hostinger-api-token"
                        type="password"
                        placeholder="Enter your API token"
                        value={providerCredentials.apiKey}
                        onChange={(e) => setProviderCredentials({ ...providerCredentials, apiKey: e.target.value })}
                        className="mt-1 font-mono text-xs"
                        autoComplete="off"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Get your API token from: 
                        <a 
                          href="https://hpanel.hostinger.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 underline ml-1"
                        >
                          Hostinger HPanel → API Settings
                        </a>
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="text-xs text-blue-800">
                        <strong>📝 How to get API Token:</strong>
                        <ol className="list-decimal list-inside mt-2 space-y-1 ml-2">
                          <li>Log in to your Hostinger HPanel</li>
                          <li>Go to "Account" → "API Settings"</li>
                          <li>Click "Generate API Token"</li>
                          <li>Copy the full token and paste it above</li>
                        </ol>
                        <p className="mt-2 text-orange-800">
                          <strong>⚠️ Important:</strong> Keep your API token secure. It gives full access to your domain DNS.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-xs text-blue-800">
                    <strong>🔒 Security:</strong> Your credentials are not stored. They're only used to add DNS records once.
                  </p>
                </div>
              </div>
            )}

            {/* DNS Records to Add */}
            {dnsRecords && dnsRecords.dkimTokens && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h5 className="font-semibold text-sm mb-3">📋 DNS Records to Add</h5>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-white rounded border">
                    <span>SPF Record (TXT)</span>
                    <span className="text-green-600">✓ Will add automatically</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded border">
                    <span>DKIM Records (CNAME x{dnsRecords.dkimTokens.length})</span>
                    <span className="text-green-600">✓ Will add automatically</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded border">
                    <span>DMARC Record (TXT)</span>
                    <span className="text-green-600">✓ Will add automatically</span>
                  </div>
                </div>
              </div>
            )}

            {/* How It Works */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-sm mb-2 text-blue-900">🚀 How It Works:</h5>
              <ol className="text-xs text-blue-800 space-y-2 list-decimal list-inside">
                {selectedProvider === 'manual' && (
                  <>
                    <li>System checks AWS SES to see if DNS records exist</li>
                    <li>If records exist → Domain verified ✅</li>
                    <li>If records missing → You need to add them manually</li>
                  </>
                )}
                {selectedProvider !== 'manual' && (
                  <>
                    <li>Connect to your DNS provider ({selectedProvider})</li>
                    <li>Automatically add all required DNS records</li>
                    <li>Wait for DNS propagation (2-5 minutes)</li>
                    <li>Verify domain status</li>
                    <li>Done! Your domain is verified ✅</li>
                  </>
                )}
              </ol>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => {
              setAutoVerifyDialogOpen(false);
              setSelectedDomainForAutoVerify(null);
              setDnsRecords(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAutoVerify} disabled={autoVerifying}>
              {autoVerifying ? "Processing..." : selectedProvider === 'manual' ? "Check DNS" : "Add DNS & Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}