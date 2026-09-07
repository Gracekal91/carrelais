import { Seller, VehicleListing } from "@/types";

const SELLERS: Seller[] = [
  {
    id: "s1",
    name: "Premium Cars DRC",
    type: "DEALERSHIP",
    isVerified: true,
    location: "Kinshasa, DRC",
    phone: "+243810000000",
    whatsapp: "+243810000000",
    joinedAt: "2023-01-15T00:00:00Z",
  },
  {
    id: "s2",
    name: "Dubai Auto Imports",
    type: "DEALERSHIP",
    isVerified: true,
    location: "Dubai, UAE",
    phone: "+971500000000",
    whatsapp: "+971500000000",
    joinedAt: "2023-03-10T00:00:00Z",
  },
  {
    id: "s3",
    name: "Jean-Claude Mutombo",
    type: "INDIVIDUAL",
    isVerified: true,
    location: "Lubumbashi, DRC",
    phone: "+243990000000",
    whatsapp: "+243990000000",
    joinedAt: "2023-06-20T00:00:00Z",
  },
];

const CAR_IMAGES = [
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=800&q=80",
];

export const generateDummyVehicles = (): VehicleListing[] => {
  const makes = ["Toyota", "Lexus", "Mercedes-Benz", "BMW", "Hyundai", "Kia", "Nissan", "Volkswagen", "Ford", "Land Rover"];
  const models: Record<string, string[]> = {
    Toyota: ["RAV4", "Corolla", "Land Cruiser", "Hilux", "Camry"],
    Lexus: ["RX 350", "LX 570", "IS 250"],
    "Mercedes-Benz": ["C-Class", "GLE", "G-Class"],
    BMW: ["X5", "3 Series", "X3"],
    Hyundai: ["Tucson", "Santa Fe", "Elantra"],
    Kia: ["Sportage", "Sorento"],
    Nissan: ["Patrol", "X-Trail", "Navara"],
    Volkswagen: ["Touareg", "Golf", "Tiguan"],
    Ford: ["Ranger", "Everest", "F-150"],
    "Land Rover": ["Range Rover", "Defender", "Discovery"],
  };

  const vehicles: VehicleListing[] = [];

  for (let i = 1; i <= 50; i++) {
    const make = makes[Math.floor(Math.random() * makes.length)];
    const model = models[make][Math.floor(Math.random() * models[make].length)];
    const year = 2010 + Math.floor(Math.random() * 14); // 2010 to 2023
    const price = 10000 + Math.floor(Math.random() * 90000); // 10k to 100k
    
    // 70% in congo, 30% import
    const availability = Math.random() > 0.3 ? "IN_CONGO" : "IMPORT";
    const seller = availability === "IN_CONGO" 
      ? (Math.random() > 0.5 ? SELLERS[0] : SELLERS[2])
      : SELLERS[1];
      
    const location = availability === "IN_CONGO" 
      ? (Math.random() > 0.7 ? "Lubumbashi, DRC" : "Kinshasa, DRC")
      : "Dubai, UAE";

    vehicles.push({
      id: `v${i}`,
      slug: `${make.toLowerCase()}-${model.toLowerCase().replace(/ /g, "-")}-${year}-v${i}`,
      title: `${make} ${model} ${year}`,
      make,
      model,
      year,
      price,
      currency: "USD",
      mileage: Math.floor(Math.random() * 150000),
      fuelType: Math.random() > 0.5 ? "Petrol" : "Diesel",
      transmission: Math.random() > 0.2 ? "Automatic" : "Manual",
      bodyType: "SUV", // Simplify for dummy data
      condition: "Used",
      location,
      availability,
      description: `Well maintained ${year} ${make} ${model}. Excellent condition, full service history.`,
      images: [CAR_IMAGES[i % CAR_IMAGES.length]],
      seller,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updatedAt: new Date().toISOString(),
      status: "PUBLISHED",
      isFeatured: i <= 5,
      isVerified: true,
      engineSize: "2.5L",
      color: "White"
    });
  }
  
  return vehicles;
};
