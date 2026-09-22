"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Code,
  Eye,
  Loader2,
} from "lucide-react";
import { calculateReadingTime } from "@/lib/content-sanitizer";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Rédigez le contenu de l'article ici...",
  minHeight = "400px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  // Dialog states
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");

  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  // Sync editor content with incoming value prop if not active
  useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    setSourceCode(value);
  }, [value, isSourceMode]);

  const updateContent = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setSourceCode(html);
      checkActiveFormats();
    }
  }, [onChange]);

  const execCommand = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    updateContent();
    editorRef.current?.focus();
  };

  const checkActiveFormats = () => {
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
      });
    } catch {
      // ignore
    }
  };

  // Block Formatting (Heading, Paragraph, Blockquote)
  const formatBlock = (tag: "h2" | "h3" | "p" | "blockquote") => {
    execCommand("formatBlock", tag);
  };

  // Link insertion
  const openLinkDialog = () => {
    const selection = window.getSelection();
    if (selection) {
      setLinkText(selection.toString());
    }
    setLinkUrl("");
    setLinkDialogOpen(true);
  };

  const insertLink = () => {
    if (!linkUrl.trim()) return;
    const url = linkUrl.startsWith("http://") || linkUrl.startsWith("https://")
      ? linkUrl.trim()
      : `https://${linkUrl.trim()}`;

    if (linkText.trim()) {
      const html = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">${linkText}</a>`;
      execCommand("insertHTML", html);
    } else {
      execCommand("createLink", url);
    }
    setLinkDialogOpen(false);
  };

  // Image Upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "articles");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors du téléversement");
      }

      insertImageHtml(data.publicUrl, file.name);
    } catch (err: any) {
      alert("Erreur upload photo: " + (err.message || "Échec"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const insertImageHtml = (url: string, caption?: string) => {
    const captionHtml = caption
      ? `<figcaption class="text-xs text-zinc-500 text-center mt-2">${caption}</figcaption>`
      : "";
    const html = `
      <figure class="my-6 block max-w-full">
        <img src="${url}" alt="${caption || 'Image article'}" class="w-full h-auto rounded-xl object-cover shadow-sm border border-zinc-200 dark:border-zinc-800" />
        ${captionHtml}
      </figure>
      <p></p>
    `;
    execCommand("insertHTML", html);
    setImageDialogOpen(false);
  };

  const insertImageFromUrl = () => {
    if (!imageUrl.trim()) return;
    insertImageHtml(imageUrl.trim(), imageCaption.trim());
    setImageUrl("");
    setImageCaption("");
  };

  // YouTube Video Embed
  const insertVideo = () => {
    if (!videoUrl.trim()) return;

    let videoId = "";
    const url = videoUrl.trim();

    // extract standard ID or short ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      videoId = match[2];
    }

    if (!videoId) {
      alert("Format d'URL YouTube invalide. Exemple: https://www.youtube.com/watch?v=XXXXX");
      return;
    }

    const embedHtml = `
      <div class="aspect-video my-6 w-full max-w-3xl mx-auto overflow-hidden rounded-xl shadow-md">
        <iframe src="https://www.youtube-nocookie.com/embed/${videoId}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
      <p></p>
    `;
    execCommand("insertHTML", embedHtml);
    setVideoDialogOpen(false);
    setVideoUrl("");
  };

  // Word count & reading time
  const readingTime = calculateReadingTime(sourceCode);
  const wordCount = sourceCode
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xs flex flex-col">
      {/* Hidden file input for inline image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
      />

      {/* Toolbar */}
      <div className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-wrap items-center gap-1">
        {/* Headings & Paragraph */}
        <button
          type="button"
          onClick={() => formatBlock("h2")}
          title="Titre H2"
          className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatBlock("h3")}
          title="Sous-titre H3"
          className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatBlock("p")}
          title="Paragraphe normal"
          className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <Pilcrow className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Inline styles */}
        <button
          type="button"
          onClick={() => execCommand("bold")}
          title="Gras (Ctrl+B)"
          className={`p-1.5 rounded-lg transition-colors ${
            activeFormats.bold
              ? "bg-primary text-white"
              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          title="Italique (Ctrl+I)"
          className={`p-1.5 rounded-lg transition-colors ${
            activeFormats.italic
              ? "bg-primary text-white"
              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          title="Souligné (Ctrl+U)"
          className={`p-1.5 rounded-lg transition-colors ${
            activeFormats.underline
              ? "bg-primary text-white"
              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("strikeThrough")}
          title="Barré"
          className={`p-1.5 rounded-lg transition-colors ${
            activeFormats.strikeThrough
              ? "bg-primary text-white"
              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Lists & Quote */}
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          title="Liste à puces"
          className={`p-1.5 rounded-lg transition-colors ${
            activeFormats.insertUnorderedList
              ? "bg-primary text-white"
              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          title="Liste numérotée"
          className={`p-1.5 rounded-lg transition-colors ${
            activeFormats.insertOrderedList
              ? "bg-primary text-white"
              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatBlock("blockquote")}
          title="Citation"
          className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertHorizontalRule")}
          title="Ligne de séparation"
          className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Text Alignment */}
        <button
          type="button"
          onClick={() => execCommand("justifyLeft")}
          title="Aligner à gauche"
          className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyCenter")}
          title="Centrer"
          className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyRight")}
          title="Aligner à droite"
          className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Media & Links */}
        <button
          type="button"
          onClick={openLinkDialog}
          title="Insérer un lien"
          className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {/* Image upload trigger */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title="Téléverser une image"
          className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <ImageIcon className="w-4 h-4" />}
        </button>

        {/* Image via URL */}
        <button
          type="button"
          onClick={() => setImageDialogOpen(true)}
          title="Image par URL"
          className="p-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          + Image URL
        </button>

        {/* YouTube Video */}
        <button
          type="button"
          onClick={() => setVideoDialogOpen(true)}
          title="Intégrer une vidéo YouTube"
          className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <Video className="w-4 h-4" />
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          {/* HTML Source Mode toggle */}
          <button
            type="button"
            onClick={() => {
              if (isSourceMode) {
                // Switching from source back to visual
                if (editorRef.current) {
                  editorRef.current.innerHTML = sourceCode;
                }
                onChange(sourceCode);
              }
              setIsSourceMode(!isSourceMode);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              isSourceMode
                ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            {isSourceMode ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
            <span>{isSourceMode ? "Visuel" : "Code HTML"}</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative flex-1">
        {isSourceMode ? (
          <textarea
            value={sourceCode}
            onChange={(e) => {
              setSourceCode(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="Écrivez le code HTML ici..."
            style={{ minHeight }}
            className="w-full p-4 font-mono text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-900 text-zinc-100 dark:bg-zinc-950 resize-y focus:outline-none"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={updateContent}
            onKeyUp={checkActiveFormats}
            onMouseUp={checkActiveFormats}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className="w-full p-4 md:p-6 prose prose-zinc dark:prose-invert max-w-none focus:outline-none leading-relaxed text-zinc-900 dark:text-zinc-100 selection:bg-primary/20"
          />
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-zinc-800 dark:text-zinc-200">{wordCount}</strong> mots
          </span>
          <span>
            Temps de lecture estimé : <strong className="text-zinc-800 dark:text-zinc-200">{readingTime} min</strong>
          </span>
        </div>
        <div className="text-[11px] text-zinc-400">
          Astuce : Vous pouvez copier-coller du texte enrichi ou des listes
        </div>
      </div>

      {/* Link Dialog Modal */}
      {linkDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Insérer un lien hypertexte</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Texte du lien</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Ex: En savoir plus"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">URL (lien web)</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLinkDialogOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={insertLink}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-sm"
              >
                Insérer le lien
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image via URL Dialog Modal */}
      {imageDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Insérer une image par URL</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">URL de l&apos;image</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.carrelais.com/..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Légende optionnelle</label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Légende affichée sous l'image"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setImageDialogOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={insertImageFromUrl}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-sm"
              >
                Insérer l&apos;image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Embed Dialog Modal */}
      {videoDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Intégrer une vidéo YouTube</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">URL de la vidéo</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <p className="text-xs text-zinc-500">
                La vidéo sera intégrée de façon fluide et adaptative avec un format 16:9 responsive.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVideoDialogOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={insertVideo}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-sm"
              >
                Intégrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
