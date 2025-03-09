import { AuthService } from '@/http/auth/session.service'
import { BaseError } from '@/http/errors'
import { db, tables } from '@/lib/database'
import { compare } from 'bcrypt'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const signInRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/session/sign-in/email',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          200: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { email, password } = req.body
      const user = await db.query.user.findFirst({
        where: eq(tables.userTbl.email, email),
      })

      if (!user || !(await compare(password, user.passwordHash))) {
        throw new BaseError(400, 'Invalid credentials')
      }

      const session = await AuthService.createSession(user.id)

      return reply.status(200).send({
        token: await reply.jwtSign({ sub: session.id }),
      })
    }
  )
}
