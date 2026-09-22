import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const R2_ENDPOINT = process.env.R2_ENDPOINT || "https://1459a5bfb6b9dfdb19628a6ada12cbd2.r2.cloudflarestorage.com";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "carrelais-media";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://images.carrelais.com";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export interface PresignedUploadResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

/**
 * Generate a secure presigned URL for direct client-to-R2 upload
 */
export async function getPresignedUploadUrl(
  filename: string,
  contentType: string,
  folder: string = "vehicles"
): Promise<PresignedUploadResult> {
  const normalizedType = contentType.toLowerCase().trim();
  if (!ALLOWED_MIME_TYPES.has(normalizedType)) {
    throw new Error(
      `Format de fichier non autorisé : ${contentType}. Formats acceptés : JPEG, PNG, WebP, AVIF.`
    );
  }

  const ext = MIME_EXTENSION_MAP[normalizedType] || "jpg";
  const uniqueId = crypto.randomUUID();
  const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
  const key = `${sanitizedFolder}/${Date.now()}-${uniqueId}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: normalizedType,
  });

  // Presigned URL valid for 5 minutes
  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
  const publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;

  return {
    uploadUrl,
    publicUrl,
    key,
  };
}

/**
 * Upload buffer directly from server to R2
 */
export async function uploadBufferToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await r2Client.send(command);
  return `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
}

/**
 * Upload a file buffer directly to Cloudflare R2 and generate public URL
 */
export async function uploadFileToR2(
  buffer: Buffer,
  filename: string,
  contentType: string,
  folder: string = "vehicles"
): Promise<{ publicUrl: string; key: string }> {
  const normalizedType = contentType.toLowerCase().trim();
  if (!ALLOWED_MIME_TYPES.has(normalizedType)) {
    throw new Error(
      `Format de fichier non autorisé : ${contentType}. Formats acceptés : JPEG, PNG, WebP, AVIF.`
    );
  }

  const ext = MIME_EXTENSION_MAP[normalizedType] || "jpg";
  const uniqueId = crypto.randomUUID();
  const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
  const key = `${sanitizedFolder}/${Date.now()}-${uniqueId}.${ext}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: normalizedType,
    })
  );

  const publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  return { publicUrl, key };
}

/**
 * Delete an object from R2
 */
export async function deleteObjectFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}
