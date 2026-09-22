import Link from "next/link";
import { db } from "@/lib/db";
import { Users } from "lucide-react";
import UserFilters from "@/components/admin/UserFilters";
import UsersTableClient from "@/components/admin/UsersTableClient";
import PaginationControls from "@/components/admin/PaginationControls";

interface AdminUsersPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    accountType?: string;
    status?: string;
  }>;
}

export default async function AdminUsersPage(props: AdminUsersPageProps) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1") || 1);
  const pageSize = 10;

  const searchQuery = (searchParams.q || "").trim().toLowerCase();
  const accountTypeFilter = searchParams.accountType || "";
  const statusFilter = searchParams.status || "";

  // Filter users
  let filtered = db.users.filter(user => {
    // Search query
    if (searchQuery) {
      const matchName = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery);
      const matchEmail = user.email.toLowerCase().includes(searchQuery);
      const matchPhone = user.phone?.toLowerCase().includes(searchQuery);
      const matchDealer = user.dealershipName?.toLowerCase().includes(searchQuery);
      if (!matchName && !matchEmail && !matchPhone && !matchDealer) {
        return false;
      }
    }

    // Account Type
    if (accountTypeFilter) {
      if (accountTypeFilter === "ADMIN" && user.role !== "ADMIN") return false;
      if (accountTypeFilter !== "ADMIN" && (user.role === "ADMIN" || user.accountType !== accountTypeFilter)) return false;
    }

    // Status
    if (statusFilter) {
      const currentStatus = user.status || "ACTIVE";
      if (currentStatus !== statusFilter) return false;
    }

    return true;
  });

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedUsers = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Compute listing statistics for each user
  const usersWithStats = paginatedUsers.map(user => {
    const userListings = db.listings.filter(l => l.ownerId === user.id);
    return {
      user,
      stats: {
        total: userListings.length,
        active: userListings.filter(l => l.status === "PUBLISHED").length,
        sold: userListings.filter(l => l.status === "SOLD").length,
        rejected: userListings.filter(l => l.status === "REJECTED").length,
      },
    };
  });

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
            <UsersTableClient usersWithStats={usersWithStats} />
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
