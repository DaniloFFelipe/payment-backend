import { randomUUID } from 'node:crypto'
import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth-schema'

export const userWebhooks = pgTable('user_webhooks', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),

  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  completionPurchaseWebhookUrl: text(
    'completion_purchase_webhook_url'
  ).notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
})

export const userWebhooksRelation = relations(userWebhooks, ({ one }) => ({
  user: one(user, {
    fields: [userWebhooks.userId],
    references: [user.id],
  }),
}))
