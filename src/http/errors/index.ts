import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

export class BaseError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  console.warn(error)
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      errors: error.flatten().fieldErrors,
    })
  }

  if (error instanceof BaseError) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return reply.status(error.code as any).send({
      message: error.message,
    })
  }

  // send error to some observability platform
  return reply.status(500).send({ message: 'Internal server error' })
}
