"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Mail, CheckCircle, XCircle, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkGmailConnection();
    }
  }, [user]);

  const checkGmailConnection = async () => {
    try {
      const response = await fetch(`/api/gmail/status?userId=${user?.uid}`);
      const data = await response.json();
      
      if (data.connected) {
        setGmailConnected(true);
        setGmailEmail(data.email);
      }
    } catch (error) {
      console.error("Error checking Gmail connection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      const response = await fetch("/api/gmail/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid }),
      });

      const data = await response.json();

      if (data.authUrl) {
        // Open OAuth popup
        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        const popup = window.open(
          data.authUrl,
          "Gmail Authorization",
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Listen for OAuth callback
        const checkPopup = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopup);
            checkGmailConnection();
          }
        }, 500);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDisconnectGmail = async () => {
    if (!confirm("Disconnect your Gmail account? You won't be able to send emails from Gmail until you reconnect.")) {
      return;
    }

    try {
      const response = await fetch("/api/gmail/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid }),
      });

      const data = await response.json();

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
            Send emails directly from your personal Gmail account
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
                <h4 className="font-semibold text-yellow-900 mb-2">Benefits:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>✓ Send emails from your personal Gmail address</li>
                  <li>✓ Better deliverability with your reputation</li>
                  <li>✓ No AWS SES setup required</li>
                  <li>✓ Up to 500 emails per day (Gmail's limit)</li>
                  <li>✓ Replies go directly to your Gmail inbox</li>
                </ul>
              </div>

              <Button onClick={handleConnectGmail}>
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
                    <span className="font-medium">Easy OAuth</span>
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

