import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { PasswordInput } from '@/components/global/password-input'

// Define the schema outside the component
const forgetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
  })
  .refine((data) => data.password !== data.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ForgetPasswordValues = z.infer<typeof forgetPasswordSchema>

const resetPassword = async (values: ForgetPasswordValues) => {
  // Simulating an API call
  return new Promise<{ success: boolean; message: string }>((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Password updated successfully' })
    }, 1000)
  })
}

export const ForgetPasswordForm: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ForgetPasswordValues>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      newPassword: '',
    },
  })

  const onSubmit = (values: ForgetPasswordValues) => {
    setOpen(true)
  }

  const onContinue = async () => {
    setIsSubmitting(true)
    try {
      const res = await resetPassword(form.getValues())
      if (res.success) {
        toast.success(res.message)
        form.reset()
        setOpen(false)
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Password</AlertDialogTitle>
            <AlertDialogDescription>
              This will update your password and log you out from all devices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onContinue} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4 max-w-md mx-auto mt-8'
        >
          {['password', 'newPassword', 'confirmPassword'].map((fieldName) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName as keyof ForgetPasswordValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {fieldName === 'password'
                      ? 'Current Password'
                      : fieldName === 'newPassword'
                        ? 'New Password'
                        : 'Confirm New Password'}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type='submit' className='w-full'>
            Update Password
          </Button>
        </form>
      </Form>
    </>
  )
}

export default ForgetPasswordForm
