export * from './client'
import * as schema from './schema'
export { schema }

export const userTbl = schema.user
export const sessionTbl = schema.session
export const invoicesTbl = schema.invoices
export const userWebhooksTbl = schema.userWebhooks
export const apiKeysTbl = schema.apiKeys
export const walletsTbl = schema.wallets
export const transactionsTbl = schema.transactions

export const tables = {
  userTbl,
  sessionTbl,
  invoicesTbl,
  userWebhooksTbl,
  apiKeysTbl,
  walletsTbl,
  transactionsTbl,
}
