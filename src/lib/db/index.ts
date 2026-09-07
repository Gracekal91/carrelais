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
    location: "Kinshasa, DRC",
    description: "Best cars in town",
    joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
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
      status: v.status as any, // keep original status
    };
  });

  global.__db = {
    users: [adminUser, dealerUser, individualUser],
    listings: extendedListings,
  };
}

export const db = global.__db!;
