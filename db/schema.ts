import { relations } from "drizzle-orm"
import { pgTable, text, integer, timestamp, serial, boolean } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

// the fields inside "" are how they will appear in the db
// property name: column definition
// how to access in this codebase: is how it appears in the actual db
export const accounts = pgTable("accounts", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    userId: text("user_id").notNull(),
})

export const insertAccountSchema = createInsertSchema(accounts)

export const categories = pgTable("categories", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    userId: text("user_id").notNull(),
})
    
export const insertCategorySchema = createInsertSchema(categories)

export const transactions = pgTable("transactions", {
    id: text("id").primaryKey(),
    amount: integer("amount").notNull(),
    payee: text("payee").notNull(),
    notes: text("notes"),
    date: timestamp("date", { mode: "date" }).notNull(),
    accountId: text("account_id")
      .references(() => accounts.id, {
        onDelete: "cascade",
      })
      .notNull(),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
})

export const accountsRelations = relations(accounts, ({ many }) => ({
    transactions: many(transactions),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
    transactions: many(transactions),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
    account: one(accounts, {
      fields: [transactions.accountId],
      references: [accounts.id],
    }),
    categories: one(categories, {
      fields: [transactions.categoryId],
      references: [categories.id],
    }),
}))
  
export const insertTransactionSchema = createInsertSchema(transactions, {
    date: z.coerce.date(),
})

// the users amongst which the splits are created
export const users = pgTable("users", {
  user_id: serial("id").primaryKey(),
  name: text("name").notNull()
})

export const insertUserSchema = createInsertSchema(users)

// each split collection created for some travel/vacation
export const groups = pgTable('groups', {
  group_id: serial('group_id').primaryKey(),
  name: text('name').notNull(),
})

export const insertGroupSchema = createInsertSchema(groups)

// which all users are present in which group
export const groupMembers = pgTable('group_members', {
  member_id: serial('member_id').primaryKey(),
  group_id: integer('group_id').references(() => groups.group_id).notNull(),
  user_id: integer('user_id').references(() => users.user_id).notNull(),
})

export const insertGroupMembersSchema = createInsertSchema(groupMembers)

// the complete payment that is done by a user
export const split_transactions = pgTable('split_transactions', {
  transaction_id: serial('transaction_id').primaryKey(),
  payer_id: integer('payer_id').references(() => users.user_id).notNull(),
  group_id: integer('group_id').references(() => groups.group_id).notNull(),
  total_amount: integer('total_amount').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  status: text('status').notNull().default('pending'),
})

export const insertSplitTransactionsSchema = createInsertSchema(split_transactions)

// a transaction is supposed to be split amongst which users
export const splits = pgTable('splits', {
  split_id: serial('split_id').primaryKey(),
  transaction_id: integer('transaction_id').references(() => split_transactions.transaction_id).notNull(),
  user_id: integer('user_id').references(() => users.user_id).notNull(),  // FK to Users table for each user’s individual split
  split_amount: integer('split_amount').notNull(),
  paid: boolean('paid').notNull().default(false),
})

export const insertSplitsSchema = createInsertSchema(splits)



export const usersRelations = relations(users, ({ many }) => ({
  groupMembers: many(groupMembers),
  splitTransactions: many(split_transactions), // each user can create multilpe splits
  splits: many(splits), // each user might have to pay multiple splits
}))

export const groupsRelations = relations(groups, ({ many }) => ({
  groupMembers: many(groupMembers),
  splitTransactions: many(split_transactions),
}))

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  user: one(users, {
    fields: [groupMembers.user_id],
    references: [users.user_id],
  }),
  group: one(groups, {
    fields: [groupMembers.group_id],
    references: [groups.group_id],
  }),
}))

export const splitTransactionsRelations = relations(split_transactions, ({ one, many }) => ({
  splits: many(splits),
  payer: one(users, {
    fields: [split_transactions.payer_id],
    references: [users.user_id],
  }), // the user who made/created the payment
  group: one(groups, {
    fields: [split_transactions.group_id],
    references: [groups.group_id],
  }),
}))

export const splitsRelations = relations(splits, ({ one }) => ({
  transaction: one(split_transactions, {
    fields: [splits.transaction_id],
    references: [split_transactions.transaction_id],
  }),
  user: one(users, {
    fields: [splits.user_id],
    references: [users.user_id],
  }),
}))
