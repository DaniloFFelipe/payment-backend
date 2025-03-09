import * as dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  FRONT_END_SECURE_KEY: z.string(),
  AUTH_SECRET: z.string(),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),

  FRONT_END_PAYMENT_URL: z.string().url(),

  // INVITE_EXP_TIME_IN_SEC: z.coerce.number().default(15 * 60),

  // REDIS_HOST: z.string().default('localhost'),
  // REDIS_PORT: z.coerce.number().default(6379),

  // AWS_ACCESS_KEY_ID: z.string(),
  // AWS_SECRET_ACCESS_KEY: z.string(),
  // AWS_ENDPOINT: z.string(),
  // AWS_BUCKET: z.string().default('flowflick'),
  // AWS_REGION: z.string().default('west-2'),
})

type Env = z.infer<typeof envSchema>
export function env<T extends keyof Env>(key: T) {
  return envSchema.parse(process.env)[key]
}
