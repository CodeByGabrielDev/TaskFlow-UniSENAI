"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { VLibras } from "@/components/VLibras";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      themes={["dark", "light", "high-contrast"]}
      enableSystem={false}
    >
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{ duration: 4000 }}
          aria-live="polite"
        />
        <VLibras />
      </AuthProvider>
    </ThemeProvider>
  );
}
