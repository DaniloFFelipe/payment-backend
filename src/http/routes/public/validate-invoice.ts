import { frontendSecurePlugin } from '@/http/plugins/verify-front'
import { db, tables } from '@/lib/database'
import { subDays } from 'date-fns'
import { and, eq, gt, isNull } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

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
export const validateInvoiceRoute: FastifyPluginAsyncZod = async app => {
  app.register(frontendSecurePlugin).get(
    '/public/invoices/:invoiceId',
    {
      schema: {
        params: z.object({
          invoiceId: z.string(),
        }),
        response: {
          404: z.object({
            message: z.string(),
          }),
          200: z.object({
            invoice: InvoiceZ,
          }),
        },
      },
    },
    async (req, replay) => {
      await req.validateFrontend()
      const { invoiceId } = req.params
      const invoice = await db.query.invoices.findFirst({
        where: and(eq(tables.invoicesTbl.id, invoiceId)),
      })

      if (!invoice) {
        return replay.status(404).send({ message: 'Invoice not found.' })
      }

      return replay.status(200).send({ invoice: invoice })
    }
  )
}
