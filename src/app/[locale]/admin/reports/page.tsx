import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { ReportModel } from "@/lib/models/Report";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import ReportFilters from "@/components/admin/ReportFilters";
import ReportsTableClient from "@/components/admin/ReportsTableClient";
import PaginationControls from "@/components/admin/PaginationControls";
import { formatReport } from "@/lib/data";

interface AdminReportsPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    type?: string;
  }>;
}

export default async function AdminReportsPage(props: AdminReportsPageProps) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1") || 1);
  const pageSize = 10;

  const searchQuery = (searchParams.q || "").trim();
  const statusFilter = searchParams.status || "";
  const typeFilter = searchParams.type || "";

  await connectToDatabase();

  const [totalReportsCount, newReportsCount, resolvedReportsCount] = await Promise.all([
    ReportModel.countDocuments(),
    ReportModel.countDocuments({ status: "NEW" }),
    ReportModel.countDocuments({ status: "RESOLVED" }),
  ]);

  const query: Record<string, any> = {};

  if (statusFilter) {
    query.status = statusFilter;
  }

  if (typeFilter) {
    query.type = typeFilter;
  }

  if (searchQuery) {
    const sRegex = new RegExp(searchQuery, "i");
    query.$or = [
      { targetTitle: sRegex },
      { reason: sRegex },
      { reporterEmail: sRegex },
    ];
  }

  const totalCount = await ReportModel.countDocuments(query);
  const totalPages = Math.ceil(totalCount / pageSize);
  const skip = (page - 1) * pageSize;

  const docs = await ReportModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  const paginatedReports = docs.map(formatReport);

  if (!statusFilter) {
    paginatedReports.sort((a, b) => {
      if (a.status === "NEW" && b.status !== "NEW") return -1;
      if (b.status === "NEW" && a.status !== "NEW") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Modération des signalements
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Traitez les plaintes, annonces frauduleuses et infractions constatées sur la plateforme
        </p>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total signalements</span>
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 block mt-1">{totalReportsCount}</span>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-red-700 dark:text-red-400 uppercase tracking-wider font-semibold">Nouveaux (Action requise)</span>
            <span className="text-2xl font-black text-red-700 dark:text-red-400 block mt-1">{newReportsCount}</span>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/50 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-semibold">Traités & Résolus</span>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 block mt-1">{resolvedReportsCount}</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters
        initialSearch={searchParams.q || ""}
        initialStatus={statusFilter}
        initialType={typeFilter}
      />

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        {paginatedReports.length > 0 ? (
          <>
            <ReportsTableClient reports={paginatedReports} />
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              basePath="/admin/reports"
              itemLabel="signalements"
            />
          </>
        ) : (
          <div className="p-12 text-center space-y-3">
            <AlertTriangle className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              Aucun signalement trouvé
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Aucun signalement ne correspond à vos critères de recherche. Le marketplace est sain !
            </p>
            <div className="pt-2">
              <Link
                href="/admin/reports"
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
