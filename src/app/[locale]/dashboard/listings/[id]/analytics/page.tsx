import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Eye, MessageSquare, Phone } from "lucide-react";
import Image from "next/image";
import ListingAnalyticsChart from "@/components/dashboard/ListingAnalyticsChart";

export default async function ListingAnalyticsPage({ params }: { params: any }) {
  const user = await getCurrentUser();
  if (!user) return redirect("/signin");

  const { id } = await params;
  const listing = db.listings.find(l => l.id === id && l.ownerId === user.id);
  
  if (!listing) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Listing not found</h1>
        <Link href="/dashboard/listings" className="text-primary hover:underline">Back to listings</Link>
      </div>
    );
  }

  // Calculate conversion rate
  const contactRate = listing.views > 0 ? ((listing.contacts / listing.views) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/listings" className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Listing Analytics</h1>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex items-center gap-6">
        <div className="w-32 h-24 relative rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
          {listing.images?.[0] && <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />}
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1">{listing.title}</h2>
          <p className="text-zinc-500 mb-2">${listing.price.toLocaleString()}</p>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400`}>
            {listing.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-bold mt-8 mb-4">Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-zinc-500 mb-4">
            <Eye className="w-4 h-4" /> Total Views
          </div>
          <span className="text-3xl font-bold">{listing.views}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-zinc-500 mb-4">
            Total Contacts
          </div>
          <span className="text-3xl font-bold">{listing.contacts}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-zinc-500 mb-4">
            <MessageSquare className="w-4 h-4" /> Chat Clicks
          </div>
          <span className="text-3xl font-bold">{listing.chats}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-zinc-500 mb-4">
            <Phone className="w-4 h-4" /> Phone Clicks
          </div>
          <span className="text-3xl font-bold">{listing.phoneClicks}</span>
        </div>
      </div>
      
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
        <span className="font-medium text-primary">Contact Conversion Rate</span>
        <span className="text-xl font-bold text-primary">{contactRate}%</span>
      </div>

      <ListingAnalyticsChart dailyStats={listing.dailyStats} />

    </div>
  );
}
