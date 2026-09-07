import { db } from "@/lib/db";
import { updateListingStatus } from "@/lib/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle, XCircle } from "lucide-react";

export default async function AdminListingReviewPage({ params }: { params: any }) {
  const { id } = await params;
  const listing = db.listings.find(l => l.id === id);

  if (!listing) return redirect("/admin/listings");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/listings" className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Review Listing</h1>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{listing.year} {listing.make} {listing.model}</h2>
              <p className="text-xl font-semibold text-primary mt-1">${listing.price.toLocaleString()}</p>
              <span className={`inline-flex px-2 py-1 mt-2 text-xs font-semibold rounded-full 
                ${listing.status === "PUBLISHED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
                  listing.status === "PENDING_REVIEW" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : 
                  listing.status === "REJECTED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                  "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                {listing.status.replace("_", " ")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-zinc-500">Seller</span>
                <span className="font-medium">{listing.seller.name} ({listing.seller.type})</span>
              </div>
              <div>
                <span className="block text-zinc-500">Contact</span>
                <span className="font-medium">{listing.seller.phone}</span>
              </div>
              <div>
                <span className="block text-zinc-500">Condition</span>
                <span className="font-medium">{listing.condition}</span>
              </div>
              <div>
                <span className="block text-zinc-500">Mileage</span>
                <span className="font-medium">{listing.mileage.toLocaleString()} km</span>
              </div>
              <div>
                <span className="block text-zinc-500">Transmission</span>
                <span className="font-medium">{listing.transmission}</span>
              </div>
              <div>
                <span className="block text-zinc-500">Fuel</span>
                <span className="font-medium">{listing.fuelType}</span>
              </div>
            </div>

            <div>
              <span className="block text-sm text-zinc-500 mb-1">Description</span>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg">{listing.description}</p>
            </div>
          </div>

          <div className="w-full md:w-72 space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold mb-4">Admin Actions</h3>
              
              {listing.status === "PENDING_REVIEW" && (
                <div className="space-y-3">
                  <form action={async () => { "use server"; await updateListingStatus(listing.id, "PUBLISHED"); redirect("/admin/listings"); }}>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-medium transition-colors">
                      <CheckCircle className="w-5 h-5" /> Approve Listing
                    </button>
                  </form>
                  <form action={async (data) => { 
                    "use server"; 
                    await updateListingStatus(listing.id, "REJECTED", data.get("reason") as string); 
                    redirect("/admin/listings"); 
                  }}>
                    <input type="text" name="reason" placeholder="Reason for rejection..." required className="w-full mb-2 p-2 border rounded-lg text-sm dark:bg-zinc-800 dark:border-zinc-700" />
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-medium transition-colors">
                      <XCircle className="w-5 h-5" /> Reject Listing
                    </button>
                  </form>
                </div>
              )}
              
              {listing.status === "PUBLISHED" && (
                <form action={async () => { "use server"; await updateListingStatus(listing.id, "DRAFT"); redirect("/admin/listings"); }}>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white py-2.5 rounded-lg font-medium transition-colors">
                    Unpublish Listing
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
