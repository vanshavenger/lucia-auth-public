'use server'

import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { magicLinkSchema } from '@/schemas'
import db from '@/lib/db'
import { sendMagicLinkEmail } from './email'

const generateMagicLink = async (email: string, userId: string) => {
  const token = jwt.sign({ email: email, userId }, process.env.JWT_SECRET!, {
    expiresIn: '5m',
  })

  const url = `${process.env.APP_NAME}/api/magic-link?token=${token}`

  return {
    success: true,
    message: 'Magic link generated successfully',
    data: {
      token,
      url,
    },
  }
}

export const signIn = async (values: z.infer<typeof magicLinkSchema>) => {
  try {
    magicLinkSchema.parse(values)

    const existedUser = await db.user.findFirst({
      where: {
        email: {
          equals: values.email,
          mode: 'insensitive',
        },
      },
    })

    if (existedUser) {
      const res = await generateMagicLink(values.email, existedUser.id)
      await db.magicLink.create({
        data: {
          userId: existedUser.id,
          token: res.data.token,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      })

      await sendMagicLinkEmail(values.email, res.data.url)

      console.log(res.data)
    } else {
      // we will create the user
      const createdUser = await db.user.create({
        data: {
          email: values.email,
        },
      })
      const res = await generateMagicLink(values.email, createdUser.id)

      await db.magicLink.create({
        data: {
          userId: createdUser.id,
          token: res.data.token,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      })
      await sendMagicLinkEmail(values.email, res.data.url)
    }

    return {
      success: true,
      message: 'Magic link sent successfully',
      data: null,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error?.message,
      data: null,
    }
  }
}
