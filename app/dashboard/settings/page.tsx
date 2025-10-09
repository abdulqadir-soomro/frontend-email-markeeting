"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Mail, CheckCircle, XCircle, Settings as SettingsIcon } from "lucide-react";
import { gmailAPI } from "@/lib/api-client";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [gmailPassword, setGmailPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [showConnectForm, setShowConnectForm] = useState(false);

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
        setShowConnectForm(false);
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
    if (!confirm("Disconnect your Gmail account? You won't be able to send emails from Gmail until you reconnect.")) {
      return;
    }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your account and email sending preferences</p>
      </div>

      {/* Gmail Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gmail Integration
          </CardTitle>
          <CardDescription>
            Send emails directly from your personal Gmail account using App Passwords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gmailConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Gmail Connected</p>
                  <p className="text-sm text-green-700">{gmailEmail}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your Gmail account is now connected</li>
                  <li>• You can send up to 500 emails per day with Gmail</li>
                  <li>• Emails will be sent from: {gmailEmail}</li>
                  <li>• Select "Gmail" when creating campaigns</li>
                </ul>
              </div>

              <Button variant="destructive" onClick={handleDisconnectGmail}>
                Disconnect Gmail
              </Button>
            </div>
          ) : showConnectForm ? (
            <div className="space-y-4">
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
                  onChange={(e) => setGmailPassword(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Generate an app password in your Google Account settings
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowConnectForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConnectGmail} disabled={connecting}>
                  {connecting ? "Connecting..." : "Connect Gmail"}
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

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">How to set up:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>1. Enable 2-Factor Authentication on your Google Account</li>
                  <li>2. Generate an App Password in Google Account settings</li>
                  <li>3. Enter your Gmail address and 16-character App Password</li>
                </ul>
              </div>

              <Button onClick={() => setShowConnectForm(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Connect Gmail Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Sending Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Email Sending Methods
          </CardTitle>
          <CardDescription>
            Choose how you want to send your campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gmail Option */}
              <div className={`border rounded-lg p-4 ${gmailConnected ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Gmail
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Use your personal Gmail account
                </p>
                <div className="space-y-1 text-xs">
                  <p className="flex justify-between">
                    <span>Daily Limit:</span>
                    <span className="font-medium">500 emails</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Setup:</span>
                    <span className="font-medium">App Password</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${gmailConnected ? 'text-green-600' : 'text-gray-500'}`}>
                      {gmailConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </p>
                </div>
              </div>

              {/* AWS SES Option */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  AWS SES
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Use verified domains with AWS
                </p>
                <div className="space-y-1 text-xs">
                  <p className="flex justify-between">
                    <span>Daily Limit:</span>
                    <span className="font-medium">50,000+</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Setup:</span>
                    <span className="font-medium">Domain verification</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium text-gray-500">Configure in Domains</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p>💡 <strong>Pro Tip:</strong> Use Gmail for smaller campaigns (under 500 recipients) and AWS SES for larger campaigns. You can use both!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}