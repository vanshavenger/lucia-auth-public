'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
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
import { resetPasswordSchema, ResetPasswordValues } from '@/schemas'
import { resetPassword } from '@/actions/reset-password'

export const ResetPasswordForm = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const onSubmit = (values: ResetPasswordValues) => {
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
          {['password', 'newPassword', 'confirmNewPassword'].map(
            (fieldName) => (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName as keyof ResetPasswordValues}
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
            )
          )}
          <Button type='submit' className='w-full'>
            Update Password
          </Button>
        </form>
      </Form>
    </>
  )
}

export default ResetPasswordForm
