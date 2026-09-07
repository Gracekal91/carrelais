import { cookies } from "next/headers";
import { db } from "./db";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("mock_user_id")?.value;
  
  if (!userId) return null;
  
  const user = db.users.find(u => u.id === userId);
  return user || null;
}
