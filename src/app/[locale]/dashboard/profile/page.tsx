import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { User, Store, MapPin, Mail, Phone } from "lucide-react";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0">
            {user.accountType === "DEALERSHIP" ? <Store className="w-10 h-10 text-zinc-400" /> : <User className="w-10 h-10 text-zinc-400" />}
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <h2 className="text-2xl font-bold">{user.accountType === "DEALERSHIP" ? user.dealershipName : `${user.firstName} ${user.lastName}`}</h2>
              <p className="text-primary font-medium">{user.accountType === "DEALERSHIP" ? "Verified Dealership" : "Private Seller"}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> {user.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> {user.phone}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {user.location || "Location not provided"}
              </div>
            </div>

            {user.accountType === "DEALERSHIP" && user.description && (
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">About Dealership</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.description}</p>
              </div>
            )}
            
            <div className="pt-4">
              <button className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
