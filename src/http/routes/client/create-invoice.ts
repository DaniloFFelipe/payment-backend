import { apiKeyPlugin } from '@/http/plugins/api-key'
import { db, tables } from '@/lib/database'
import { env } from '@/lib/env'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

const bodySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  amountInCents: z.number().min(1),
  redirectUrl: z.string().url(),
  externalId: z.string(),
})

export const clientCreateInvoiceRoute: FastifyPluginAsyncZod = async app => {
  app.register(apiKeyPlugin).post(
    '/client/invoice',
    {
      schema: {
        body: bodySchema,
        response: {
          201: z.object({
            paymentLink: z.string(),
          }),
        },
      },
    },
    async (req, reply) => {
      const user = await req.getAuthByApiKey()
      const body = req.body

      const [{ invoiceId }] = await db
        .insert(tables.invoicesTbl)
        .values({
          name: body.name,
          description: body.description,
          amountInCents: body.amountInCents,
          redirectUrl: body.redirectUrl,
          externalId: body.externalId,
          userId: user.id,
        })
        .returning({ invoiceId: tables.invoicesTbl.id })

      return reply.status(201).send({
        paymentLink: `${env('FRONT_END_PAYMENT_URL').replace('<invoiceId>', invoiceId)}`,
      })
    }
  )
}
