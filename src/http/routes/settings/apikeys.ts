import { authPlugin } from '@/http/auth/middleware'
import { db, tables } from '@/lib/database'
import { and, count, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const apikeysRoute: FastifyPluginAsyncZod = async app => {
  await app.register(authPlugin)
  app.post(
    '/apikeys',
    {
      schema: {
        body: z.object({}),
      },
    },
    async (req, reply) => {}
  )

  app.post(
    '/api-keys',
    {
      schema: {
        body: z.object({
          name: z.string(),
        }),
        response: {
          201: z.object({
            apiKey: z.object({
              key: z.string(),
              name: z.string(),
            }),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { user } = await req.getAuth()
      const [{ totalOfUserKeys }] = await db
        .select({
          totalOfUserKeys: count(tables.apiKeysTbl.id),
        })
        .from(tables.apiKeysTbl)
        .where(eq(tables.apiKeysTbl.userId, user.id))
        .limit(1)

      if (totalOfUserKeys >= 5) {
        return reply.status(400).send({
          message: 'You have reached the maximum number of API keys.',
        })
      }

      const [apiKey] = await db
        .insert(tables.apiKeysTbl)
        .values({
          userId: user.id,
          name: req.body.name,
        })
        .returning({
          key: tables.apiKeysTbl.key,
          name: tables.apiKeysTbl.name,
        })

      return reply.send({ apiKey })
    }
  )

  app.get(
    '/api-keys',
    {
      schema: {
        response: {
          200: z.object({
            apiKeys: z.array(
              z.object({
                key: z.string(),
                name: z.string(),
              })
            ),
          }),
        },
      },
    },
    async (req, reply) => {
      const { user } = await req.getAuth()
      const apiKeys = await db
        .select({
          key: tables.apiKeysTbl.key,
          name: tables.apiKeysTbl.name,
          createdAt: tables.apiKeysTbl.createdAt,
        })
        .from(tables.apiKeysTbl)
        .where(eq(tables.apiKeysTbl.userId, user.id))

      return reply.send({ apiKeys })
    }
  )

  app.delete(
    '/api-keys/:key',
    {
      schema: {
        params: z.object({
          key: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { user } = await req.getAuth()
      const { key } = req.params
      const apiKey = await db
        .select()
        .from(tables.apiKeysTbl)
        .where(
          and(
            eq(tables.apiKeysTbl.userId, user.id),
            eq(tables.apiKeysTbl.key, key)
          )
        )
        .limit(1)

      if (!apiKey.length) {
        return reply.status(404).send({ message: 'API key not found.' })
      }

      await db
        .delete(tables.apiKeysTbl)
        .where(eq(tables.apiKeysTbl.id, apiKey[0].id))

      return reply.status(200).send({ message: 'API key deleted.' })
    }
  )
}
