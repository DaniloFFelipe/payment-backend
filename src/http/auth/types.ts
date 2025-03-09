import type { schema } from '../../lib/database'

export type Session = typeof schema.session.$inferSelect
export type User = typeof schema.user.$inferSelect

export type AuthData = {
  session: Session
  user: User
}
