"use client";

import * as React from "react";
import Link from "next/link";
import { MarketplaceReport } from "@/lib/db/schema";
import { AlertTriangle, ExternalLink, CheckCircle2, Clock, XCircle, ShieldAlert } from "lucide-react";
import ReportResolutionModal from "./ReportResolutionModal";

interface ReportsTableClientProps {
  reports: MarketplaceReport[];
}

export default function ReportsTableClient({ reports }: ReportsTableClientProps) {
  const [selectedReport, setSelectedReport] = React.useState<MarketplaceReport | null>(null);

  const getStatusBadge = (status: MarketplaceReport["status"]) => {
    switch (status) {
      case "NEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
            <AlertTriangle className="w-3 h-3" />
            <span>Nouveau</span>
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="w-3 h-3" />
            <span>En cours</span>
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            <span>Résolu</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            <XCircle className="w-3 h-3" />
            <span>Classé sans suite</span>
          </span>
        );
    }
  };

  const getTypeLabel = (type: MarketplaceReport["type"]) => {
    const map: Record<string, string> = {
      FRAUD: "Fraude / Arnaque",
      INCORRECT_INFO: "Infos incorrectes",
      ALREADY_SOLD: "Déjà vendu",
      MISLEADING_PRICE: "Prix trompeur",
      WRONG_PHOTOS: "Photos non conformes",
      INAPPROPRIATE: "Contenu inapproprié",
      OTHER: "Autre infraction",
    };
    return map[type] || type;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-50/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            <tr>
              <th className="p-4">Cible du signalement</th>
              <th className="p-4">Type d'infraction</th>
              <th className="p-4">Détails rapportés</th>
              <th className="p-4">Déclarant</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
            {reports.map(report => {
              const targetLink = report.targetType === "LISTING"
                ? `/admin/listings/${report.targetId}`
                : `/dealers/${report.targetId}`;

              return (
                <tr 
                  key={report.id} 
                  className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors ${
                    report.status === "NEW" ? "bg-red-50/20 dark:bg-red-950/10" : ""
                  }`}
                >
                  {/* Target */}
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {report.targetTitle}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                          {report.targetType === "LISTING" ? "Annonce véhicule" : "Concessionnaire"}
                        </span>
                        <Link
                          href={targetLink}
                          target="_blank"
                          className="inline-flex items-center gap-0.5 text-[11px] text-primary hover:underline font-medium"
                        >
                          <span>Examiner</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="p-4">
                    <span className="inline-flex px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-[11px]">
                      {getTypeLabel(report.type)}
                    </span>
                  </td>

                  {/* Reason snippet */}
                  <td className="p-4 max-w-xs">
                    <p className="text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                      {report.reason}
                    </p>
                    {report.resolutionNote && (
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 italic">
                        Note admin : {report.resolutionNote}
                      </p>
                    )}
                  </td>

                  {/* Reporter */}
                  <td className="p-4">
                    <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {report.reporterEmail || "Utilisateur anonyme"}
                    </p>
                    <span className="text-[10px] text-zinc-400 block">
                      {new Date(report.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    {getStatusBadge(report.status)}
                  </td>

                  {/* Action */}
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(report)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                        report.status === "NEW"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{report.status === "NEW" ? "Traiter" : "Détails"}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <ReportResolutionModal
          report={selectedReport}
          isOpen={true}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </>
  );
}
