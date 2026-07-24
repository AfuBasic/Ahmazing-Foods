import { pgTable, serial, text, date, timestamp, unique } from "drizzle-orm/pg-core";

export const specialsVotesTable = pgTable(
  "specials_votes",
  {
    id: serial("id").primaryKey(),
    specialName: text("special_name").notNull(),
    weekOf: date("week_of", { mode: "string" }).notNull(), // Monday of the voting week
    voterPhone: text("voter_phone").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("specials_votes_week_phone_unique").on(table.weekOf, table.voterPhone),
  ]
);
