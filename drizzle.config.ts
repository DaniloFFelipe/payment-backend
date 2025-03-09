import { env } from '@/lib/env'
import type { Config } from 'drizzle-kit'

export default {
  schema: 'src/lib/database/schema/*',
  out: 'src/lib/database/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: env('DATABASE_URL') },
} satisfies Config
