import { Database } from "./schema";

/**
 * In-memory db deprecated in favor of live MongoDB Atlas.
 * Retained as empty typed fallback to prevent legacy reference errors.
 */
export const db: Database = {
  users: [],
  listings: [],
  reports: [],
  auditLogs: [],
};
