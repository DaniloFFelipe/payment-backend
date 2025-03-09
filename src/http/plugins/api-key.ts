import 'fastify'

import { db, tables } from '@/lib/database'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import type { User } from '../auth/types'
import { BaseError } from '../errors'

declare module 'fastify' {
  export interface FastifyRequest {
    getAuthByApiKey(): Promise<User>
  }
}

export const apiKeyPlugin = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async request => {
    request.getAuthByApiKey = async () => {
      try {
        const apiKey = request.headers['x-api-key'] as string | undefined
        if (!apiKey) {
          throw new BaseError(401, 'Missing API key')
        }

        const apiKeyData = await db.query.apiKeys.findFirst({
          where: eq(tables.apiKeysTbl.key, apiKey),
          with: {
            user: true,
          },
        })

        if (!apiKeyData) {
          throw new BaseError(401, 'Invalid API key')
        }

        return apiKeyData.user
      } catch {
        throw new BaseError(401, 'Invalid token')
      }
    }
  })
})
