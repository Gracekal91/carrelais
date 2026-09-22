"use client";

import React from "react";
import { VehicleStatus } from "@/types";
import { useTranslations } from "next-intl";
import { Clock, CheckCircle2, XCircle, AlertOctagon, Archive, FileText, Ban } from "lucide-react";

interface ListingStatusBadgeProps {
  status: VehicleStatus;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export default function ListingStatusBadge({
  status,
  size = "sm",
  showIcon = true,
}: ListingStatusBadgeProps) {
  const t = useTranslations("AdminPortal.statuses");

  const config: Record<
    VehicleStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    PUBLISHED: {
      label: t("PUBLISHED"),
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-900/50",
      icon: CheckCircle2,
    },
    PENDING_REVIEW: {
      label: t("PENDING_REVIEW"),
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-800 dark:text-amber-400 font-semibold",
      border: "border-amber-300 dark:border-amber-800/60",
      icon: Clock,
    },
    REJECTED: {
      label: t("REJECTED"),
      bg: "bg-red-50 dark:bg-red-950/40",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-900/50",
      icon: XCircle,
    },
    SOLD: {
      label: t("SOLD"),
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-900/50",
      icon: Archive,
    },
    SUSPENDED: {
      label: t("SUSPENDED"),
      bg: "bg-purple-50 dark:bg-purple-950/40",
      text: "text-purple-700 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-900/50",
      icon: Ban,
    },
    DRAFT: {
      label: t("DRAFT"),
      bg: "bg-zinc-100 dark:bg-zinc-800/60",
      text: "text-zinc-600 dark:text-zinc-400",
      border: "border-zinc-300 dark:border-zinc-700",
      icon: FileText,
    },
    EXPIRED: {
      label: t("EXPIRED"),
      bg: "bg-zinc-100 dark:bg-zinc-800/60",
      text: "text-zinc-500 dark:text-zinc-400",
      border: "border-zinc-300 dark:border-zinc-700",
      icon: AlertOctagon,
    },
  };

  const current = config[status] || {
    label: status,
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-700 dark:text-zinc-300",
    border: "border-zinc-200 dark:border-zinc-700",
    icon: FileText,
  };

  const Icon = current.icon;
  const sizeClasses = size === "md" ? "px-3 py-1 text-xs gap-1.5" : "px-2.5 py-0.5 text-[11px] gap-1";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      {showIcon && <Icon className={size === "md" ? "w-3.5 h-3.5" : "w-3 h-3"} />}
      <span>{current.label}</span>
    </span>
  );
}
