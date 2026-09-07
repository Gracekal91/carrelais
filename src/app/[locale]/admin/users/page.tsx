import { db } from "@/lib/db";
import { User, Store } from "lucide-react";

export default function AdminUsersPage() {
  const users = db.users;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Users</h1>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-4 font-medium text-sm text-zinc-500">Name</th>
                <th className="p-4 font-medium text-sm text-zinc-500">Account Type</th>
                <th className="p-4 font-medium text-sm text-zinc-500">Contact</th>
                <th className="p-4 font-medium text-sm text-zinc-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="p-4">
                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                    {user.accountType === "DEALERSHIP" && (
                      <p className="text-xs text-primary font-medium">{user.dealershipName}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-sm">
                      {user.accountType === "DEALERSHIP" ? <Store className="w-4 h-4 text-zinc-400" /> : <User className="w-4 h-4 text-zinc-400" />}
                      {user.accountType}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <p>{user.email}</p>
                    <p className="text-zinc-500">{user.phone}</p>
                  </td>
                  <td className="p-4 text-sm text-zinc-500">
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
