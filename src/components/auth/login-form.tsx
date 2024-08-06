'use client'

import { login } from '@/actions/auth-actions'
import LoadingButton from '@/components/global/loading-button'
import { PasswordInput } from '@/components/global/password-input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { loginSchema, loginValues } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCountdown } from 'usehooks-ts'
import { resendVerificationEmail } from '@/actions/email'

export default function LoginForm() {
  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({
      countStart: 60,
      intervalMs: 1000,
    })

  useEffect(() => {
    if (count === 0) {
      stopCountdown()
      resetCountdown()
    }
  }, [count, resetCountdown, stopCountdown])

  const [showSendEmail, setShowSendEmail] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<loginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: loginValues) => {
    startTransition(async () => {
      const data = await login(values)
      if (data.error === 'Email is not verified') {
        setShowSendEmail(true)
        toast.error('Email is not verified')
        return
      }
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success('Logged in successfully!')
    })
  }

  const onResendVerificationEmail = async () => {
    const res = await resendVerificationEmail(form.getValues('email'))
    if (res.error) {
      toast.error(res.error)
    } else if (res.success) {
      toast.success(res.success)
      startCountdown()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mb-2'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='example@gmail.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {showSendEmail && (
          <Button
            type='button'
            disabled={count > 0 && count < 60}
            onClick={onResendVerificationEmail}
            variant={'link'}
          >
            Send verification email {count > 0 && count < 60 && `in ${count}s`}
          </Button>
        )}
        <LoadingButton loading={isPending} type='submit' className='w-full'>
          Log in
        </LoadingButton>
      </form>
    </Form>
  )
}
