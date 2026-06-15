"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  LayoutDashboard,
  ListTodo,
  Columns3,
  CalendarDays,
  LogOut,
  Sun,
  Moon,
  Contrast,
  Menu,
  X,
  CheckSquare,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tarefas", icon: ListTodo },
  { href: "/kanban", label: "Kanban", icon: Columns3 },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
];

const THEMES = [
  { value: "dark", icon: Moon, label: "Escuro" },
  { value: "light", icon: Sun, label: "Claro" },
  { value: "high-contrast", icon: Contrast, label: "Alto Contraste" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    document.cookie = "taskflow_session=; path=/; max-age=0";
    await logout();
    toast.success("Você saiu da conta.");
    router.replace("/");
  };

  const cycleTheme = () => {
    const idx = THEMES.findIndex((t) => t.value === theme);
    const next = THEMES[(idx + 1) % THEMES.length];
    setTheme(next.value);
    toast.info(`Tema: ${next.label}`);
  };

  const ThemeIcon = THEMES.find((t) => t.value === theme)?.icon ?? Moon;

  const initials = user?.displayName
    ? user.displayName.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-app-surface border-r border-app-border z-30">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-app-border">
          <CheckSquare className="w-6 h-6 text-app-accent" />
          <span className="text-base font-bold text-app-text">TaskFlow</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navegação principal">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "bg-app-accent text-white"
                    : "text-app-muted hover:text-app-text hover:bg-app-card"
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom area */}
        <div className="px-3 py-4 border-t border-app-border space-y-1">
          <button
            onClick={cycleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-app-muted hover:text-app-text hover:bg-app-card transition-colors"
            aria-label="Alternar tema"
          >
            <ThemeIcon className="w-4 h-4 shrink-0" />
            Tema
          </button>

          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-app-muted hover:text-app-text hover:bg-app-card transition-colors"
          >
            <User className="w-4 h-4 shrink-0" />
            Perfil
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-app-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sair
          </button>

          {/* User info */}
          <div className="flex items-center gap-2 px-3 py-2 mt-1">
            <div className="w-7 h-7 rounded-full bg-app-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <span className="text-xs text-app-muted truncate">{user?.displayName ?? user?.email}</span>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-app-surface border-b border-app-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-app-accent" />
            <span className="font-bold text-app-text text-sm">TaskFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg text-app-muted hover:text-app-text hover:bg-app-card transition-colors"
              aria-label="Alternar tema"
            >
              <ThemeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-lg text-app-muted hover:text-app-text hover:bg-app-card transition-colors"
              aria-label="Abrir menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="md:hidden fixed left-0 top-0 h-full w-64 bg-app-surface border-r border-app-border z-50 flex flex-col"
              aria-label="Menu mobile"
            >
              <div className="flex items-center gap-2 px-5 py-5 border-b border-app-border">
                <CheckSquare className="w-6 h-6 text-app-accent" />
                <span className="font-bold text-app-text">TaskFlow</span>
              </div>

              <div className="flex-1 px-3 py-4 space-y-1">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                        ${active
                          ? "bg-app-accent text-white"
                          : "text-app-muted hover:text-app-text hover:bg-app-card"
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </div>

              <div className="px-3 py-4 border-t border-app-border space-y-1">
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-app-muted hover:text-app-text hover:bg-app-card transition-colors"
                >
                  <User className="w-4 h-4" />
                  Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-app-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
