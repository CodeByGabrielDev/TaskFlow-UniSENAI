import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClientProviders } from "@/components/ClientProviders";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "TaskFlow", template: "%s | TaskFlow" },
  description: "Gerencie suas tarefas de forma simples e eficiente.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
