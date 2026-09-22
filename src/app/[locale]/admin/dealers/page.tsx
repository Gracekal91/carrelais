import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/lib/models/User";
import { ListingModel } from "@/lib/models/Listing";
import { Store, ShieldCheck, ShieldAlert } from "lucide-react";
import DealerFilters from "@/components/admin/DealerFilters";
import DealersTableClient from "@/components/admin/DealersTableClient";
import PaginationControls from "@/components/admin/PaginationControls";
import { formatUser } from "@/lib/data";

interface AdminDealersPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    verification?: string;
  }>;
}

export default async function AdminDealersPage(props: AdminDealersPageProps) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1") || 1);
  const pageSize = 10;

  const searchQuery = (searchParams.q || "").trim();
  const verificationFilter = searchParams.verification || "";

  await connectToDatabase();

  const [totalDealersCount, verifiedDealersCount, unverifiedDealersCount] = await Promise.all([
    UserModel.countDocuments({ accountType: "DEALERSHIP" }),
    UserModel.countDocuments({ accountType: "DEALERSHIP", isVerified: true }),
    UserModel.countDocuments({ accountType: "DEALERSHIP", isVerified: false }),
  ]);

  const query: Record<string, any> = {
    accountType: "DEALERSHIP",
  };

  if (verificationFilter === "verifiedOnly") {
    query.isVerified = true;
  } else if (verificationFilter === "unverifiedOnly") {
    query.isVerified = false;
  }

  if (searchQuery) {
    const sRegex = new RegExp(searchQuery, "i");
    query.$or = [
      { dealershipName: sRegex },
      { firstName: sRegex },
      { lastName: sRegex },
      { city: sRegex },
      { phone: sRegex },
    ];
  }

  const totalCount = await UserModel.countDocuments(query);
  const totalPages = Math.ceil(totalCount / pageSize);
  const skip = (page - 1) * pageSize;

  const dealerDocs = await UserModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  const paginatedDealers = dealerDocs.map(formatUser);

  // Compute listing stats for each dealership
  const dealersWithStats = await Promise.all(
    paginatedDealers.map(async (dealer) => {
      const [totalCount, activeCount] = await Promise.all([
        ListingModel.countDocuments({ ownerId: dealer.id }),
        ListingModel.countDocuments({ ownerId: dealer.id, status: "PUBLISHED" }),
      ]);
      return {
        dealer,
        activeCount,
        totalCount,
      };
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Gestion des concessionnaires
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Validez et suivez les professionnels de l'automobile en République Démocratique du Congo
        </p>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total concessionnaires</span>
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 block mt-1">{totalDealersCount}</span>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-primary rounded-xl">
            <Store className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/50 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-semibold">Vérifiés (Badge Officiel)</span>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 block mt-1">{verifiedDealersCount}</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider font-semibold">En attente de vérification</span>
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400 block mt-1">{unverifiedDealersCount}</span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <DealerFilters
        initialSearch={searchParams.q || ""}
        initialVerification={verificationFilter}
      />

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        {dealersWithStats.length > 0 ? (
          <>
            <DealersTableClient dealersWithStats={dealersWithStats} />
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              basePath="/admin/dealers"
              itemLabel="concessionnaires"
            />
          </>
        ) : (
          <div className="p-12 text-center space-y-3">
            <Store className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              Aucun concessionnaire trouvé
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Aucun concessionnaire ne correspond aux critères sélectionnés.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/dealers"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
              >
                Réinitialiser les filtres
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
