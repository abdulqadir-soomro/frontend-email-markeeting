"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, CheckCircle, XCircle, AlertCircle, ExternalLink, Shield, Key, Trash2 } from "lucide-react";
import { gmailAPI } from "@/lib/api-client";

export default function GmailVerificationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [gmailPassword, setGmailPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      checkGmailConnection();
    }
  }, [user]);

  const checkGmailConnection = async () => {
    try {
      const data = await gmailAPI.getStatus();
      
      if (data.data?.connected) {
        setGmailConnected(true);
        setGmailEmail(data.data.email);
      }
    } catch (error) {
      console.error("Error checking Gmail connection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGmail = async () => {
    if (!gmailEmail || !gmailPassword) {
      toast({
        title: "Error",
        description: "Please enter both email and app password",
        variant: "destructive",
      });
      return;
    }

    // Validate Gmail address
    if (!gmailEmail.toLowerCase().endsWith('@gmail.com')) {
      toast({
        title: "Error",
        description: "Only Gmail addresses are supported",
        variant: "destructive",
      });
      return;
    }

    setConnecting(true);

    try {
      const data = await gmailAPI.connect(gmailEmail, gmailPassword);
      
      if (data.success) {
        setGmailConnected(true);
        setGmailEmail(gmailEmail);
        setGmailPassword("");
        toast({
          title: "Success",
          description: "Gmail connected successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to connect Gmail",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      const data = await gmailAPI.disconnect();

      if (data.success) {
        setGmailConnected(false);
        setGmailEmail("");
        toast({
          title: "Success",
          description: "Gmail account disconnected",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDisconnectClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDisconnect = async () => {
    await handleDisconnectGmail();
    setDeleteDialogOpen(false);
  };

  const handleCancelDisconnect = () => {
    setDeleteDialogOpen(false);
  };

  const handleTestGmail = async () => {
    setTesting(true);
    try {
      const data = await gmailAPI.test();
      
      if (data.success) {
        toast({
          title: "Test Successful",
          description: "Gmail connection is working properly",
        });
      }
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message || "Gmail test failed",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gmail Verification</h1>
        <p className="text-gray-600">Connect and verify your Gmail account for email sending</p>
      </div>

      {/* Gmail Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gmail Connection Status
          </CardTitle>
          <CardDescription>
            Current status of your Gmail integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gmailConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Gmail Connected</p>
                  <p className="text-sm text-green-700">{gmailEmail}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleTestGmail}
                  disabled={testing}
                >
                  {testing ? "Testing..." : "Test Connection"}
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Connection Details:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your Gmail account is verified and ready</li>
                  <li>• You can send up to 500 emails per day</li>
                  <li>• Emails will be sent from: {gmailEmail}</li>
                  <li>• Select "Gmail" when creating campaigns</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleDisconnectClick}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Disconnect Gmail
                </Button>
                <Button variant="outline" onClick={handleTestGmail} disabled={testing}>
                  {testing ? "Testing..." : "Test Connection"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <XCircle className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Gmail Not Connected</p>
                  <p className="text-sm text-gray-600">Connect your Gmail to send emails</p>
                </div>
              </div>

            </div>
          )}
        </CardContent>
      </Card>

      {/* Gmail Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Setup Instructions
          </CardTitle>
          <CardDescription>
            Follow these steps to connect your Gmail account securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Prerequisites
              </h4>
              <ul className="text-sm text-yellow-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Enable 2-Factor Authentication on your Google Account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Generate an App Password in Google Account settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Use your Gmail address and 16-character App Password</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Key className="h-4 w-4" />
                How to Generate App Password
              </h4>
              <ol className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Go to your Google Account settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Navigate to Security → 2-Step Verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Scroll down to "App passwords"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Select "Mail" and generate a password</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">5.</span>
                  <span>Copy the 16-character password (no spaces)</span>
                </li>
              </ol>
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('https://myaccount.google.com/apppasswords', '_blank')}
                >
                  <ExternalLink className="mr-2 h-3 w-3" />
                  Open Google Account Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gmail Connection Form */}
      {!gmailConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Connect Gmail Account</CardTitle>
            <CardDescription>
              Enter your Gmail credentials to connect your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gmailEmail">Gmail Address</Label>
              <Input
                id="gmailEmail"
                type="email"
                placeholder="you@gmail.com"
                value={gmailEmail}
                onChange={(e) => setGmailEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gmailPassword">App Password</Label>
              <Input
                id="gmailPassword"
                type="password"
                placeholder="16-character app password"
                value={gmailPassword}
                onChange={(e) => {
                  // Remove spaces from the input
                  const cleanPassword = e.target.value.replace(/\s/g, '');
                  setGmailPassword(cleanPassword);
                }}
                onPaste={(e) => {
                  // Handle paste event to remove spaces
                  e.preventDefault();
                  const pastedText = e.clipboardData.getData('text');
                  const cleanPassword = pastedText.replace(/\s/g, '');
                  setGmailPassword(cleanPassword);
                }}
              />
              <p className="text-xs text-gray-500">
                Generate an app password in your Google Account settings. Spaces will be automatically removed.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setGmailEmail("");
                setGmailPassword("");
              }}>
                Clear
              </Button>
              <Button onClick={handleConnectGmail} disabled={connecting}>
                {connecting ? "Connecting..." : "Connect Gmail"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gmail Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gmail Integration Benefits
          </CardTitle>
          <CardDescription>
            Why use Gmail for your email campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">Advantages</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Quick setup with App Password</li>
                <li>• No domain verification required</li>
                <li>• Reliable delivery rates</li>
                <li>• Perfect for personal use</li>
                <li>• Up to 500 emails per day</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-700">Use Cases</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Small business campaigns</li>
                <li>• Personal newsletters</li>
                <li>• Testing and development</li>
                <li>• Quick email sends</li>
                <li>• Backup sending method</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simple Disconnect Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Disconnect Gmail
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect your Gmail account? You won't be able to send emails from Gmail until you reconnect.
            </DialogDescription>
          </DialogHeader>

          {gmailEmail && (
            <div className="py-4">
              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-medium text-sm text-gray-900 mb-2">Gmail Account:</h4>
                <p className="text-sm text-gray-600 break-all">{gmailEmail}</p>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Warning:</p>
                <p>You won't be able to send emails via Gmail after disconnecting.</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleCancelDisconnect}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDisconnect}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
