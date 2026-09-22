"use client";

import React, { useState } from "react";
import { Share2, Check, Copy, MessageCircle } from "lucide-react";

interface ArticleShareButtonsProps {
  title: string;
  url: string;
  locale: string;
}

export default function ArticleShareButtons({
  title,
  url,
  locale,
}: ArticleShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const isEn = locale === "en";

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(url || window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // ignore
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold text-zinc-500 flex items-center gap-1.5 mr-1">
        <Share2 className="w-3.5 h-3.5" />
        <span>{isEn ? "Share:" : "Partager :"}</span>
      </span>

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Partager sur WhatsApp"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>WhatsApp</span>
      </a>

      {/* Facebook */}
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Partager sur Facebook"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors"
      >
        <span>Facebook</span>
      </a>

      {/* X / Twitter */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Partager sur X"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors"
      >
        <span>X</span>
      </a>

      {/* LinkedIn */}
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Partager sur LinkedIn"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold transition-colors"
      >
        <span>LinkedIn</span>
      </a>

      {/* Copy link button */}
      <button
        type="button"
        onClick={handleCopyLink}
        title="Copier le lien"
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-green-500" />
            <span className="text-green-600 dark:text-green-400">
              {isEn ? "Copied!" : "Lien copié !"}
            </span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-zinc-500" />
            <span>{isEn ? "Copy link" : "Copier"}</span>
          </>
        )}
      </button>
    </div>
  );
}
