'use server'

import { lucia, validateRequest } from '@/auth'
import db from '@/lib/db'
import { loginSchema, loginValues, signUpSchema, signUpValues } from '@/schemas'
import { hash, verify } from '@node-rs/argon2'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'
import { sendVerificationEmail } from '@/actions/email'
import { ARGON2_OPTIONS } from '@/constants'

export const signUp = async (values: signUpValues) => {
  try {
    const data = signUpSchema.safeParse(values)
    if (!data.success) {
      return {
        error: data.error.errors[0].message,
      }
    }

    const { username, password, email, displayName } = data.data
    const passwordHash = await hash(password, ARGON2_OPTIONS)

    const existingUsername = await db.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
    })

    if (existingUsername) {
      return {
        error: 'Username is already taken',
      }
    }
    const existingEmail = await db.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    })

    if (existingEmail) {
      return {
        error: 'Email is already taken',
      }
    }

    const response = await db.user.create({
      data: {
        username: username,
        email: email,
        hashedPassword: passwordHash,
        displayName: displayName,
      },
    })

    const code = Math.floor(Math.random() * 1000_000)
      .toString()
      .padStart(6, '0')

    await db.verificationEmail.create({
      data: {
        code,
        userId: response.id,
      },
    })

    const token = jwt.sign(
      { email: email, userId: response.id, code },
      process.env.JWT_SECRET!,
      {
        expiresIn: '5m',
      }
    )

    const verificationUrl = `${process.env.APP_NAME}/api/verify-email?token=${token}`

    await sendVerificationEmail(email, verificationUrl)
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    return {
      error: 'Something went wrong',
    }
  }
}

export const login = async (values: loginValues) => {
  try {
    const data = loginSchema.safeParse(values)
    if (!data.success) {
      return {
        error: data.error.errors[0].message,
      }
    }
    const { email, password } = data.data

    const user = await db.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    })

    if (!user || !user.hashedPassword) {
      return {
        error: 'Invalid email or password',
      }
    }

    const validPassword = await verify(
      user.hashedPassword,
      password,
      ARGON2_OPTIONS
    )

    if (!validPassword) {
      return {
        error: 'Invalid email or password',
      }
    }

    if (user.emailVerified === false) {
      return {
        error: 'Email is not verified',
      }
    }

    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )
    redirect('/')
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    return {
      error: 'Something went wrong',
    }
  }
}

export async function logout() {
  const { session } = await validateRequest()

  if (!session) {
    throw new Error('Unauthorized')
  }

  await lucia.invalidateSession(session.id)

  const sessionCookie = lucia.createBlankSessionCookie()

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  )

  redirect('/login')
}
