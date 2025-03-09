import { eq } from 'drizzle-orm'
import { db, tables } from '../../lib/database'
import type { AuthData, Session } from './types'

export const AuthService = {
  async createSession(userId: string): Promise<Session> {
    await db
      .delete(tables.sessionTbl)
      .where(eq(tables.sessionTbl.userId, userId))

    const [session] = await db
      .insert(tables.sessionTbl)
      .values({ userId })
      .returning()
    return session
  },

  async getAuth(sessionId: string): Promise<AuthData | null> {
    const [data] = await db
      .select()
      .from(tables.sessionTbl)
      .where(eq(tables.sessionTbl.id, sessionId))
      .leftJoin(tables.userTbl, eq(tables.userTbl.id, tables.sessionTbl.userId))
      .limit(1)

    return {
      session: data.session,
      user: data.user!,
    }
  },
}
