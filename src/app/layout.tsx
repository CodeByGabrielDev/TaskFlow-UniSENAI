import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Carrega o AuthProvider apenas no cliente — evita que o Firebase
// seja inicializado durante o pre-render estático do servidor.
const ClientProviders = dynamic(
  () => import("@/components/ClientProviders"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: {
    default: "TaskFlow",
    template: "%s | TaskFlow",
  },
  description: "Gerencie suas tarefas de forma simples e eficiente.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
