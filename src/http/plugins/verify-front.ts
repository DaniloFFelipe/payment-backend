import 'fastify'

import { env } from '@/lib/env'
import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { BaseError } from '../errors'

declare module 'fastify' {
  export interface FastifyRequest {
    validateFrontend(): Promise<void>
  }
}

export const frontendSecurePlugin = fastifyPlugin(
  async (app: FastifyInstance) => {
    app.addHook('preHandler', async request => {
      request.validateFrontend = async () => {
        const originKey = request.headers['x-origin-key']

        if (!originKey || originKey !== env('FRONT_END_SECURE_KEY')) {
          throw new BaseError(401, 'Missing origin key')
        }
      }
    })
  }
)
