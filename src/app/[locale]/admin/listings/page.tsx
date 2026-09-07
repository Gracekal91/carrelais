import { db } from "@/lib/db";
import Link from "next/link";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

export default async function AdminListingsPage(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page) || 1;
  const pageSize = 10;
  
  const allListings = [...db.listings].sort((a, b) => {
    // pending first
    if (a.status === "PENDING_REVIEW" && b.status !== "PENDING_REVIEW") return -1;
    if (b.status === "PENDING_REVIEW" && a.status !== "PENDING_REVIEW") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalCount = allListings.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const listings = allListings.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Listings</h1>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-4 font-medium text-sm text-zinc-500">Vehicle</th>
                <th className="p-4 font-medium text-sm text-zinc-500">Seller</th>
                <th className="p-4 font-medium text-sm text-zinc-500">Status</th>
                <th className="p-4 font-medium text-sm text-zinc-500">Date Submitted</th>
                <th className="p-4 font-medium text-sm text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {listings.map(listing => (
                <tr key={listing.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 relative rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                        {listing.images?.[0] && <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{listing.title}</p>
                        <p className="text-xs text-zinc-500">${listing.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-sm">{listing.seller.name}</p>
                    <p className="text-xs text-zinc-500">{listing.seller.type}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                      ${listing.status === "PUBLISHED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
                        listing.status === "PENDING_REVIEW" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : 
                        listing.status === "REJECTED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                      {listing.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-zinc-500">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/listings/${listing.id}`} className="inline-flex items-center gap-1 text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-md font-medium transition-colors">
                      <Eye className="w-4 h-4" /> Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="text-sm text-zinc-500">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} listings
            </div>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link href={`/admin/listings?page=${page - 1}`} className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  Previous
                </Link>
              ) : (
                <span className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm opacity-50 cursor-not-allowed">Previous</span>
              )}
              {page < totalPages ? (
                <Link href={`/admin/listings?page=${page + 1}`} className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  Next
                </Link>
              ) : (
                <span className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm opacity-50 cursor-not-allowed">Next</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
