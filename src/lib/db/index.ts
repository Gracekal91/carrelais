import { Database, User, ExtendedVehicleListing } from "./schema";
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
    joinedAt: new Date().toISOString(),
  };

  const dealerUser: User = {
    id: "dealer_001",
    email: "dealer@example.com",
    password: "password",
    firstName: "John",
    lastName: "Doe",
    phone: "+243810000000",
    role: "USER",
    accountType: "DEALERSHIP",
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

  const individualUser: User = {
    id: "user_001",
    email: "user@example.com",
    password: "password",
    firstName: "Jane",
    lastName: "Smith",
    phone: "+243990000000",
    role: "USER",
    accountType: "INDIVIDUAL",
    location: "Lubumbashi, DRC",
    joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  };

  // Convert dummy vehicles to ExtendedVehicleListing
  const dummyVehicles = generateDummyVehicles();
  const extendedListings: ExtendedVehicleListing[] = dummyVehicles.map((v, i) => {
    const isDealer = i % 2 === 0;
    const owner = isDealer ? dealerUser : individualUser;
    
    // Generate some fake stats
    const views = Math.floor(Math.random() * 2000);
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

    return {
      ...v,
      ownerId: owner.id,
      seller: {
        id: owner.id,
        name: isDealer ? owner.dealershipName! : `${owner.firstName} ${owner.lastName}`,
        type: owner.accountType,
        isVerified: true,
        phone: owner.phone,
        whatsapp: owner.phone,
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
      status: (isDealer && (i === 10 || i === 16)) ? "SOLD" : (v.status as any),
    };
  });

  global.__db = {
    users: [adminUser, dealerUser, individualUser],
    listings: extendedListings,
  };
}

export const db = global.__db!;
