'use server'

import { z } from 'zod'
import { cookies } from 'next/headers'
import { resetPasswordSchema } from '@/schemas'
import { lucia, validateRequest } from '@/auth'
import db from '@/lib/db'
import { hash, verify } from '@node-rs/argon2'
import { ARGON2_OPTIONS } from '@/constants'

export const resetPassword = async (
  values: z.infer<typeof resetPasswordSchema>
) => {
  try {
    const res = resetPasswordSchema.safeParse(values)
    if (!res.success) {
      return {
        success: false,
        message: res.error.errors[0].message,
      }
    }

    const { user } = await validateRequest()
    if (!user) {
      return {
        success: false,
        message: 'User not found',
      }
    }

    const existedUser = await db.user.findUnique({
      where: {
        id: user.id,
      },
    })

    if (!existedUser) {
      return {
        success: false,
        message: 'User not found',
      }
    }

    const isValidPassword = await verify(
      existedUser.hashedPassword!,
      values.password,
      ARGON2_OPTIONS
    )

    if (!isValidPassword) {
      return {
        success: false,
        message: 'Invalid password',
      }
    }

    const passwordHash = await hash(values.newPassword, ARGON2_OPTIONS)

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        hashedPassword: passwordHash,
      },
    })

    await db.session.deleteMany({
      where: {
        userId: user.id,
      },
    })

    const session = await lucia.createSession(existedUser.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )

    return {
      success: true,
      message: 'Password updated',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    }
  }
}
