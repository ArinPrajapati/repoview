import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    email: text('email').primaryKey(),
    isPremium: boolean('is_premium').default(false).notNull(),
    purchaseDate: timestamp('purchase_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
