import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

// Example schema - customize for your application
export const examples = pgTable('examples', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Add your tables here
