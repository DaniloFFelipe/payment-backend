import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'
import { user } from './auth-schema'

export const apiKeys = pgTable(
  'api_keys',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),

    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    name: text('name').notNull(),

    key: text('key')
      .notNull()
      .$defaultFn(() => `api-key_${ulid()}`),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  table => [uniqueIndex('api_key_key_unique').on(table.key)]
)

export const apiKeysRelation = relations(apiKeys, ({ one }) => ({
  user: one(user, {
    fields: [apiKeys.userId],
    references: [user.id],
  }),
}))
