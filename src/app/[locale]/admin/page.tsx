import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/lib/models/User";
import { ListingModel } from "@/lib/models/Listing";
import { ReportModel } from "@/lib/models/Report";
import { AuditLogModel } from "@/lib/models/AuditLog";
import { 
  Users, 
  CarFront, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Store, 
  Archive, 
  ArrowRight,
  ShieldCheck,
  Ban,
  Activity,
  ChevronRight
} from "lucide-react";
import ListingStatusBadge from "@/components/admin/ListingStatusBadge";
import { VehicleStatus } from "@/types";

export default async function AdminDashboardPage() {
  await connectToDatabase();

  const [
    totalUsers,
    dealers,
    totalListings,
    pendingListings,
    publishedListings,
    soldListings,
    rejectedListings,
    suspendedListings,
    draftListings,
    newReports,
    unverifiedDealers,
    auditLogDocs,
  ] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ accountType: "DEALERSHIP" }),
    ListingModel.countDocuments(),
    ListingModel.countDocuments({ status: "PENDING_REVIEW" }),
    ListingModel.countDocuments({ status: "PUBLISHED" }),
    ListingModel.countDocuments({ status: "SOLD" }),
    ListingModel.countDocuments({ status: "REJECTED" }),
    ListingModel.countDocuments({ status: "SUSPENDED" }),
    ListingModel.countDocuments({ status: "DRAFT" }),
    ReportModel.countDocuments({ status: "NEW" }),
    UserModel.countDocuments({ accountType: "DEALERSHIP", isVerified: false }),
    AuditLogModel.find().sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  const individuals = Math.max(0, totalUsers - dealers);
  const auditLogs = auditLogDocs.map(log => ({
    ...log,
    id: log._id ? log._id.toString() : (log as any).id,
  }));

  // Status breakdown list
  const statusesList: { status: VehicleStatus; count: number }[] = [
    { status: "PENDING_REVIEW", count: pendingListings },
    { status: "PUBLISHED", count: publishedListings },
    { status: "REJECTED", count: rejectedListings },
    { status: "SOLD", count: soldListings },
    { status: "SUSPENDED", count: suspendedListings },
    { status: "DRAFT", count: draftListings },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Tableau de bord administrateur
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Supervision globale et modération du marketplace Car Relais RDC
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Users */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Utilisateurs</span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-black tracking-tight">{totalUsers}</span>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1.5 font-medium">
              <span>{dealers} pros</span>
              <span>•</span>
              <span>{individuals} part.</span>
            </div>
          </div>
        </div>

        {/* Total Listings */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Annonces</span>
            <CarFront className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-black tracking-tight">{totalListings}</span>
            <span className="text-[11px] text-zinc-500 block mt-1.5 font-medium">Toutes catégories</span>
          </div>
        </div>

        {/* Pending Approval (VISUALLY PROMINENT ALERT) */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:to-transparent p-5 rounded-2xl border-2 border-amber-400 dark:border-amber-600/70 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">En attente</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-black tracking-tight text-amber-800 dark:text-amber-400">
              {pendingListings}
            </span>
            <Link
              href="/admin/listings?status=PENDING_REVIEW"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline mt-1.5"
            >
              <span>Nécessite votre attention</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Live Published */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">En ligne</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              {publishedListings}
            </span>
            <span className="text-[11px] text-zinc-500 block mt-1.5 font-medium">Visibles aux acheteurs</span>
          </div>
        </div>

        {/* Sold Listings */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Vendues</span>
            <Archive className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-black tracking-tight text-blue-600 dark:text-blue-400">
              {soldListings}
            </span>
            <span className="text-[11px] text-zinc-500 block mt-1.5 font-medium">Transactions conclues</span>
          </div>
        </div>

        {/* Dealerships */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Concessionnaires</span>
            <Store className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-black tracking-tight">{dealers}</span>
            <span className="text-[11px] text-zinc-500 block mt-1.5 font-medium">Partenaires vérifiés & pros</span>
          </div>
        </div>
      </div>

      {/* ACTIONS REQUISES SECTION */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Actions requises
              </h2>
              <p className="text-xs text-zinc-500">
                Éléments en attente nécessitant une décision de modération aujourd'hui
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Pending Listings Action */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 block">
                Annonces de véhicules
              </span>
              <span className="text-lg font-black text-amber-900 dark:text-amber-200 block mt-0.5">
                {pendingListings} en attente
              </span>
            </div>
            <Link
              href="/admin/listings?status=PENDING_REVIEW"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <span>Examiner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* New Reports Action */}
          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-red-800 dark:text-red-300 block">
                Plaintes & Signalements
              </span>
              <span className="text-lg font-black text-red-900 dark:text-red-200 block mt-0.5">
                {newReports} non résolus
              </span>
            </div>
            <Link
              href="/admin/reports?status=NEW"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <span>Traiter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Unverified Dealers Action */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 block">
                Vérification concessionnaires
              </span>
              <span className="text-lg font-black text-blue-900 dark:text-blue-200 block mt-0.5">
                {unverifiedDealers} à vérifier
              </span>
            </div>
            <Link
              href="/admin/dealers?verification=unverifiedOnly"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <span>Valider</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS: Recent Activity & Listing Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Activité récente de modération
              </h3>
            </div>
            <span className="text-xs text-zinc-400 font-medium">Événements en direct</span>
          </div>

          <div className="space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        log.action === "LISTING_APPROVED" ? "bg-emerald-500" :
                        log.action === "LISTING_REJECTED" ? "bg-red-500" :
                        log.action === "DEALER_VERIFIED" ? "bg-blue-500" :
                        "bg-purple-500"
                      }`} />
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {log.action.replace("_", " ")}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">• {log.targetLabel}</span>
                    </div>
                    {log.details && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-4">
                        {log.details}
                      </p>
                    )}
                    <span className="text-[10px] text-zinc-400 pl-4 block">
                      Par {log.adminName}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-4 text-center">
                Aucune activité récente enregistrée.
              </p>
            )}
          </div>
        </div>

        {/* Listing Status Breakdown (1 col) */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
          <div className="border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              État des annonces
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Cliquez pour filtrer la liste
            </p>
          </div>

          <div className="space-y-2">
            {statusesList.map(item => (
              <Link
                key={item.status}
                href={`/admin/listings?status=${item.status}`}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <ListingStatusBadge status={item.status} size="sm" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-primary transition-colors">
                    {item.count}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
