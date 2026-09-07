import { db } from "@/lib/db";
import { Users, CarFront, CheckCircle, Clock } from "lucide-react";

export default function AdminDashboardPage() {
  const totalUsers = db.users.length;
  const dealers = db.users.filter(u => u.accountType === "DEALERSHIP").length;
  
  const totalListings = db.listings.length;
  const pendingListings = db.listings.filter(l => l.status === "PENDING_REVIEW").length;
  const publishedListings = db.listings.filter(l => l.status === "PUBLISHED").length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-zinc-500 mb-4">
            <Users className="w-4 h-4" /> Total Users
          </div>
          <span className="text-3xl font-bold">{totalUsers}</span>
          <span className="text-sm text-zinc-500 mt-2">{dealers} Dealerships</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-zinc-500 mb-4">
            <CarFront className="w-4 h-4" /> Total Listings
          </div>
          <span className="text-3xl font-bold">{totalListings}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 mb-4">
            <Clock className="w-4 h-4" /> Pending Approval
          </div>
          <span className="text-3xl font-bold text-amber-700 dark:text-amber-500">{pendingListings}</span>
          <span className="text-sm text-amber-600 dark:text-amber-500/80 mt-2">Requires attention</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-500 mb-4">
            <CheckCircle className="w-4 h-4" /> Live Listings
          </div>
          <span className="text-3xl font-bold text-green-700 dark:text-green-500">{publishedListings}</span>
        </div>
      </div>
    </div>
  );
}
