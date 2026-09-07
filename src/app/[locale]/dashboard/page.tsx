import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { PlusCircle, Eye, MessageSquare, Phone } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const myListings = db.listings.filter(l => l.ownerId === user.id);
  const activeCount = myListings.filter(l => l.status === "PUBLISHED").length;
  const pendingCount = myListings.filter(l => l.status === "PENDING_REVIEW").length;
  
  const totalViews = myListings.reduce((acc, curr) => acc + curr.views, 0);
  const totalContacts = myListings.reduce((acc, curr) => acc + curr.contacts, 0);

  // Simple aggregation for chart (last 7 days)
  const last7Days = Array.from({length: 7}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  
  const aggregatedStats = last7Days.map(date => {
    let views = 0, contacts = 0;
    myListings.forEach(l => {
      const stat = l.dailyStats.find(s => s.date === date);
      if (stat) {
        views += stat.views;
        contacts += stat.contacts;
      }
    });
    return { date, views, contacts };
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-zinc-500">Welcome back, {user.firstName}. Here's how your listings are performing.</p>
        </div>
        <Link href="/dashboard/listings/create" className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors w-fit">
          <PlusCircle className="w-5 h-5" />
          Post a Car
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 mb-1">Total / Active Listings</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{myListings.length}</span>
            <span className="text-sm text-zinc-500 mb-1">/ {activeCount} live</span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 mb-1">Pending Approval</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-amber-500">{pendingCount}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 mb-1">Total Views</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-blue-500">{totalViews.toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 mb-1">Total Contacts</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-green-500">{totalContacts.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">Performance (Last 7 Days)</h2>
        <div className="space-y-4">
          {aggregatedStats.map((stat) => (
            <div key={stat.date} className="flex items-center gap-4">
              <span className="w-24 text-sm font-medium text-zinc-500">{stat.date}</span>
              <div className="flex-1 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${Math.min(100, (stat.views / (Math.max(...aggregatedStats.map(s => s.views)) || 1)) * 100)}%` }} 
                  title={`${stat.views} views`}
                />
              </div>
              <span className="w-16 text-right text-sm font-semibold">{stat.views} v</span>
              <span className="w-16 text-right text-sm font-semibold text-green-500">{stat.contacts} c</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
