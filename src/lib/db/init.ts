import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function ensureSuperAdminInitialized(): Promise<void> {
  await connectToDatabase();

  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || "kalombograce1@gmail.com").toLowerCase().trim();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "CarRelaisAdmin2026!";

  const existing = await UserModel.findOne({ email: adminEmail });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await UserModel.create({
      email: adminEmail,
      password: hashedPassword,
      firstName: "Grace",
      lastName: "Kalombo",
      phone: "+243000000000",
      role: "SUPER_ADMIN",
      accountType: "INDIVIDUAL",
      status: "ACTIVE",
      isVerified: true,
      isEmailVerified: true,
      location: "Kinshasa, RDC",
      joinedAt: new Date().toISOString(),
    });
    console.log(`[Production Init] Super Admin ${adminEmail} initialized successfully.`);
  } else {
    let updated = false;
    if (existing.role !== "SUPER_ADMIN") {
      existing.role = "SUPER_ADMIN";
      updated = true;
    }
    if (!existing.isEmailVerified) {
      existing.isEmailVerified = true;
      existing.isVerified = true;
      updated = true;
    }
    if (updated) {
      await existing.save();
    }
  }
}
