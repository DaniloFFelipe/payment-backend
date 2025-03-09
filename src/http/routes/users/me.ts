import { authPlugin } from '@/http/auth/middleware'
import { db, tables } from '@/lib/database'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const meRoute: FastifyPluginAsyncZod = async app => {
  app.register(authPlugin).get(
    '/users/me',
    {
      schema: {
        response: {
          200: z.object({
            user: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              image: z.string().nullable(),
              createdAt: z.date(),
            }),
          }),
        },
      },
    },
    async (req, reply) => {
      const authData = await req.getAuth()
      return reply.status(200).send({ user: authData.user })
    }
  )

  app.get(
    '/accounts/wallet',

    {
      schema: {
        response: {
          200: z.object({
            balanceInCents: z.number(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { user } = await req.getAuth()

      const wallet = await db.query.wallets.findFirst({
        where: eq(tables.walletsTbl.userId, user.id),
        columns: {
          balanceInCents: true,
        },
      })

      if (!wallet) {
        return reply.status(500).send()
      }

      return reply.status(200).send(wallet)
    }
  )
}
