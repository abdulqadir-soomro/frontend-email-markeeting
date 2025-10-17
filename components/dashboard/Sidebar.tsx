"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Globe,
  Mail,
  Users,
  BarChart3,
  FileText,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

import { Settings } from "lucide-react";
import { Shield } from "lucide-react";
import { Activity } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Domains", href: "/dashboard/domains", icon: Globe },
  { name: "Campaigns", href: "/dashboard/campaigns", icon: Mail },
  { name: "Templates", href: "/dashboard/templates", icon: FileText },
  { name: "Subscribers", href: "/dashboard/subscribers", icon: Users },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const developerNavigation = [
  { name: "Test Tracking", href: "/dashboard/test-tracking", icon: Activity },
];

const adminNavigation = [
  { name: "Admin Panel", href: "/dashboard/admin", icon: Shield },
];

// Define admin emails (should match admin page)
const ADMIN_EMAILS = [
  'admin@gmail.com',
  'abdulqadir53970@gmail.com',
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;

  return (
    <div className="flex h-full w-64 flex-col fixed inset-y-0 z-50 bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <Mail className="h-8 w-8 text-blue-500" />
        <span className="ml-2 text-xl font-bold">EmailPro</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
        
        {/* Developer Tools */}
        <div className="border-t border-gray-700 my-2"></div>
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Developer
        </div>
        {developerNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-purple-600 text-white"
                  : "text-purple-300 hover:bg-purple-700 hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
        
        {/* Admin Navigation (only for admins) */}
        {isAdmin && (
          <>
            <div className="border-t border-gray-700 my-2"></div>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-red-300 hover:bg-red-700 hover:text-white"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center mb-3">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-sm font-medium">
              {user?.email?.[0].toUpperCase()}
            </span>
          </div>
          <div className="ml-3 flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-xs text-gray-400">Account</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

