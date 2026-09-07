import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { VehiclesPage } from "@/components/search/VehiclesPage";
import { dummyVehicles } from "@/lib/data";
import { VehicleListing } from "@/types";

export default async function Page(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;

  const {
    make, model, minPrice, maxPrice, minYear, maxYear,
    availability, transmission, fuelType, condition, sort, q,
  } = searchParams;

  let vehicles: VehicleListing[] = dummyVehicles.filter(v => v.status === "PUBLISHED");

  if (q) vehicles = vehicles.filter(v => v.title.toLowerCase().includes(q.toLowerCase()));
  if (make) vehicles = vehicles.filter(v => v.make.toLowerCase() === make.toLowerCase());
  if (model) vehicles = vehicles.filter(v => v.model.toLowerCase().includes(model.toLowerCase()));
  if (minPrice) vehicles = vehicles.filter(v => v.price >= parseInt(minPrice));
  if (maxPrice) vehicles = vehicles.filter(v => v.price <= parseInt(maxPrice));
  if (minYear) vehicles = vehicles.filter(v => v.year >= parseInt(minYear));
  if (maxYear) vehicles = vehicles.filter(v => v.year <= parseInt(maxYear));
  if (availability) vehicles = vehicles.filter(v => v.availability === availability);
  if (condition) vehicles = vehicles.filter(v => v.condition === condition);

  // Multi-value transmission & fuelType (comma-separated from URL)
  if (transmission) {
    const txList = transmission.split(",").map((s: string) => s.trim()).filter(Boolean);
    if (txList.length) vehicles = vehicles.filter(v => txList.includes(v.transmission));
  }
  if (fuelType) {
    const ftList = fuelType.split(",").map((s: string) => s.trim()).filter(Boolean);
    if (ftList.length) vehicles = vehicles.filter(v => ftList.includes(v.fuelType));
  }

  // Sorting
  switch (sort) {
    case "price_asc":  vehicles = [...vehicles].sort((a, b) => a.price - b.price); break;
    case "price_desc": vehicles = [...vehicles].sort((a, b) => b.price - a.price); break;
    case "year_desc":  vehicles = [...vehicles].sort((a, b) => b.year - a.year); break;
    case "year_asc":   vehicles = [...vehicles].sort((a, b) => a.year - b.year); break;
    case "mileage_asc": vehicles = [...vehicles].sort((a, b) => a.mileage - b.mileage); break;
    default:           vehicles = [...vehicles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const page = parseInt(searchParams.page) || 1;
  const pageSize = 12;
  const totalCount = vehicles.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedVehicles = vehicles.slice((page - 1) * pageSize, page * pageSize);

  return <VehiclesPage vehicles={paginatedVehicles} totalCount={totalCount} currentPage={page} totalPages={totalPages} />;
}
