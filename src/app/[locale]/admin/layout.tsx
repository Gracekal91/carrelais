import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Shield, CarFront, Users, LogOut } from "lucide-react";
import { logout } from "@/lib/actions";

export default async function AdminLayout({ children, params }: { children: React.ReactNode, params: any }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 text-white flex-shrink-0">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Admin Portal</h2>
          <p className="text-sm text-zinc-400 mt-1">{user.firstName} {user.lastName}</p>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-800 transition-colors">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/listings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-800 transition-colors">
            <CarFront className="w-5 h-5" />
            <span className="font-medium">Listings</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-800 transition-colors">
            <Users className="w-5 h-5" />
            <span className="font-medium">Users</span>
          </Link>
        </nav>
        <div className="p-4 mt-auto border-t border-zinc-800">
          <form action={async () => { "use server"; await logout(); redirect("/"); }}>
            <button type="submit" className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-950/50 rounded-lg transition-colors">
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
