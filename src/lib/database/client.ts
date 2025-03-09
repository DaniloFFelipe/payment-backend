import type { ExtractTablesWithRelations } from 'drizzle-orm'
import type { PgTransaction } from 'drizzle-orm/pg-core'
import {
  type PostgresJsDatabase,
  type PostgresJsQueryResultHKT,
  drizzle,
} from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '../env'
// import { env } from "@/lib/env";
import * as schema from './schema/index'

export const pg = postgres(env('DATABASE_URL'))
export const db = drizzle(pg, { schema })

export type DbSchema = typeof schema
export type Db = PostgresJsDatabase<typeof schema>
export type DbTransaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>
