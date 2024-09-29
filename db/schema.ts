import { pgTable, text } from "drizzle-orm/pg-core";

// the fields inside "" are how they will appear in the db
export const accounts = pgTable("accounts", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    userId: text("user_id").notNull(),
})

