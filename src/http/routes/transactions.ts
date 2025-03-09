import { db, tables } from '@/lib/database'
import {
  createPaginationResponse,
  createPaginationSchema,
  paginationSchema,
} from '@/types/pagination'
import { subDays } from 'date-fns'
import { and, between, count, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { authPlugin } from '../auth/middleware'

export const transactionsRoute: FastifyPluginAsyncZod = async app => {
  await app.register(authPlugin)

  app.get(
    '/transactions',
    {
      schema: {
        querystring: paginationSchema,
        response: {
          200: createPaginationSchema(
            z.object({
              id: z.string(),
              valueInCents: z.number(),
              type: z.union([
                z.literal('payment_received'),
                z.literal('withdrawal'),
              ]),
              createdAt: z.date(),
              updatedAt: z.date(),
            })
          ),
        },
      },
    },
    async (req, replay) => {
      const { user } = await req.getAuth()

      const [transactions, [{ total }]] = await Promise.all([
        db
          .select()
          .from(tables.transactionsTbl)
          .where(eq(tables.transactionsTbl.userId, user.id))
          .limit(req.query.per_page)
          .offset(req.query.page_index * req.query.per_page),
        db
          .select({
            total: count(tables.transactionsTbl.id),
          })
          .from(tables.transactionsTbl)
          .where(eq(tables.transactionsTbl.userId, user.id))
          .limit(1),
      ])

      return replay.send(
        createPaginationResponse(transactions, total, req.query)
      )
    }
  )

  app.get(
    '/transactions/:period/total',
    {
      schema: {
        params: z.object({ period: z.enum(['month', 'year', 'week']) }),
        response: {
          200: z.object({
            message: z.string(),
            total: z.number(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { user } = await req.getAuth()
      const { period } = req.params
      const numOfDaysToSub = {
        month: 30,
        year: 365,
        week: 7,
      }[period]

      const [{ total }] = await db
        .select({
          total: count(tables.transactionsTbl.id),
        })
        .from(tables.transactionsTbl)
        .where(
          and(
            eq(tables.transactionsTbl.userId, user.id),
            between(
              tables.transactionsTbl.createdAt,
              subDays(new Date(), numOfDaysToSub),
              new Date()
            )
          )
        )
        .limit(1)

      return reply.send({
        message: `Total amount of transactions in the last ${period}`,
        total,
      })
    }
  )
}
