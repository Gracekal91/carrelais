import { redirect } from "next/navigation";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { ListingModel } from "@/lib/models/Listing";
import { UserModel } from "@/lib/models/User";
import { formatListing, formatUser } from "@/lib/data";
import mongoose from "mongoose";
import { 
  ChevronLeft, 
  Store, 
  User as UserIcon, 
  Check, 
  MapPin, 
  Phone, 
  Calendar, 
  FileText, 
  ShieldCheck,
  ExternalLink,
  History,
  AlertCircle,
  Sparkles,
  MessageCircle
} from "lucide-react";
import ListingStatusBadge from "@/components/admin/ListingStatusBadge";
import ListingPhotoGallery from "@/components/admin/ListingPhotoGallery";
import ListingReviewActions from "@/components/admin/ListingReviewActions";

export default async function AdminListingReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectToDatabase();

  const listingDoc = mongoose.Types.ObjectId.isValid(id)
    ? await ListingModel.findById(id).lean()
    : await ListingModel.findOne({ slug: id }).lean();

  if (!listingDoc) {
    return redirect("/admin/listings");
  }

  const listing = formatListing(listingDoc);

  // Find owner user details
  const ownerDoc = mongoose.Types.ObjectId.isValid(listing.ownerId)
    ? await UserModel.findById(listing.ownerId).lean()
    : await UserModel.findOne({ _id: listing.ownerId }).lean();
  const owner = ownerDoc ? formatUser(ownerDoc) : null;
  const ownerListingsCount = await ListingModel.countDocuments({ ownerId: listing.ownerId, status: "PUBLISHED" });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/listings"
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors shadow-xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {listing.year ? `${listing.year} ` : ""}{listing.make} {listing.model}
              </h1>
              <ListingStatusBadge status={listing.status} size="md" />
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Identifiant de l'annonce : <span className="font-mono text-zinc-700 dark:text-zinc-300">{listing.id}</span>
            </p>
          </div>
        </div>

        <div className="text-right sm:self-center">
          <span className="text-2xl font-black text-primary block">
            ${listing.price.toLocaleString()}
          </span>
          {listing.isNegotiable && (
            <span className="text-xs text-zinc-500 font-medium">Prix négociable</span>
          )}
        </div>
      </div>

      {/* Main Grid: Content (8 cols) & Review Actions / Seller (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Full Vehicle Information */}
        <div className="lg:col-span-8 space-y-8">
          {/* Submitted Photos Inspector */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Galerie photos soumises ({listing.images?.length || 0})
            </h2>
            <ListingPhotoGallery images={listing.images || []} title={listing.title} />
          </div>

          {/* Vehicle Specifications Grid */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Fiche technique du véhicule
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Marque</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{listing.make}</span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Modèle</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{listing.model}</span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Année</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{listing.year || "Non précisée"}</span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Carrosserie</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{listing.bodyType || "SUV"}</span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">État</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{listing.condition}</span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Kilométrage</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {listing.mileage ? `${listing.mileage.toLocaleString()} km` : "Non spécifié"}
                </span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Transmission</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{listing.transmission}</span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Carburant</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{listing.fuelType}</span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Couleur extérieure</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{listing.color || "Non précisée"}</span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Couleur d'origine</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{listing.originalColor || "Non précisée"}</span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Type de vente</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{listing.saleType || "Vente directe"}</span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Immatriculation</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {listing.plateStatus === "WITHOUT_PLATE" || listing.vehicleOptions?.includes("Sans plaque") ? "Sans plaque" : "Avec plaque"}
                </span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Portes / Places</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {listing.doors || 4} portes • {listing.seats || 5} places
                </span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Motricité (Drivetrain)</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{listing.drivetrain || "4x4 / AWD"}</span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Position du volant</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{listing.steeringSide || "À gauche (LHD)"}</span>
              </div>
            </div>
          </div>

          {/* Features Grouped */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Équipements et options déclarés ({(listing.features?.length || 0) + (listing.isFullOptions || listing.vehicleOptions?.includes("Full options") ? 1 : 0)})
              </h2>
              {(listing.isFullOptions || listing.vehicleOptions?.includes("Full options")) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Full options</span>
                </span>
              )}
            </div>

            {((listing.features && listing.features.length > 0) || listing.isFullOptions || listing.vehicleOptions?.includes("Full options")) ? (
              <div className="flex flex-wrap gap-2">
                {(listing.isFullOptions || listing.vehicleOptions?.includes("Full options")) && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-semibold text-amber-800 dark:text-amber-300"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Full options</span>
                  </span>
                )}
                {(listing.features || []).map(feat => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                  >
                    <Check className="w-3.5 h-3.5 text-primary" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">Aucun équipement spécifique sélectionné.</p>
            )}
          </div>

          {/* Complete Seller Description */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Description rédigée par le vendeur
            </h2>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {listing.description || "Aucune description fournie par le vendeur."}
            </div>
          </div>

          {/* History & DRC Trust Information */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Historique & Transparence (Marché RDC)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-1">Origine du véhicule :</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {listing.isImported ? `Importé (Année ${listing.importYear || "N/A"})` : "Local (Déjà en RDC)"}
                </span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-1">Dédouanement :</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {listing.customsStatus || "Dédouané (Tous droits payés)"}
                </span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-1">Historique d'entretien :</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {listing.serviceHistory || "Carnet d'entretien à jour"}
                </span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-1">Historique d'accident :</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {listing.accidentHistory || "Aucun accident majeur déclaré"}
                </span>
              </div>
            </div>
          </div>

          {/* Administrative Decision History */}
          {listing.approvalHistory && listing.approvalHistory.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <History className="w-5 h-5 text-zinc-500" />
                <span>Historique des décisions de modération</span>
              </h2>

              <div className="space-y-3">
                {listing.approvalHistory.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${
                        item.action === "APPROVED" ? "text-emerald-700 dark:text-emerald-400" :
                        item.action === "REJECTED" ? "text-red-700 dark:text-red-400" :
                        "text-zinc-800 dark:text-zinc-200"
                      }`}>
                        Action : {item.action}
                      </span>
                      <span className="text-zinc-400">
                        {new Date(item.date).toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Par <span className="font-semibold">{item.adminName}</span>
                    </p>
                    {item.reason && (
                      <p className="text-red-700 dark:text-red-400 font-medium">
                        Motif : {item.reason}
                      </p>
                    )}
                    {item.comment && (
                      <p className="text-zinc-600 dark:text-zinc-400 italic">
                        Commentaire : "{item.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions Panel & Seller Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Action Decision Panel */}
          <ListingReviewActions
            listingId={listing.id}
            currentStatus={listing.status}
            title={listing.title || `${listing.year ? `${listing.year} ` : ""}${listing.make} ${listing.model}`}
          />

          {/* Seller Information Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Informations sur le vendeur
            </h3>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                {listing.seller?.type === "DEALERSHIP" ? (
                  <Store className="w-6 h-6 text-primary" />
                ) : (
                  <UserIcon className="w-6 h-6 text-zinc-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {listing.seller?.name}
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 mt-0.5">
                  {listing.seller?.type === "DEALERSHIP" ? "Concessionnaire professionnel" : "Vendeur particulier"}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>Tél : {listing.contactOptions?.callNumber || listing.seller?.phone || "Non renseigné"}</span>
              </div>
              {(listing.contactOptions?.whatsappNumber || listing.seller?.whatsapp) && (
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>WhatsApp : {listing.contactOptions?.whatsappNumber || listing.seller?.whatsapp}</span>
                </div>
              )}
              {listing.contactOptions && (
                <div className="p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-100 dark:border-zinc-800 space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">Affichage contacts acheteurs :</span>
                  <div className="flex flex-wrap gap-2">
                    <span className={listing.contactOptions.allowCalls !== false ? "text-emerald-600" : "text-zinc-400"}>
                      • Appels {listing.contactOptions.allowCalls !== false ? "actifs" : "masqués"}
                    </span>
                    <span className={listing.contactOptions.allowWhatsapp !== false ? "text-emerald-600" : "text-zinc-400"}>
                      • WhatsApp {listing.contactOptions.allowWhatsapp !== false ? "actif" : "masqué"}
                    </span>
                    <span className={listing.contactOptions.showPhoneNumber !== false ? "text-emerald-600" : "text-zinc-400"}>
                      • Numéro {listing.contactOptions.showPhoneNumber !== false ? "affiché" : "masqué"}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>{listing.seller?.location || listing.location}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>Inscrit sur Car Relais</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>{ownerListingsCount} autres annonces en ligne</span>
              </div>
            </div>

            {listing.seller?.type === "DEALERSHIP" && (
              <div className="pt-2">
                <Link
                  href={`/dealers/${listing.seller.id}`}
                  target="_blank"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  <span>Voir la vitrine concessionnaire</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
