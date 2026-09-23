/**
 * Centralized URL helper for Car Relais.
 * Guarantees consistent HTTPS absolute production URLs,
 * preventing accidental localhost or insecure http:// generation in SEO metadata.
 */
export function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && !envUrl.includes("localhost") && !envUrl.startsWith("http://")) {
    return envUrl.replace(/\/+$/, "");
  }
  return "https://carrelais.com";
}
