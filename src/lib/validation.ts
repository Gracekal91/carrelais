import { z } from "zod";

export const searchParamsSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  availability: z.enum(["IN_CONGO", "IMPORT"]).optional(),
  transmission: z.enum(["Automatic", "Manual", "CVT", "Automated Manual"]).optional(),
  fuelType: z.enum(["Petrol", "Diesel", "Hybrid", "Electric", "Plug-in Hybrid"]).optional(),
  page: z.coerce.number().min(1).default(1),
});

export const vehicleListingSchema = z.object({
  title: z.string().min(5).max(100),
  make: z.string().min(2),
  model: z.string().min(2),
  year: z.coerce.number().min(1990).max(new Date().getFullYear() + 1),
  price: z.coerce.number().min(0),
  mileage: z.coerce.number().min(0),
  fuelType: z.enum(["Petrol", "Diesel", "Hybrid", "Electric", "Plug-in Hybrid"]),
  transmission: z.enum(["Automatic", "Manual", "CVT", "Automated Manual"]),
  bodyType: z.enum(["SUV", "Sedan", "Hatchback", "Pickup", "Coupe", "Van", "Wagon", "Convertible"]),
  condition: z.enum(["New", "Used"]),
  location: z.string().min(2),
  availability: z.enum(["IN_CONGO", "IMPORT"]),
  description: z.string().min(20).max(5000),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
});

export type VehicleListingInput = z.infer<typeof vehicleListingSchema>;
