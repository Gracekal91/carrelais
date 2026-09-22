"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "@/lib/db/schema";
import { Store, ShieldCheck, ShieldAlert, Settings, ExternalLink } from "lucide-react";
import DealerVerifyModal from "./DealerVerifyModal";

interface DealerWithStats {
  dealer: User;
  activeCount: number;
  totalCount: number;
}

interface DealersTableClientProps {
  dealersWithStats: DealerWithStats[];
}

export default function DealersTableClient({ dealersWithStats }: DealersTableClientProps) {
  const [selectedDealer, setSelectedDealer] = React.useState<User | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-50/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            <tr>
              <th className="p-4">Concessionnaire</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Emplacement</th>
              <th className="p-4">Inventaire actif</th>
              <th className="p-4">Vérification</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
            {dealersWithStats.map(({ dealer, activeCount, totalCount }) => {
              const isVerified = Boolean(dealer.isVerified);
              return (
                <tr key={dealer.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                  {/* Dealership info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700 relative">
                        {dealer.logo ? (
                          <Image src={dealer.logo} alt={dealer.dealershipName || "Dealer"} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                            <Store className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {dealer.dealershipName || `${dealer.firstName} ${dealer.lastName}`}
                        </p>
                        <span className="text-[11px] text-zinc-500">
                          {dealer.foundedYear ? `Fondé en ${dealer.foundedYear}` : `Inscrit en ${new Date(dealer.joinedAt).getFullYear()}`}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="p-4">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {dealer.firstName} {dealer.lastName}
                    </p>
                    <p className="text-zinc-400 text-[11px]">{dealer.phone}</p>
                    <p className="text-zinc-500 text-[11px]">{dealer.email}</p>
                  </td>

                  {/* Location */}
                  <td className="p-4">
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">
                      {dealer.city || "Kinshasa"}
                    </p>
                    <p className="text-zinc-400 text-[11px]">
                      {dealer.commune ? `${dealer.commune}, RDC` : "RDC"}
                    </p>
                  </td>

                  {/* Inventory */}
                  <td className="p-4">
                    <span className="font-black text-sm text-zinc-900 dark:text-zinc-100">
                      {activeCount}
                    </span>
                    <span className="text-zinc-400 text-[11px] block">
                      sur {totalCount} au total
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isVerified
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}>
                      {isVerified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      <span>{isVerified ? "Vérifié" : "Non vérifié"}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dealers/${dealer.id}`}
                        target="_blank"
                        className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Voir la vitrine"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSelectedDealer(dealer)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Gérer</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedDealer && (
        <DealerVerifyModal
          dealer={selectedDealer}
          isOpen={true}
          onClose={() => setSelectedDealer(null)}
        />
      )}
    </>
  );
}
