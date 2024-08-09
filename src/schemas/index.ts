import * as z from 'zod'

export const signUpSchema = z
  .object({
    displayName: z.string().trim().min(1, {
      message: 'Display name must be at least 1 characters',
    }),
    username: z
      .string()
      .trim()
      .min(3, {
        message: 'Username must be at least 3 characters long',
      })
      .regex(/^[a-zA-Z0-9_-]+$/, {
        message:
          'Username can only contain letters, numbers, underscores, and hyphens',
      }),
    email: z.string().trim().email({
      message: 'Invalid email address',
    }),
    password: z.string().trim().min(8, {
      message: 'Password must be at least 8 characters long',
    }),
    confirmPassword: z.string().trim().min(8, {
      message: 'Password must be at least 8 characters long',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type signUpValues = z.infer<typeof signUpSchema>

export const loginSchema = z.object({
  email: z.string().trim().email({
    message: 'Invalid email address',
  }),
  password: z.string().trim().min(1, {
    message: 'Password is required.',
  }),
})

export type loginValues = z.infer<typeof loginSchema>
