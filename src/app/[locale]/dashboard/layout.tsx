import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, CarFront, User, LogOut, ShieldCheck } from "lucide-react";
import { logout } from "@/lib/actions";

export const metadata: Metadata = {
  title: "Tableau de bord | Car Relais",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold">Seller Dashboard</h2>
          <p className="text-sm text-zinc-500 mt-1">{user.firstName} {user.lastName}</p>
          {user.accountType === "DEALERSHIP" && <p className="text-xs font-semibold text-primary mt-1">{user.dealershipName}</p>}
        </div>
        <nav className="p-4 space-y-2">
          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <Link 
              href="/admin" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold transition-colors mb-2"
            >
              <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Administration</span>
            </Link>
          )}
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </Link>
          <Link href="/dashboard/listings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <CarFront className="w-5 h-5" />
            <span className="font-medium">My Listings</span>
          </Link>
          <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <User className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </Link>
        </nav>
        <div className="p-4 mt-auto border-t border-zinc-200 dark:border-zinc-800">
          <form action={async () => { "use server"; await logout(); redirect("/"); }}>
            <button type="submit" className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
