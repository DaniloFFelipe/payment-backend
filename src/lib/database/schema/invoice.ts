import { randomUUID } from 'node:crypto'
import { gte, relations } from 'drizzle-orm'
import {
  check,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'
import { user } from './auth-schema'

export const invoiceTypeEnum = pgEnum('invoice_type', ['payment'])

export const invoices = pgTable(
  'invoices',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => `bill_${ulid()}`),

    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    amountInCents: integer('balance_in_cents').notNull(),

    type: invoiceTypeEnum('type').notNull().default('payment'),
    completedAt: timestamp('completed_at'),

    externalId: text('external_id').notNull(),
    redirectUrl: text('redirect_url').notNull(),

    name: text('name').notNull(),
    description: text('description'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  table => [
    check(
      'balance_in_cents_non_less_than_zero_check',
      gte(table.amountInCents, 0)
    ),
  ]
)

export const invoicesRelation = relations(invoices, ({ one }) => ({
  user: one(user, {
    fields: [invoices.userId],
    references: [user.id],
  }),
}))
