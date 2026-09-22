"use client";

import * as React from "react";
import { User } from "@/lib/db/schema";
import { Store, User as UserIcon, Shield, Eye, Trash2 } from "lucide-react";
import UserDetailsModal from "./UserDetailsModal";
import DeleteUserModal from "./DeleteUserModal";

interface UserWithListingStats {
  user: User;
  stats: {
    total: number;
    active: number;
    sold: number;
    rejected: number;
  };
}

interface UsersTableClientProps {
  usersWithStats: UserWithListingStats[];
  isSuperAdmin?: boolean;
  currentUserId?: string;
}

export default function UsersTableClient({
  usersWithStats,
  isSuperAdmin = false,
  currentUserId,
}: UsersTableClientProps) {
  const [selectedUserStats, setSelectedUserStats] = React.useState<UserWithListingStats | null>(null);
  const [deletingUserStats, setDeletingUserStats] = React.useState<UserWithListingStats | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-50/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            <tr>
              <th className="p-4">Nom / Établissement</th>
              <th className="p-4">Type de compte</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Inscription</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
            {usersWithStats.map(({ user, stats }) => {
              const isSuspended = user.status === "SUSPENDED";
              return (
                <tr key={user.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                        {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") ? (
                          <Shield className="w-4 h-4 text-primary" />
                        ) : user.accountType === "DEALERSHIP" ? (
                          <Store className="w-4 h-4 text-blue-500" />
                        ) : (
                          <UserIcon className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {user.accountType === "DEALERSHIP" && user.dealershipName
                            ? user.dealershipName
                            : `${user.firstName} ${user.lastName}`}
                        </p>
                        {user.accountType === "DEALERSHIP" && (
                          <p className="text-[11px] text-zinc-500">
                            Contact : {user.firstName} {user.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                      {user.role === "SUPER_ADMIN" ? (
                        <span className="text-primary font-bold">Super Administrateur</span>
                      ) : user.role === "ADMIN" ? (
                        <span className="text-primary font-bold">Administrateur</span>
                      ) : user.accountType === "DEALERSHIP" ? (
                        <span>Concessionnaire</span>
                      ) : (
                        <span>Particulier</span>
                      )}
                    </span>
                  </td>

                  <td className="p-4">
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">{user.email}</p>
                    <p className="text-zinc-400 text-[11px]">{user.phone}</p>
                  </td>

                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isSuspended
                        ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                    }`}>
                      {isSuspended ? "Suspendu" : "Actif"}
                    </span>
                  </td>

                  <td className="p-4 text-zinc-500">
                    {new Date(user.joinedAt).toLocaleDateString("fr-FR")}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUserStats({ user, stats })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Détails</span>
                      </button>

                      {isSuperAdmin && user.id !== currentUserId && (
                        <button
                          type="button"
                          onClick={() => setDeletingUserStats({ user, stats })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors cursor-pointer shadow-xs border border-red-200/50 dark:border-red-900/40"
                          title="Supprimer définitivement cet utilisateur de la base"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Supprimer</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {selectedUserStats && (
        <UserDetailsModal
          user={selectedUserStats.user}
          isOpen={true}
          onClose={() => setSelectedUserStats(null)}
          stats={selectedUserStats.stats}
          isSuperAdmin={isSuperAdmin}
          currentUserId={currentUserId}
          onDeleteClick={() => {
            const current = selectedUserStats;
            setSelectedUserStats(null);
            setDeletingUserStats(current);
          }}
        />
      )}

      {/* Delete User Modal (Super Admin only) */}
      {deletingUserStats && (
        <DeleteUserModal
          user={deletingUserStats.user}
          stats={deletingUserStats.stats}
          isOpen={true}
          onClose={() => setDeletingUserStats(null)}
        />
      )}
    </>
  );
}
