import { pgTable, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

// Premium users (purchased via Gumroad)
// Premium is tied to GitHub username, not email
export const users = pgTable('users', {
    githubUsername: text('github_username').primaryKey(),
    email: text('email').notNull(), // For Gumroad purchase email
    isPremium: boolean('is_premium').default(false).notNull(),
    purchaseDate: timestamp('purchase_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Track analysis usage per GitHub account
// Free tier: 3 repos analyzed total
// Premium: unlimited
export const analysisUsage = pgTable('analysis_usage', {
    githubUsername: text('github_username').primaryKey(),
    reposAnalyzed: integer('repos_analyzed').default(0).notNull(),
    lastAnalyzedAt: timestamp('last_analyzed_at').defaultNow().notNull(),
});
