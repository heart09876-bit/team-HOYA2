import { sqliteTable, text } from "drizzle-orm/sqlite-core";
export const sites = sqliteTable("sites", {id:text("id").primaryKey(),data:text("data").notNull(),updatedAt:text("updated_at").notNull()});
