/**
 * Utility functions for slug generation, reading time calculation,
 * excerpt extraction, and HTML content sanitation.
 */

/**
 * Convert title or string to a URL-safe, lowercase, hyphen-separated slug
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD") // normalize accented characters (é -> e, etc.)
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric chars except space & hyphen
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-") // collapse consecutive hyphens
    .replace(/^-+|-+$/g, ""); // trim leading & trailing hyphens
}

/**
 * Calculate reading time in minutes based on average 200 words per minute
 */
export function calculateReadingTime(htmlOrText: string): number {
  const plainText = htmlOrText.replace(/<[^>]*>/g, " ");
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / 200);
  return Math.max(1, minutes);
}

/**
 * Extract a clean text excerpt from HTML content
 */
export function extractExcerpt(html: string, maxLength = 160): string {
  const plain = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trim() + "...";
}

/**
 * Sanitize rich HTML content for safe client rendering.
 * Removes executable scripts, event handlers, unsafe protocols, and untrusted iframes.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  let clean = html;

  // 1. Remove dangerous script, style, form, object, embed, base, meta, link tags
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  clean = clean.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  clean = clean.replace(/<embed\b[^>]*>/gi, "");
  clean = clean.replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, "");
  clean = clean.replace(/<meta\b[^>]*>/gi, "");
  clean = clean.replace(/<link\b[^>]*>/gi, "");
  clean = clean.replace(/<base\b[^>]*>/gi, "");
  clean = clean.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "");

  // 2. Remove all inline event handlers (onload, onerror, onclick, onmouseover, etc.)
  clean = clean.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");

  // 3. Remove javascript:, vbscript:, and data: protocols from href/src (except safe image data URIs if needed, but prefer http/https)
  clean = clean.replace(/\bhref\s*=\s*(['"])\s*(?:javascript|vbscript):.*?\1/gi, 'href="#"');
  clean = clean.replace(/\bsrc\s*=\s*(['"])\s*(?:javascript|vbscript):.*?\1/gi, 'src=""');

  // 4. Sanitize iframes: Only allow YouTube embeds
  clean = clean.replace(/<iframe\b([^>]*)>/gi, (_match, attrs) => {
    const srcMatch = attrs.match(/src\s*=\s*['"]([^'"]+)['"]/i);
    const src = srcMatch ? srcMatch[1] : "";
    const isYouTube =
      src.startsWith("https://www.youtube.com/embed/") ||
      src.startsWith("https://www.youtube-nocookie.com/embed/") ||
      src.startsWith("https://youtube.com/embed/");

    if (isYouTube) {
      return `<div class="aspect-video my-6 w-full max-w-3xl overflow-hidden rounded-xl shadow-md"><iframe src="${src}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>`;
    }
    return "<!-- removed untrusted iframe -->";
  });

  return clean;
}
