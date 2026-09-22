import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/signin");
  }

  // Calculate live notification badges
  const pendingListingsCount = db.listings.filter(l => l.status === "PENDING_REVIEW").length;
  const newReportsCount = (db.reports || []).filter(r => r.status === "NEW").length;
  const unverifiedDealersCount = db.users.filter(u => u.accountType === "DEALERSHIP" && !u.isVerified).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row text-zinc-900 dark:text-zinc-100">
      {/* Sidebar with Navigation */}
      <AdminNav
        userName={`${user.firstName} ${user.lastName}`}
        pendingListingsCount={pendingListingsCount}
        newReportsCount={newReportsCount}
        unverifiedDealersCount={unverifiedDealersCount}
      />

      {/* Main Administrative Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
