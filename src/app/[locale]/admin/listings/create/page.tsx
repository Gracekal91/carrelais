"use client";

import PostCarPage from "@/app/[locale]/dashboard/listings/create/page";

export default function AdminListingsCreatePage() {
  return <PostCarPage isAdminPortal={true} redirectOnSuccess="/admin/listings" />;
}
