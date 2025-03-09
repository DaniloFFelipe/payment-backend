import 'fastify'

import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { BaseError } from '../errors'
import { AuthService } from './session.service'
import type { AuthData } from './types'

declare module 'fastify' {
  export interface FastifyRequest {
    getAuth(): Promise<AuthData>
  }
}

export const authPlugin = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async request => {
    await request.jwtVerify<{ sub: string }>()

    request.getAuth = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()
        const authData = await AuthService.getAuth(sub)
        if (!authData) {
          throw new BaseError(401, 'Invalid token')
        }
        return authData
      } catch {
        throw new BaseError(401, 'Invalid token')
      }
    }
  })
})
