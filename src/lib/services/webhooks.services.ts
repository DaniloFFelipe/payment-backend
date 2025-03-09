import axios from 'axios'

export const WebhookService = {
  async sendCompetition(
    url: string,
    data: {
      invoiceId: string
      invoiceName: string
      invoiceAmountInCents: number
      invoiceExternalId: string
      invoiceCreatedAt: Date
      invoiceCompletedAt: Date | null
    }
  ) {
    try {
      await axios.post(url, data)
    } catch (error) {
      console.error(error)
    }
  },
}
