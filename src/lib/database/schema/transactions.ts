import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { ulid } from 'ulid'
import { user } from './auth-schema'

export const transactionTypeEnum = pgEnum('transaction_type', [
  'payment_received',
  'withdrawal',
])

export const transactions = pgTable('transactions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => `transaction_${ulid()}`),

  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  valueInCents: integer('value_in_cents').notNull(),

  type: transactionTypeEnum('type').notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
})
