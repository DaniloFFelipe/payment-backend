import { randomUUID } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { check, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'
import { user } from './auth-schema'

export const wallets = pgTable(
  'wallets',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => `wallet_${ulid()}`),

    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    balanceInCents: integer('balance_in_cents').notNull().default(0),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  }
  // table => [
  //   check(
  //     'balance_non_less_than_zero_check',
  //     sql`${table.balanceInCents} >= 0`
  //   ),
  // ]
)
