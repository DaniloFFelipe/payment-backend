import { db, tables } from '@/lib/database'
import {
  createPaginationResponse,
  createPaginationSchema,
  paginationSchema,
} from '@/types/pagination'
import { count, desc, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { authPlugin } from '../auth/middleware'

const InvoiceZ = z.object({
  id: z.string(),
  userId: z.string(),
  amountInCents: z.number(),
  type: z.literal('payment'),
  completedAt: z.date().nullable(),
  externalId: z.string(),
  redirectUrl: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
})

export const invoicesRoute: FastifyPluginAsyncZod = async app => {
  await app.register(authPlugin)
  app.get(
    '/invoices',
    {
      schema: {
        querystring: paginationSchema,
        response: {
          200: createPaginationSchema(InvoiceZ),
        },
      },
    },
    async (req, replay) => {
      const { user } = await req.getAuth()

      const [invoices, [{ total }]] = await Promise.all([
        db
          .select()
          .from(tables.invoicesTbl)
          .where(eq(tables.invoicesTbl.userId, user.id))
          .orderBy(desc(tables.invoicesTbl.createdAt))
          .limit(req.query.per_page)
          .offset(req.query.page_index * req.query.per_page),
        db
          .select({
            total: count(tables.invoicesTbl.id),
          })
          .from(tables.invoicesTbl)
          .where(eq(tables.invoicesTbl.userId, user.id))
          .limit(1),
      ])

      return replay.send(createPaginationResponse(invoices, total, req.query))
    }
  )
}
