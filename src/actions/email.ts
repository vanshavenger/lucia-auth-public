'use server'

import db from '@/lib/db'
import { sendEmail } from '@/lib/email'
import jwt from 'jsonwebtoken'
import { generateId } from 'lucia'

export async function sendVerificationEmail(
  email: string,
  verificationUrl: string
) {
  try {
    const companyName = 'DSA & DEV'

    await sendEmail({
      to: email,
      subject: '🚀 One Small Click, One Giant Leap for Your Account!',
      html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Verify Your Email</title><style>body {font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;} .container {background-color: #f9f9f9; border-radius: 5px; padding: 30px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);} h1 {color: #2c3e50; margin-bottom: 20px;} .btn {display: inline-block; background-color: #3498db; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold; margin-top: 20px; transition: background-color 0.3s ease;} .btn:hover {background-color: #2980b9;} .footer {margin-top: 30px; font-size: 12px; color: #7f8c8d; text-align: center;} </style></head><body><div class="container"><h1>Welcome aboard! Let\'s make it official.</h1><p>You\'re just one click away from accessing all the amazing features we have to offer. Verify your email now to get started!</p><a href="${verificationUrl}" class="btn">Verify My Email</a><p>If you didn\'t create an account with us, you can safely ignore this email.</p></div><div class="footer"><p>This email was sent by ${companyName}. Please do not reply to this message.</p><p>&copy; 2024 ${companyName}. All rights reserved.</p></div></body></html>`,
    })

    console.log('Verification email sent successfully')
  } catch (error) {
    console.error('Error sending verification email:', error)
  }
}

export const resendVerificationEmail = async (email: string) => {
  try {
    const user = await db.user.findFirst({
      where: {
        email,
      },
    })

    if (!user) {
      return {
        error: 'User not found',
      }
    }

    if (user.emailVerified === true) {
      return {
        error: 'Email already verified',
      }
    }

    const existedCode = await db.verificationEmail.findFirst({
      where: {
        userId: user.id,
      },
    })

    if (!existedCode) {
      return {
        error: 'Code not found',
      }
    }

    const createdAt = new Date(existedCode.createdAt)
    const isOneMinuteHasPassed =
      new Date().getTime() - createdAt.getTime() > 120000 // 1 minute -> 2 minute

    if (!isOneMinuteHasPassed) {
      return {
        error:
          'Email already sent next email in ' +
          (60 -
            Math.floor((new Date().getTime() - createdAt.getTime()) / 1000)) +
          ' seconds',
      }
    }

    const code = Math.floor(Math.random() * 1000_000)
      .toString()
      .padStart(6, '0')

    await db.verificationEmail.update({
      where: { id: existedCode.id, userId: user.id },
      data: {
        code,
        createdAt: new Date(),
      },
    })

    const token = jwt.sign(
      { email: email, userId: user.id, code },
      process.env.JWT_SECRET!,
      {
        expiresIn: '5m',
      }
    )

    const verificationUrl = `${process.env.APP_NAME}/api/verify-email?token=${token}`

    await sendVerificationEmail(email, verificationUrl)

    return {
      success: 'Email sent',
    }
  } catch (error: any) {
    return {
      error: error?.message,
    }
  }
}

export async function sendMagicLinkEmail(email: string, url: string) {
  const subject = '✨ Your Magical Gateway Awaits!'
  const text = `
Greetings, esteemed user!

A world of wonder is just one click away. Your personal magic portal has arrived:

${url}

Tap into the extraordinary - your adventure begins now!

Best regards,
The Acme Enchantment Team
  `
  const html = `
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4a90e2;">Greetings, esteemed user! ✨</h2>
    <p>A world of wonder is just one click away. Your personal magic portal has arrived:</p>
    <p style="text-align: center;">
      <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 5px;">Open Your Magic Portal</a>
    </p>
    <p>Tap into the extraordinary - your adventure begins now!</p>
    <p>Best regards,<br>The Acme Enchantment Team</p>
  </body>
</html>
  `

  await sendEmail({
    to: email,
    subject,
    text,
    html,
    headers: {
      'X-Entity-Ref-ID': generateId(10), // Assuming you have this function
    },
  })
}
