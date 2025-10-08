"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";

export default function TestTrackingPage() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testTracking = async () => {
    if (!user) return;

    setTesting(true);
    setResults(null);

    const testResults = {
      envCheck: false,
      pixelLoad: false,
      apiAccess: false,
      firebaseWrite: false,
      issues: [] as string[],
    };

    try {
      // 1. Check environment variables
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      console.log("App URL:", appUrl);
      
      if (!appUrl || appUrl === "" || appUrl === "http://localhost:3000") {
        testResults.issues.push("NEXT_PUBLIC_APP_URL not set or using localhost (tracking won't work in production)");
      } else {
        testResults.envCheck = true;
      }

      // 2. Test pixel loading (create a test tracking URL)
      const testCampaignId = "test-campaign-123";
      const testEmail = user.email || "test@example.com";
      const pixelUrl = `${window.location.origin}/api/track/open/${testCampaignId}?email=${encodeURIComponent(testEmail)}`;
      
      console.log("Testing pixel URL:", pixelUrl);

      try {
        const pixelResponse = await fetch(pixelUrl, {
          method: "GET",
          mode: "no-cors", // Simulate how tracking pixel works
        });
        testResults.pixelLoad = true;
      } catch (error) {
        testResults.issues.push(`Pixel URL not accessible: ${error}`);
      }

      // 3. Test API access
      try {
        const apiResponse = await fetch(`/api/campaigns/recipients?userId=${user.uid}&campaignId=test`, {
          method: "GET",
        });
        testResults.apiAccess = apiResponse.status !== 500;
        if (!testResults.apiAccess) {
          testResults.issues.push("API endpoints returning errors");
        }
      } catch (error) {
        testResults.issues.push(`API not accessible: ${error}`);
      }

      // 4. Check Firebase connection
      try {
        const testResponse = await fetch("/api/campaigns/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid }),
        });
        
        if (testResponse.ok) {
          testResults.firebaseWrite = true;
        } else {
          testResults.issues.push("Firebase connection issue");
        }
      } catch (error) {
        testResults.issues.push(`Firebase not accessible: ${error}`);
      }

      setResults(testResults);
    } catch (error: any) {
      testResults.issues.push(`General error: ${error.message}`);
      setResults(testResults);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Tracking Test</h1>
        <p className="text-gray-600 mt-2">
          Test your email tracking setup to diagnose any issues
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tracking System Diagnostics</CardTitle>
          <CardDescription>
            Run tests to verify your tracking pixel and API configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testTracking} disabled={testing}>
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Run Diagnostic Tests"
            )}
          </Button>

          {results && (
            <div className="mt-6 space-y-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Environment Variables</span>
                  {getStatusIcon(results.envCheck)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Tracking Pixel Load</span>
                  {getStatusIcon(results.pixelLoad)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">API Access</span>
                  {getStatusIcon(results.apiAccess)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Firebase Connection</span>
                  {getStatusIcon(results.firebaseWrite)}
                </div>
              </div>

              {results.issues.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-900">Issues Found:</h3>
                      <ul className="mt-2 space-y-1">
                        {results.issues.map((issue: string, idx: number) => (
                          <li key={idx} className="text-sm text-yellow-800">
                            • {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {results.issues.length === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">
                      All tests passed! Tracking system is configured correctly.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Common Tracking Issues:</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>
                <strong>Gmail blocks images:</strong> Recipients must click "Display images" to load tracking pixels
              </li>
              <li>
                <strong>NEXT_PUBLIC_APP_URL:</strong> Must be set to your production URL (not localhost)
              </li>
              <li>
                <strong>Firestore indexes:</strong> Run `firebase deploy --only firestore:indexes`
              </li>
              <li>
                <strong>emailRecords not created:</strong> Only new campaigns after the tracking fix will work
              </li>
            </ul>
          </div>

          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">How to Test Tracking Manually:</h3>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Send a test campaign to yourself</li>
              <li>Check the email in Gmail</li>
              <li>Click "Display images below" (if shown)</li>
              <li>Wait 10 seconds</li>
              <li>Refresh the Recipients dialog in the dashboard</li>
              <li>Check server logs for: "📧 Tracking pixel hit"</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

