import * as z from 'zod' 

export const signUpSchema = z.object({
    email: z.string().trim().min(1).email("Invalid email address"),
    username: z.string().trim().min(3, {
        message: 'Username must be at least 3 characters long',
    }).regex(/^[a-zA-Z0-9_-]+$/, {
        message: 'Username can only contain letters, numbers, underscores, and hyphens',
    }),
    password: z.string().trim().min(8, {
        message: 'Password must be at least 8 characters long'
    }).max(100, {
        message: 'Password must be at most 100 characters long'
    }),
})

export type signUpValues = z.infer<typeof signUpSchema>

export const loginSchema = z.object({
  username: z
    .string()
        .trim().min(1, {
            message: 'Username is requuired.',
        }),
  password: z
    .string()
      .trim().min(1, {
            message: 'Password is required.'
    })
})

export type loginValues = z.infer<typeof loginSchema>