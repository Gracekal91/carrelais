import Link from "next/link";
import Image from "next/image";
import { connectToDatabase } from "@/lib/mongodb";
import { ListingModel } from "@/lib/models/Listing";
import { formatListing } from "@/lib/data";
import { CarFront, Store, User as UserIcon, Plus } from "lucide-react";
import ListingFilters from "@/components/admin/ListingFilters";
import ListingStatusBadge from "@/components/admin/ListingStatusBadge";
import PaginationControls from "@/components/admin/PaginationControls";
import ListingRowActions from "@/components/admin/ListingRowActions";
import mongoose from "mongoose";

interface AdminListingsPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    sellerType?: string;
    date?: string;
  }>;
}

export default async function AdminListingsPage(props: AdminListingsPageProps) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1") || 1);
  const pageSize = 10;

  const searchQuery = (searchParams.q || "").trim();
  const statusFilter = searchParams.status || "";
  const sellerTypeFilter = searchParams.sellerType || "";
  const dateFilter = searchParams.date || "";

  await connectToDatabase();
  const query: Record<string, any> = {};

  if (statusFilter) {
    query.status = statusFilter;
  }

  if (sellerTypeFilter) {
    query["seller.type"] = sellerTypeFilter;
  }

  if (dateFilter) {
    const now = Date.now();
    let msAgo = 0;
    if (dateFilter === "today") msAgo = 24 * 3600000;
    else if (dateFilter === "thisWeek") msAgo = 7 * 24 * 3600000;
    else if (dateFilter === "thisMonth") msAgo = 30 * 24 * 3600000;
    if (msAgo > 0) {
      const minIso = new Date(now - msAgo).toISOString();
      query.createdAt = { $gte: minIso };
    }
  }

  if (searchQuery) {
    const sRegex = new RegExp(searchQuery, "i");
    const orConditions: any[] = [
      { title: sRegex },
      { make: sRegex },
      { model: sRegex },
      { "seller.name": sRegex },
    ];
    if (mongoose.Types.ObjectId.isValid(searchQuery)) {
      orConditions.push({ _id: searchQuery });
    }
    query.$or = orConditions;
  }

  const totalCount = await ListingModel.countDocuments(query);
  const totalPages = Math.ceil(totalCount / pageSize);
  const skip = (page - 1) * pageSize;

  const docs = await ListingModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  const listings = docs.map(formatListing);
  // Prioritize pending reviews if not filtered by specific status
  if (!statusFilter) {
    listings.sort((a, b) => {
      if (a.status === "PENDING_REVIEW" && b.status !== "PENDING_REVIEW") return -1;
      if (b.status === "PENDING_REVIEW" && a.status !== "PENDING_REVIEW") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Gestion des annonces
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Examinez, filtrez et modérez les véhicules soumis sur le marketplace
          </p>
        </div>
        <Link
          href="/admin/dashboard/listings/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 shadow-sm transition-all text-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle annonce</span>
        </Link>
      </div>

      {/* Filter Component */}
      <ListingFilters
        initialSearch={searchParams.q || ""}
        initialStatus={statusFilter}
        initialSellerType={sellerTypeFilter}
        initialDateRange={dateFilter}
      />

      {/* Listings Table / Cards */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        {listings.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-50/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Véhicule</th>
                    <th className="p-4">Vendeur</th>
                    <th className="p-4">Prix</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4">Date de soumission</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {listings.map(listing => (
                    <tr 
                      key={listing.id} 
                      className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors ${
                        listing.status === "PENDING_REVIEW" ? "bg-amber-50/30 dark:bg-amber-950/10" : ""
                      }`}
                    >
                      {/* Vehicle */}
                      <td className="p-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-16 h-12 relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                            {listing.images?.[0] ? (
                              <Image 
                                src={listing.images[0]} 
                                alt={listing.title} 
                                fill 
                                className="object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <CarFront className="w-5 h-5 opacity-40" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-primary transition-colors">
                              <Link href={`/admin/listings/${listing.id}`}>
                                {listing.title}
                              </Link>
                            </p>
                            <p className="text-xs text-zinc-500">
                              {listing.mileage ? `${listing.mileage.toLocaleString()} km` : "N/A"} • {listing.fuelType} • {listing.transmission}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Seller */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                            {listing.seller?.name || "Vendeur"}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                            {listing.seller?.type === "DEALERSHIP" ? (
                              <Store className="w-3 h-3 text-primary" />
                            ) : (
                              <UserIcon className="w-3 h-3 text-zinc-400" />
                            )}
                            <span>{listing.seller?.type === "DEALERSHIP" ? "Concessionnaire" : "Particulier"}</span>
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="p-4">
                        <span className="font-black text-sm text-zinc-900 dark:text-zinc-100">
                          ${listing.price.toLocaleString()}
                        </span>
                        {listing.isNegotiable && (
                          <span className="block text-[10px] text-zinc-400 font-medium">Négociable</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        <ListingStatusBadge status={listing.status} />
                      </td>

                      {/* Date */}
                      <td className="p-4 text-xs text-zinc-500">
                        {new Date(listing.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right">
                        <ListingRowActions
                          listingId={listing.id}
                          listingTitle={listing.title}
                          status={listing.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
              {listings.map(listing => (
                <div key={listing.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-16 relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                      {listing.images?.[0] ? (
                        <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
                      ) : (
                        <CarFront className="w-6 h-6 m-auto text-zinc-400 opacity-50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <ListingStatusBadge status={listing.status} size="sm" />
                      <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate mt-1">
                        {listing.title}
                      </p>
                      <p className="text-xs font-black text-primary mt-0.5">
                        ${listing.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                    <div>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {listing.seller?.name}
                      </span>
                      <span className="text-[10px] block">
                        {new Date(listing.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    <ListingRowActions
                      listingId={listing.id}
                      listingTitle={listing.title}
                      status={listing.status}
                      compact
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              basePath="/admin/listings"
              itemLabel="annonces"
            />
          </>
        ) : (
          <div className="p-12 text-center space-y-3">
            <CarFront className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              Aucune annonce trouvée
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Aucune annonce ne correspond aux filtres sélectionnés. Réinitialisez les filtres pour voir toutes les annonces.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/listings"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
              >
                Réinitialiser les critères
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
