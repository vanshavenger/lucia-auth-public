'use server'

import { lucia, validateRequest } from '@/auth'
import db from '@/lib/db'
import { loginSchema, loginValues, signUpSchema, signUpValues } from '@/schemas'
import { hash, verify } from '@node-rs/argon2'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const signUp = async (values: signUpValues) => {
  try {
    const data = signUpSchema.safeParse(values)
    if (!data.success) {
      return {
        error: data.error.errors[0].message,
      }
    }

    const { username, password, email } = data.data
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

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

    console.log('dsfsad')

    const response = await db.user.create({
      data: {
        username,
        email,
        hashedPassword: passwordHash,
      },
    })

    const session = await lucia.createSession(response.id, {})
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

export const login = async (values: loginValues) => {
  try {
    const data = loginSchema.safeParse(values)
    if (!data.success) {
      return {
        error: data.error.errors[0].message,
      }
    }
    const { username, password } = data.data

    const user = await db.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
    })

    if (!user || !user.hashedPassword) {
      console.log('Invalid username or password')
      return {
        error: 'Invalid username or password',
      }
    }

    const validPassword = await verify(user.hashedPassword, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    if (!validPassword) {
      return {
        error: 'Invalid username or password',
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
