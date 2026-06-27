"use client";

import { AppNav } from "@/components/organisms/AppNav";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ProtectedRoute>
      <AppNav />
      <div className="md:pl-60 pt-14 md:pt-0 min-h-screen bg-app-bg">
        <main id="main-content" role="main" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
