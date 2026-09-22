import { VehiclesPage } from "@/components/search/VehiclesPage";
import { getPublishedVehicles } from "@/lib/data";

export default async function Page(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const { vehicles, totalCount, currentPage, totalPages } = await getPublishedVehicles(searchParams);

  return (
    <VehiclesPage
      vehicles={vehicles}
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}
