'use server'

import { z } from 'zod'

import { cookies } from 'next/headers'
import { forgetPasswordSchema } from '@/schemas'
import { lucia, validateRequest } from '@/auth'
import db from '@/lib/db'
import { hash, verify } from '@node-rs/argon2'

export const resetPassword = async (
  values: z.infer<typeof forgetPasswordSchema>
) => {
  try {
    try {
      forgetPasswordSchema.parse(values)
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      }
    }

    const { user } = await validateRequest()
    if (!user) {
      return {
        success: false,
        message: 'User not found',
      }
    }
    if (values.password === values.newPassword) {
      return {
        success: false,
        message: 'New password must be different from the old password',
      }
    }

    const existedUser = await db.user.findFirst({
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
      existedUser?.hashedPassword!,
      values.password,
      {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      }
    )

    if (!isValidPassword) {
      return {
        success: false,
        message: 'Invalid password',
      }
    }

    const passwordHash = await hash(values.newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

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
