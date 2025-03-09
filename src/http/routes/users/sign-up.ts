import { AuthService } from '@/http/auth/session.service'
import { BaseError } from '@/http/errors'
import { db, tables } from '@/lib/database'
import { hash } from 'bcrypt'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const signUpRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/sessions/sign-up/email',
    {
      schema: {
        body: z.object({
          name: z.string().min(3),
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
      const { name, email, password } = req.body
      const userWithSameEmail = await db.query.user.findFirst({
        where: eq(tables.userTbl.email, email),
      })

      if (userWithSameEmail) {
        throw new BaseError(400, 'User already exists')
      }

      const userId = await db.transaction(async tx => {
        const [{ userId }] = await tx
          .insert(tables.userTbl)
          .values({ name, email, passwordHash: await hash(password, 10) })
          .returning({ userId: tables.userTbl.id })

        await tx.insert(tables.walletsTbl).values({ userId })

        return userId
      })

      const session = await AuthService.createSession(userId)

      return reply.status(200).send({
        token: await reply.jwtSign({ sub: session.id }),
      })
    }
  )
}
