import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ListingModel } from "@/lib/models/Listing";
import { formatListing } from "@/lib/data";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, Eye, BarChart2 } from "lucide-react";
import Image from "next/image";

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await connectToDatabase();
  const listingDocs = await ListingModel.find({ ownerId: user.id })
    .sort({ createdAt: -1 })
    .lean();
  const myListings = listingDocs.map(formatListing);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link href="/dashboard/listings/create" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors w-fit">
          <PlusCircle className="w-4 h-4" />
          Post a Car
        </Link>
      </div>

      {myListings.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No listings yet</h2>
          <p className="text-zinc-500 mb-6">Create your first vehicle listing to start selling.</p>
          <Link href="/dashboard/listings/create" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Post a Car
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-4 font-medium text-sm text-zinc-500">Vehicle</th>
                  <th className="p-4 font-medium text-sm text-zinc-500">Price</th>
                  <th className="p-4 font-medium text-sm text-zinc-500">Status</th>
                  <th className="p-4 font-medium text-sm text-zinc-500">Performance</th>
                  <th className="p-4 font-medium text-sm text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {myListings.map(listing => (
                  <tr key={listing.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-14 relative rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                          {listing.images?.[0] ? (
                            <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">No Image</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{listing.title}</p>
                          <p className="text-xs text-zinc-500">{new Date(listing.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium">
                      ${listing.price.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                        ${listing.status === "PUBLISHED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
                          listing.status === "PENDING_REVIEW" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : 
                          listing.status === "REJECTED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                        {listing.status.replace("_", " ")}
                      </span>
                      {listing.status === "REJECTED" && listing.rejectionReason && (
                        <p className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={listing.rejectionReason}>{listing.rejectionReason}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-xs space-y-1">
                        <p><span className="text-zinc-500">Views:</span> {listing.views}</p>
                        <p><span className="text-zinc-500">Contacts:</span> {listing.contacts}</p>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {listing.status === "PUBLISHED" && (
                          <Link href={`/vehicles/${listing.slug}`} target="_blank" className="p-2 text-zinc-500 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors" title="View Public Listing">
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <Link href={`/dashboard/listings/${listing.id}/analytics`} className="p-2 text-zinc-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="View Analytics">
                          <BarChart2 className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
