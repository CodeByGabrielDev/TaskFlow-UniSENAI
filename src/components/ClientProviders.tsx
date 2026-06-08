"use client";

import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";

// Carrega o AuthProvider (que importa Firebase) apenas no cliente.
// ssr: false dentro de um Client Component é permitido no Next.js 15.
const AuthProviderDynamic = dynamic(
  () => import("@/contexts/AuthContext").then((m) => ({ default: m.AuthProvider })),
  {
    ssr: false,
    loading: () => null,
  }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProviderDynamic>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "10px",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#22c55e", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />
    </AuthProviderDynamic>
  );
}
