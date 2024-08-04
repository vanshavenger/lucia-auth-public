import { GitHub, Google } from 'arctic'
import { Lucia, User, Session, TimeSpan } from 'lucia'
import { PrismaAdapter } from '@lucia-auth/adapter-prisma'
import { cookies } from 'next/headers'

import db from '@/lib/db'

const adapter = new PrismaAdapter(db.session, db.user)

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(2, 'w'),
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
    }
  },
})

export const validateRequest = async (): Promise<
  { user: User; session: Session } | { user: null; session: null }
> => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null
  if (!sessionId) {
    return {
      user: null,
      session: null,
    }
  }

  const result = await lucia.validateSession(sessionId)

  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id)
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      )
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie()
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      )
    }
  } catch {}
  return result
}

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: {
      id: String
    }
    UserId: String
  }
}

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  {
    redirectURI: `${process.env.APP_NAME}/login/github/callback`,
  }
)

export const googleAuth = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.APP_NAME}/login/google/callback`
)
