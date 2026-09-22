import { Database, User, ExtendedVehicleListing, MarketplaceReport, AdminAuditLog } from "./schema";
import { generateDummyVehicles } from "../dummy-data";

declare global {
  var __db: Database | undefined;
}

if (!global.__db) {
  const adminUser: User = {
    id: "admin_001",
    email: "admin@carrelais.com",
    password: "password",
    firstName: "Super",
    lastName: "Admin",
    phone: "+243000000000",
    role: "ADMIN",
    accountType: "INDIVIDUAL",
    status: "ACTIVE",
    joinedAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const dealerUser1: User = {
    id: "dealer_001",
    email: "dealer@example.com",
    password: "password",
    firstName: "John",
    lastName: "Doe",
    phone: "+243810000000",
    role: "USER",
    accountType: "DEALERSHIP",
    status: "ACTIVE",
    dealershipName: "Premium Cars DRC",
    location: "Kinshasa, RDC",
    city: "Kinshasa",
    commune: "Gombe",
    address: "Boulevard du 30 Juin, Gombe, Kinshasa",
    description: "Best cars in town. Premium Cars DRC est votre concessionnaire de référence en République Démocratique du Congo pour l'achat, la vente et l'importation de véhicules certifiés et garantis.",
    logo: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=200&q=80",
    joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    isVerified: true,
    whatsapp: "+243810000000",
    foundedYear: 2018,
    businessHours: {
      monday: "08:00 – 18:00",
      tuesday: "08:00 – 18:00",
      wednesday: "08:00 – 18:00",
      thursday: "08:00 – 18:00",
      friday: "08:00 – 18:00",
      saturday: "09:00 – 16:00",
      sunday: "Fermé",
    },
    website: "https://premiumcars-drc.com",
    facebook: "https://facebook.com/premiumcarsdrc",
    instagram: "https://instagram.com/premiumcarsdrc",
  };

  const dealerUser2: User = {
    id: "dealer_002",
    email: "contact@kinshasa-auto.cd",
    password: "password",
    firstName: "Serge",
    lastName: "Mukendi",
    phone: "+243821234567",
    role: "USER",
    accountType: "DEALERSHIP",
    status: "ACTIVE",
    dealershipName: "Kinshasa Auto Motors",
    location: "Limete, Kinshasa, RDC",
    city: "Kinshasa",
    commune: "Limete",
    address: "7ème Rue Industrielle, Limete",
    description: "Spécialiste de la vente de berlines japonaises et 4x4 d'occasion vérifiés à Kinshasa.",
    logo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=200&q=80",
    joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    isVerified: false, // Awaiting verification
    whatsapp: "+243821234567",
    foundedYear: 2021,
    website: "https://kinshasa-auto.cd",
  };

  const dealerUser3: User = {
    id: "dealer_003",
    email: "info@congoprestige.cd",
    password: "password",
    firstName: "Alain",
    lastName: "Kasongo",
    phone: "+243970001122",
    role: "USER",
    accountType: "DEALERSHIP",
    status: "ACTIVE",
    dealershipName: "Congo Prestige Motors",
    location: "Lubumbashi, RDC",
    city: "Lubumbashi",
    commune: "Lubumbashi",
    address: "Avenue Kasa-Vubu, Lubumbashi",
    description: "Concessionnaire exclusif de véhicules haut de gamme et utilitaires miniers dans le Grand Katanga.",
    logo: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=200&q=80",
    joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    isVerified: true,
    whatsapp: "+243970001122",
    foundedYear: 2019,
    website: "https://congoprestige.cd",
  };

  const individualUser1: User = {
    id: "user_001",
    email: "user@example.com",
    password: "password",
    firstName: "Jane",
    lastName: "Smith",
    phone: "+243990000000",
    role: "USER",
    accountType: "INDIVIDUAL",
    status: "ACTIVE",
    location: "Kinshasa, RDC",
    joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const individualUser2: User = {
    id: "user_002",
    email: "patrick.kalala@gmail.com",
    password: "password",
    firstName: "Patrick",
    lastName: "Kalala",
    phone: "+243851122334",
    role: "USER",
    accountType: "INDIVIDUAL",
    status: "ACTIVE",
    location: "Goma, RDC",
    joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const individualUser3: User = {
    id: "user_003",
    email: "marc.tshisekedi@outlook.com",
    password: "password",
    firstName: "Marc",
    lastName: "Tshisekedi",
    phone: "+243899988776",
    role: "USER",
    accountType: "INDIVIDUAL",
    status: "SUSPENDED",
    location: "Kinshasa, RDC",
    joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  };

  // Convert dummy vehicles to ExtendedVehicleListing
  const dummyVehicles = generateDummyVehicles();
  const extendedListings: ExtendedVehicleListing[] = dummyVehicles.map((v, i) => {
    let owner: User;
    if (i % 4 === 0) owner = dealerUser1;
    else if (i % 4 === 1) owner = dealerUser2;
    else if (i % 4 === 2) owner = dealerUser3;
    else if (i % 8 === 3) owner = individualUser2;
    else if (i % 8 === 7) owner = individualUser3;
    else owner = individualUser1;

    const isDealer = owner.accountType === "DEALERSHIP";
    
    // Stats
    const views = Math.floor(Math.random() * 2000) + 50;
    const contacts = Math.floor(views * 0.05);
    const chats = Math.floor(contacts * 0.6);
    const phoneClicks = contacts - chats;

    const dailyStats = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      dailyStats.push({
        date: date.toISOString().split("T")[0],
        views: Math.floor(views / 7) + Math.floor(Math.random() * 10 - 5),
        contacts: Math.floor(contacts / 7) + Math.floor(Math.random() * 2),
      });
    }

    // Assign realistic moderation statuses across the collection
    let status: ExtendedVehicleListing["status"] = "PUBLISHED";
    let rejectionReason: string | undefined = undefined;
    let rejectionComment: string | undefined = undefined;
    let approvalHistory: ExtendedVehicleListing["approvalHistory"] = [
      {
        date: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
        adminName: "Super Admin",
        action: "APPROVED",
      }
    ];

    if (i === 1 || i === 4 || i === 8) {
      status = "PENDING_REVIEW";
      approvalHistory = [
        {
          date: new Date(Date.now() - (i * 2 + 1) * 3600000).toISOString(),
          adminName: "Système",
          action: "SUBMITTED",
        }
      ];
    } else if (i === 5) {
      status = "REJECTED";
      rejectionReason = "Photos insuffisantes ou floues";
      rejectionComment = "Veuillez téléverser au minimum 4 photos nettes montrant l'avant, l'arrière et l'habitacle complet du véhicule.";
      approvalHistory = [
        {
          date: new Date(Date.now() - 48 * 3600000).toISOString(),
          adminName: "Système",
          action: "SUBMITTED",
        },
        {
          date: new Date(Date.now() - 24 * 3600000).toISOString(),
          adminName: "Super Admin",
          action: "REJECTED",
          reason: rejectionReason,
          comment: rejectionComment,
        }
      ];
    } else if (i === 12) {
      status = "REJECTED";
      rejectionReason = "Prix manifestement incorrect ou incohérent";
      rejectionComment = "Le prix mentionné ($1,200) ne correspond manifestement pas à la valeur de ce véhicule. Merci de corriger.";
      approvalHistory = [
        {
          date: new Date(Date.now() - 72 * 3600000).toISOString(),
          adminName: "Système",
          action: "SUBMITTED",
        },
        {
          date: new Date(Date.now() - 36 * 3600000).toISOString(),
          adminName: "Super Admin",
          action: "REJECTED",
          reason: rejectionReason,
          comment: rejectionComment,
        }
      ];
    } else if (i === 10 || i === 16) {
      status = "SOLD";
    } else if (i === 14) {
      status = "SUSPENDED";
      approvalHistory = [
        {
          date: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
          adminName: "Super Admin",
          action: "APPROVED",
        },
        {
          date: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
          adminName: "Super Admin",
          action: "SUSPENDED",
          reason: "Signalement d'irrégularité en cours d'investigation.",
        }
      ];
    }

    return {
      ...v,
      ownerId: owner.id,
      seller: {
        id: owner.id,
        name: isDealer ? owner.dealershipName! : `${owner.firstName} ${owner.lastName}`,
        type: owner.accountType,
        isVerified: !!owner.isVerified,
        phone: owner.phone,
        whatsapp: owner.whatsapp || owner.phone,
        location: owner.location,
        joinedAt: owner.joinedAt,
      },
      views,
      contacts,
      chats,
      phoneClicks,
      dailyStats,
      isNegotiable: Math.random() > 0.5,
      financeAvailable: isDealer && Math.random() > 0.5,
      status,
      rejectionReason,
      rejectionComment,
      approvalHistory,
    };
  });

  const reports: MarketplaceReport[] = [
    {
      id: "rep_001",
      type: "MISLEADING_PRICE",
      targetType: "LISTING",
      targetId: extendedListings[0]?.id || "l_001",
      targetTitle: `${extendedListings[0]?.year} ${extendedListings[0]?.make} ${extendedListings[0]?.model}`,
      reason: "Le prix indiqué semble anormalement bas par rapport à la cote du marché congolais. Risque potentiel d'acompte frauduleux.",
      reporterEmail: "acheteur.kin@gmail.com",
      sellerId: extendedListings[0]?.ownerId,
      sellerName: extendedListings[0]?.seller?.name,
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      status: "NEW",
    },
    {
      id: "rep_002",
      type: "INCORRECT_INFO",
      targetType: "LISTING",
      targetId: extendedListings[2]?.id || "l_003",
      targetTitle: `${extendedListings[2]?.year} ${extendedListings[2]?.make} ${extendedListings[2]?.model}`,
      reason: "Le kilométrage dans la fiche indique 60 000 km, mais sur la photo du tableau de bord le compteur affiche 160 000 km.",
      reporterEmail: "m.tshimanga@yahoo.fr",
      sellerId: extendedListings[2]?.ownerId,
      sellerName: extendedListings[2]?.seller?.name,
      createdAt: new Date(Date.now() - 15 * 3600000).toISOString(),
      status: "NEW",
    },
    {
      id: "rep_003",
      type: "ALREADY_SOLD",
      targetType: "LISTING",
      targetId: extendedListings[10]?.id || "l_011",
      targetTitle: `${extendedListings[10]?.year} ${extendedListings[10]?.make} ${extendedListings[10]?.model}`,
      reason: "Véhicule déjà vendu la semaine dernière chez le concessionnaire.",
      reporterEmail: "temoin.auto@gmail.com",
      sellerId: extendedListings[10]?.ownerId,
      sellerName: extendedListings[10]?.seller?.name,
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
      status: "RESOLVED",
      resolvedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
      resolvedBy: "Super Admin",
      resolutionNote: "Statut de l'annonce actualisé vers VENDU.",
    },
  ];

  const auditLogs: AdminAuditLog[] = [
    {
      id: "audit_001",
      adminId: "admin_001",
      adminName: "Super Admin",
      action: "LISTING_APPROVED",
      targetType: "LISTING",
      targetId: extendedListings[0]?.id || "l_001",
      targetLabel: `${extendedListings[0]?.year} ${extendedListings[0]?.make} ${extendedListings[0]?.model}`,
      details: "Annonce validée après vérification des documents de douane.",
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: "audit_002",
      adminId: "admin_001",
      adminName: "Super Admin",
      action: "DEALER_VERIFIED",
      targetType: "DEALER",
      targetId: "dealer_003",
      targetLabel: "Congo Prestige Motors",
      details: "Documents RCCM et Id. Nat. vérifiés.",
      timestamp: new Date(Date.now() - 18 * 3600000).toISOString(),
    },
    {
      id: "audit_003",
      adminId: "admin_001",
      adminName: "Super Admin",
      action: "LISTING_REJECTED",
      targetType: "LISTING",
      targetId: extendedListings[5]?.id || "l_006",
      targetLabel: `${extendedListings[5]?.year} ${extendedListings[5]?.make} ${extendedListings[5]?.model}`,
      details: "Motif: Photos insuffisantes ou floues.",
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: "audit_004",
      adminId: "admin_001",
      adminName: "Super Admin",
      action: "USER_SUSPENDED",
      targetType: "USER",
      targetId: "user_003",
      targetLabel: "Marc Tshisekedi",
      details: "Multiples signalements d'annonces suspectes.",
      timestamp: new Date(Date.now() - 72 * 3600000).toISOString(),
    },
  ];

  global.__db = {
    users: [adminUser, dealerUser1, dealerUser2, dealerUser3, individualUser1, individualUser2, individualUser3],
    listings: extendedListings,
    reports,
    auditLogs,
  };
}

export const db = global.__db!;
