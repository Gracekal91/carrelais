import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Cet endpoint est déprécié. Veuillez rafraîchir la page pour utiliser l'upload direct." },
    { status: 410 }
  );
}
