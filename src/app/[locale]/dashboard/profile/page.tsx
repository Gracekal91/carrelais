import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DealerProfileView from "@/components/dashboard/DealerProfileView";
import { connectToDatabase } from "@/lib/mongodb";
import { ListingModel } from "@/lib/models/Listing";
import { formatListing } from "@/lib/data";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return redirect("/signin");

  await connectToDatabase();

  // Fetch listings owned by this user from MongoDB
  const [activeDocs, soldDocs] = await Promise.all([
    ListingModel.find({ ownerId: user.id, status: "PUBLISHED" }).sort({ createdAt: -1 }).lean(),
    ListingModel.find({ ownerId: user.id, status: "SOLD" }).sort({ createdAt: -1 }).lean(),
  ]);

  const activeListings = activeDocs.map(formatListing);
  const soldListings = soldDocs.map(formatListing);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <DealerProfileView
        user={user}
        activeListings={activeListings}
        soldListings={soldListings}
        isOwner={true}
      />
    </div>
  );
}
