import { authPlugin } from '@/http/auth/middleware'
import { db, tables } from '@/lib/database'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const webhooksRoute: FastifyPluginAsyncZod = async app => {
  await app.register(authPlugin)
  app.post(
    '/webhook',
    {
      schema: {
        body: z.object({
          callbackUrl: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { user } = await req.getAuth()
      const { callbackUrl } = req.body
      const webhooksResultQuery = await db
        .select()
        .from(tables.userWebhooksTbl)
        .where(eq(tables.userWebhooksTbl.userId, user.id))
        .limit(1)

      if (webhooksResultQuery.length > 0) {
        await db
          .update(tables.userWebhooksTbl)
          .set({
            completionPurchaseWebhookUrl: callbackUrl,
          })
          .where(eq(tables.userWebhooksTbl.userId, webhooksResultQuery[0].id))

        return reply.status(200).send({ message: 'Webhook updated.' })
      }

      await db.insert(tables.userWebhooksTbl).values({
        userId: user.id,
        completionPurchaseWebhookUrl: callbackUrl,
      })

      return reply.status(200).send({ message: 'Webhook created.' })
    }
  )

  app.get(
    '/webhooks',
    {
      schema: {
        response: {
          200: z.object({
            webhook: z.object({
              completionPurchaseWebhookUrl: z.string().nullable(),
              createdAt: z.date(),
            }),
          }),
        },
      },
    },
    async (req, reply) => {
      const { user } = await req.getAuth()
      const webhook = await db.query.userWebhooks.findFirst({
        columns: {
          createdAt: true,
          completionPurchaseWebhookUrl: true,
        },
        where: eq(tables.userWebhooksTbl.userId, user.id),
      })

      if (!webhook) {
        return reply.send({
          webhook: {
            completionPurchaseWebhookUrl: null,
            createdAt: new Date(),
          },
        })
      }

      return reply.send({ webhook })
    }
  )

  app.delete(
    '/webhooks',
    {
      schema: {
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { user } = await req.getAuth()
      await db
        .delete(tables.userWebhooksTbl)
        .where(eq(tables.userWebhooksTbl.userId, user.id))

      return reply.send({ message: 'Webhooks deleted.' })
    }
  )
}
