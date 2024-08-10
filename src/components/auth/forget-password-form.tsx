'use client'

import { useForm } from 'react-hook-form'
import { useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { useSearchParams, useRouter } from 'next/navigation'
import { newPasswordSchema, newPasswordValues } from '@/schemas'
import { toast } from 'sonner'
import LoadingButton from '@/components/global/loading-button'
import { NewPassword } from '@/actions/new-password'
import { PasswordInput } from '@/components/global/password-input'

export const NewPasswordForm = () => {
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const form = useForm<newPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
    },
  })

  const onSubmit = (values: newPasswordValues) => {
    startTransition(() => {
      NewPassword(values, token).then((data) => {
        if (data?.error) {
          toast.error(data.error)
        }
        if (data?.success) {
          toast.success(data.success)
          router.push('/login') // Redirect to login page after successful password reset
        }
      })
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-6'
        noValidate
      >
        <div className='space-y-4'>
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    disabled={isPending}
                    placeholder='*****'
                    type='password'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <LoadingButton
          loading={isPending}
          type='submit'
          disabled={isPending}
          className='w-full'
        >
          Reset password
        </LoadingButton>
      </form>
    </Form>
  )
}
