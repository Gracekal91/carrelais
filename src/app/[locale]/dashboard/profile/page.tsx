import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import DealerProfileView from "@/components/dashboard/DealerProfileView";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return redirect("/signin");

  // Fetch listings owned by this user
  const activeListings = db.listings.filter(
    l => l.ownerId === user.id && l.status === "PUBLISHED"
  );
  const soldListings = db.listings.filter(
    l => l.ownerId === user.id && l.status === "SOLD"
  );

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
