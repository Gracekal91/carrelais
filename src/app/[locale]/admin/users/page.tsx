import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/lib/models/User";
import { ListingModel } from "@/lib/models/Listing";
import { Users } from "lucide-react";
import UserFilters from "@/components/admin/UserFilters";
import UsersTableClient from "@/components/admin/UsersTableClient";
import PaginationControls from "@/components/admin/PaginationControls";
import { formatUser } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

interface AdminUsersPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    accountType?: string;
    status?: string;
  }>;
}

export default async function AdminUsersPage(props: AdminUsersPageProps) {
  const currentUser = await getCurrentUser();
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1") || 1);
  const pageSize = 10;

  const searchQuery = (searchParams.q || "").trim();
  const accountTypeFilter = searchParams.accountType || "";
  const statusFilter = searchParams.status || "";

  await connectToDatabase();
  const query: Record<string, any> = {};

  if (accountTypeFilter) {
    if (accountTypeFilter === "ADMIN") {
      query.role = { $in: ["ADMIN", "SUPER_ADMIN"] };
    } else {
      query.role = "USER";
      query.accountType = accountTypeFilter;
    }
  }

  if (statusFilter) {
    query.status = statusFilter;
  }

  if (searchQuery) {
    const sRegex = new RegExp(searchQuery, "i");
    query.$or = [
      { firstName: sRegex },
      { lastName: sRegex },
      { email: sRegex },
      { phone: sRegex },
      { dealershipName: sRegex },
    ];
  }

  const totalCount = await UserModel.countDocuments(query);
  const totalPages = Math.ceil(totalCount / pageSize);
  const skip = (page - 1) * pageSize;

  const userDocs = await UserModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  const paginatedUsers = userDocs.map(formatUser);

  // Compute listing statistics for each user
  const usersWithStats = await Promise.all(
    paginatedUsers.map(async (user) => {
      const [total, active, sold, rejected] = await Promise.all([
        ListingModel.countDocuments({ ownerId: user.id }),
        ListingModel.countDocuments({ ownerId: user.id, status: "PUBLISHED" }),
        ListingModel.countDocuments({ ownerId: user.id, status: "SOLD" }),
        ListingModel.countDocuments({ ownerId: user.id, status: "REJECTED" }),
      ]);
      return {
        user,
        stats: {
          total,
          active,
          sold,
          rejected,
        },
      };
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Gestion des utilisateurs
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Supervisez les comptes particuliers, concessionnaires et administrateurs
        </p>
      </div>

      {/* Filter Component */}
      <UserFilters
        initialSearch={searchParams.q || ""}
        initialAccountType={accountTypeFilter}
        initialStatus={statusFilter}
      />

      {/* User Table Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        {usersWithStats.length > 0 ? (
          <>
            <UsersTableClient
              usersWithStats={usersWithStats}
              isSuperAdmin={isSuperAdmin}
              currentUserId={currentUser?.id}
            />
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              basePath="/admin/users"
              itemLabel="utilisateurs"
            />
          </>
        ) : (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              Aucun utilisateur trouvé
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Aucun utilisateur ne correspond à vos critères de recherche.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/users"
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
