import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { clientCreateInvoiceRoute } from './client/create-invoice'
import { invoicesRoute } from './invoices'
import { payInvoiceRoute } from './public/pay-invoice'
import { validateInvoiceRoute } from './public/validate-invoice'
import { apikeysRoute } from './settings/apikeys'
import { webhooksRoute } from './settings/webhooks'
import { transactionsRoute } from './transactions'
import { meRoute } from './users/me'
import { signInRoute } from './users/sign-in'
import { signUpRoute } from './users/sign-up'

export const routes: FastifyPluginAsyncZod = async app => {
  await app.register(clientCreateInvoiceRoute)
  await app.register(payInvoiceRoute)
  await app.register(validateInvoiceRoute)
  await app.register(apikeysRoute)
  await app.register(webhooksRoute)
  await app.register(meRoute)
  await app.register(signInRoute)
  await app.register(signUpRoute)
  await app.register(transactionsRoute)
  await app.register(invoicesRoute)
}
