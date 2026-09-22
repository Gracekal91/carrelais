"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { 
  Shield, 
  CarFront, 
  Users, 
  Store, 
  AlertTriangle, 
  LogOut, 
  Menu, 
  X,
  ExternalLink,
  PlusCircle,
  BookOpen
} from "lucide-react";
import { logout } from "@/lib/actions";

interface AdminNavProps {
  userName: string;
  pendingListingsCount?: number;
  newReportsCount?: number;
  unverifiedDealersCount?: number;
}

export default function AdminNav({
  userName,
  pendingListingsCount = 0,
  newReportsCount = 0,
  unverifiedDealersCount = 0,
}: AdminNavProps) {
  const t = useTranslations("AdminPortal.nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    {
      href: "/admin",
      label: t("dashboard"),
      icon: Shield,
      exact: true,
      badge: null,
      badgeColor: undefined,
    },
    {
      href: "/admin/dashboard/listings/create",
      label: "Publier une annonce",
      icon: PlusCircle,
      exact: false,
      badge: null,
      badgeColor: undefined,
    },
    {
      href: "/admin/listings",
      label: t("listings"),
      icon: CarFront,
      exact: false,
      badge: pendingListingsCount > 0 ? pendingListingsCount : null,
      badgeColor: "bg-amber-500 text-black font-bold",
    },
    {
      href: "/admin/users",
      label: t("users"),
      icon: Users,
      exact: false,
      badge: null,
      badgeColor: undefined,
    },
    {
      href: "/admin/dealers",
      label: t("dealerships"),
      icon: Store,
      exact: false,
      badge: unverifiedDealersCount > 0 ? unverifiedDealersCount : null,
      badgeColor: "bg-blue-500 text-white font-bold",
    },
    {
      href: "/admin/reports",
      label: t("reports"),
      icon: AlertTriangle,
      exact: false,
      badge: newReportsCount > 0 ? newReportsCount : null,
      badgeColor: "bg-red-500 text-white font-bold",
    },
    {
      href: "/admin/articles",
      label: "Articles (CMS)",
      icon: BookOpen,
      exact: false,
      badge: null,
      badgeColor: undefined,
    },
  ];

  const isActive = (href: string, exact: boolean) => {
    // Strip locale prefix if present (/fr/admin -> /admin)
    const normalized = pathname.replace(/^\/(fr|en)/, "") || "/";
    if (exact) {
      return normalized === href;
    }
    return normalized.startsWith(href);
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">{t("title")}</h2>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-primary block">Car Relais RDC</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
            {userName} ({t("superAdmin")})
          </p>
        </div>

        {mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
        {navItems.map(item => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-white shadow-md shadow-primary/20 font-semibold"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-zinc-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${item.badgeColor || "bg-zinc-700 text-white"}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-zinc-800">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Voir le site public</span>
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-zinc-800 mt-auto">
        <form action={async () => { await logout(); window.location.href = "/"; }}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3.5 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("logout")}</span>
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40 text-white">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm tracking-tight">{t("title")}</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-4/5 max-w-xs bg-zinc-900 text-white flex flex-col h-full shadow-2xl z-10 border-r border-zinc-800">
            {navContent}
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900 text-white flex-shrink-0 min-h-screen border-r border-zinc-800 sticky top-0 h-screen">
        {navContent}
      </aside>
    </>
  );
}
