"use client";

import PostCarPage from "@/app/[locale]/dashboard/listings/create/page";

export default function AdminDashboardCreateListingPage() {
  return <PostCarPage isAdminPortal={true} redirectOnSuccess="/admin/listings" />;
}
