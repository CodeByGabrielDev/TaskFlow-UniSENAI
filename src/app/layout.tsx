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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg"
        >
          Pular para o conteúdo principal
        </a>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
