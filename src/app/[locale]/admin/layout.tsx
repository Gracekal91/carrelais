import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ListingModel } from "@/lib/models/Listing";
import { ReportModel } from "@/lib/models/Report";
import { UserModel } from "@/lib/models/User";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/signin");
  }

  // Calculate live notification badges from MongoDB Atlas
  await connectToDatabase();
  const [pendingListingsCount, newReportsCount, unverifiedDealersCount] = await Promise.all([
    ListingModel.countDocuments({ status: "PENDING_REVIEW" }),
    ReportModel.countDocuments({ status: "NEW" }),
    UserModel.countDocuments({ accountType: "DEALERSHIP", isVerified: false }),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row text-zinc-900 dark:text-zinc-100">
      {/* Sidebar with Navigation */}
      <AdminNav
        userName={`${user.firstName} ${user.lastName}`}
        pendingListingsCount={pendingListingsCount}
        newReportsCount={newReportsCount}
        unverifiedDealersCount={unverifiedDealersCount}
      />

      {/* Main Administrative Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
