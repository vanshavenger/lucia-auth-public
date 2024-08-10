import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

import { cookies } from 'next/headers'
import db from '@/lib/db'
import { lucia } from '@/auth'
export const GET = async (req: NextRequest) => {
  try {
    const url = new URL(req.url)

    const searchParams = url.searchParams

    const token = searchParams.get('token')

    if (!token) {
      return Response.json(
        {
          error: 'Token is not existed',
        },
        {
          status: 400,
        }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string
      userId: string
    }

    const existedToken = await db.magicLink.findFirst({
      where: {
        userId: decoded.userId,
      },
    })

    if (!existedToken) {
      return Response.json(
        {
          error: 'Invalid token',
        },
        {
          status: 400,
        }
      )
    } else {
      await await db.magicLink.deleteMany({
        where: {
          userId: decoded.userId,
        },
      })
    }

    const session = await lucia.createSession(decoded.userId, {})

    const sessionCookie = lucia.createSessionCookie(session.id)

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )

    return Response.redirect(new URL(process.env.APP_NAME!), 302)
  } catch (e: any) {
    return Response.json(
      {
        error: e.message,
      },
      {
        status: 400,
      }
    )
  }
}
