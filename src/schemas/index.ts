import * as z from 'zod'

const passwordRequirements = [
  {
    regex: /^.{12,}$/,
    message: 'Password must be at least 12 characters long',
  },
  {
    regex: /[a-z]/,
    message: 'Password must contain at least one lowercase letter',
  },
  {
    regex: /[A-Z]/,
    message: 'Password must contain at least one uppercase letter',
  },
  {
    regex: /\d/,
    message: 'Password must contain at least one number',
  },
  {
    regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    message: 'Password must contain at least one special character',
  },
]

export const signUpSchema = z
  .object({
    displayName: z.string().trim().min(1, {
      message: 'Display name must be at least 1 character',
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
    password: z
      .string()
      .trim()
      .superRefine((password, ctx) => {
        const failedRequirements = passwordRequirements.filter(
          (requirement) => !requirement.regex.test(password)
        )

        failedRequirements.forEach((requirement) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: requirement.message,
          })
        })
      }),
    confirmPassword: z.string().trim(),
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

export const resetPasswordSchema = z
  .object({
    password: z.string().trim().min(1, {
      message: 'Current password is required.',
    }),
    newPassword: z
      .string()
      .trim()
      .superRefine((password, ctx) => {
        const failedRequirements = passwordRequirements.filter(
          (requirement) => !requirement.regex.test(password)
        )

        failedRequirements.forEach((requirement) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: requirement.message,
          })
        })
      }),
    confirmNewPassword: z.string().trim(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.newPassword !== data.password, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  })

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export const magicLinkSchema = z.object({
  email: z.string().trim().email({
    message: 'Invalid email address',
  }),
})

export type magicLinkValues = z.infer<typeof magicLinkSchema>

export const newPasswordSchema = z.object({
  password: z
    .string()
    .trim()
    .superRefine((password, ctx) => {
      const failedRequirements = passwordRequirements.filter(
        (requirement) => !requirement.regex.test(password)
      )

      failedRequirements.forEach((requirement) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: requirement.message,
        })
      })
    }),
})

export type newPasswordValues = z.infer<typeof newPasswordSchema>

export const ResetSchema = z.object({
  email: z.string().trim().email({
    message: 'Invalid email address',
  }),
})

export type ResetValues = z.infer<typeof ResetSchema>
