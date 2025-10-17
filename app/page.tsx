import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Globe, BarChart3, Zap, CheckCircle, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Mail className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">EmailPro</span>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Email Marketing Made{" "}
            <span className="text-blue-600">Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Build powerful email campaigns, manage subscribers, and track results
            with our easy-to-use platform powered by AWS SES.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features to grow your email marketing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Custom Domain Verification</CardTitle>
              <CardDescription>
                Use your own domain with SPF and DKIM authentication for better
                deliverability
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Campaign Management</CardTitle>
              <CardDescription>
                Create, design, and send beautiful email campaigns to your
                subscriber lists
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Real-time Analytics</CardTitle>
              <CardDescription>
                Track opens, clicks, and engagement with detailed reporting and
                insights
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 bg-orange-100 rounded-lg w-fit mb-4">
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle>Bulk Email Sending</CardTitle>
              <CardDescription>
                Send thousands of emails efficiently with AWS SES infrastructure
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 bg-red-100 rounded-lg w-fit mb-4">
                <CheckCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle>CSV Import</CardTitle>
              <CardDescription>
                Easily upload and manage your subscriber lists with CSV file
                imports
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 bg-indigo-100 rounded-lg w-fit mb-4">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <CardTitle>Secure & Reliable</CardTitle>
              <CardDescription>
                Built on AWS infrastructure for enterprise-grade
                security
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Verify Your Domain</h3>
              <p className="text-gray-600">
                Add your domain and configure DNS records for authentication
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Subscribers</h3>
              <p className="text-gray-600">
                Upload your contact list via CSV or add them manually
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Send & Track</h3>
              <p className="text-gray-600">
                Create campaigns and monitor performance in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses using EmailPro for their email marketing
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">EmailPro</span>
          </div>
          <p>© 2025 EmailPro. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Powered by Next.js and AWS SES
          </p>
        </div>
      </footer>
    </div>
  );
}

