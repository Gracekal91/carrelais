import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadFileToR2 } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentification requise pour téléverser des photos" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "vehicles";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Fichier requis" },
        { status: 400 }
      );
    }

    // Maximum file size: 15MB
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "La taille maximale par photo est de 15 Mo" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadFileToR2(
      buffer,
      file.name,
      file.type || "image/jpeg",
      folder
    );

    return NextResponse.json({
      success: true,
      publicUrl: result.publicUrl,
      key: result.key,
    });
  } catch (error: any) {
    console.error("[Upload API Route Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors du téléversement de la photo" },
      { status: 500 }
    );
  }
}
