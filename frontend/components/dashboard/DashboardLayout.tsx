"use client";

import Sidebar from "./Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 ml-64 overflow-y-auto bg-gray-50">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

