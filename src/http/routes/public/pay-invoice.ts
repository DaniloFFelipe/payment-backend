import { BaseError } from '@/http/errors'
import { frontendSecurePlugin } from '@/http/plugins/verify-front'
import { db, tables } from '@/lib/database'
import { WebhookService } from '@/lib/services/webhooks.services'
import { subDays } from 'date-fns'
import { and, eq, gt, isNull } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const payInvoiceRoute: FastifyPluginAsyncZod = async app => {
  app.register(frontendSecurePlugin).post(
    '/public/invoices/:invoiceId',
    {
      schema: {
        params: z.object({
          invoiceId: z.string(),
        }),
        querystring: z.object({
          redirect: z.enum(['true', 'false']).transform(c => c === 'true'),
        }),
      },
    },
    async (req, c) => {
      await req.validateFrontend()
      const { invoiceId } = req.params

      const invoice = await db.query.invoices.findFirst({
        where: and(eq(tables.invoicesTbl.id, invoiceId)),
      })

      if (!invoice) {
        throw new BaseError(404, 'Invoice not found.')
      }

      if (invoice.completedAt) {
        throw new BaseError(400, 'Invoice already paid.')
      }

      if (invoice.createdAt <= subDays(new Date(), 1)) {
        throw new BaseError(400, 'Invoice expired.')
      }

      const userWallet = await db.query.wallets.findFirst({
        where: eq(tables.walletsTbl.userId, invoice.userId),
      })

      if (!userWallet) {
        throw new BaseError(500, 'Internal server error.')
      }

      await db.transaction(async tx => {
        await tx
          .update(tables.invoicesTbl)
          .set({
            completedAt: new Date(),
          })
          .where(eq(tables.invoicesTbl.id, invoiceId))

        await tx
          .update(tables.walletsTbl)
          .set({
            balanceInCents: userWallet.balanceInCents + invoice.amountInCents,
          })
          .where(eq(tables.walletsTbl.userId, invoice.userId))

        await tx.insert(tables.transactionsTbl).values({
          valueInCents: invoice.amountInCents,
          type: 'payment_received',
          userId: invoice.userId,
        })
      })

      const userWebhook = await db.query.userWebhooks.findFirst({
        where: eq(tables.walletsTbl.userId, invoice.userId),
      })

      if (userWebhook?.completionPurchaseWebhookUrl) {
        await WebhookService.sendCompetition(
          userWebhook.completionPurchaseWebhookUrl,
          {
            invoiceId: invoice.id,
            invoiceName: invoice.name,
            invoiceAmountInCents: invoice.amountInCents,
            invoiceExternalId: invoice.externalId,
            invoiceCreatedAt: invoice.createdAt,
            invoiceCompletedAt: invoice.completedAt,
          }
        )
      }

      if (!req.query.redirect) {
        return c.send({})
      }

      return c.redirect(invoice.redirectUrl)
    }
  )
}
