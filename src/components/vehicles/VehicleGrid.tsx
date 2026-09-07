import { VehicleListing } from "@/types";
import { VehicleCard } from "./VehicleCard";

interface VehicleGridProps {
  vehicles: VehicleListing[];
}

export function VehicleGrid({ vehicles }: VehicleGridProps) {
  if (vehicles.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center border border-zinc-200/60 dark:border-zinc-800/50 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
        <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
        <p className="text-zinc-500 max-w-md">Try adjusting your search filters to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
