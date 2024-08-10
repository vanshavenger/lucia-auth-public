'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCountdown } from 'usehooks-ts'
import { toast } from 'sonner'

import { login } from '@/actions/auth-actions'
import { resendVerificationEmail } from '@/actions/email'
import {
  onDiscordSignInClicked,
  onGithubSignInClicked,
  onGoogleSignInClicked,
} from '@/queries'
import { loginSchema, loginValues } from '@/schemas'

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
import { Button } from '@/components/ui/button'
import { GithubIcon } from '@/components/icons/github'
import { GoogleIcon } from '@/components/icons/google'
import { DiscordIcon } from '@/components/icons/discord'
import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function LoginForm() {
  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({
      countStart: 60,
      intervalMs: 1000,
    })

  const [showSendEmail, setShowSendEmail] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<loginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (count === 0) {
      stopCountdown()
      resetCountdown()
    }
  }, [count, resetCountdown, stopCountdown])

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
      form.reset()
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
    <div className='space-y-6 w-full max-w-md mx-auto'>
      <Button
        variant='secondary'
        className='w-full flex items-center justify-center gap-2'
        asChild
      >
        <Link href={'/magic-link'}>
          <Mail className='w-5 h-5' />
          Sign in with Magic Link
        </Link>
      </Button>
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            Or continue with
          </span>
        </div>
      </div>
      <Button
        onClick={onDiscordSignInClicked}
        variant='secondary'
        className='w-full flex items-center justify-center gap-2'
      >
        <DiscordIcon className='w-5 h-5' />
        Sign in with Discord
      </Button>
      <Button
        onClick={onGithubSignInClicked}
        variant='secondary'
        className='w-full flex items-center justify-center gap-2'
      >
        <GithubIcon className='w-5 h-5' />
        Sign in with GitHub
      </Button>
      <Button
        onClick={onGoogleSignInClicked}
        variant='secondary'
        className='w-full flex items-center justify-center gap-2'
      >
        <GoogleIcon className='w-5 h-5' />
        Sign in with Google
      </Button>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            Or continue with
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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
                  <PasswordInput placeholder='Enter your password' {...field} />
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
              variant='link'
              className='p-0 h-auto font-normal text-xs'
            >
              Send verification email{' '}
              {count > 0 && count < 60 && `in ${count}s`}
            </Button>
          )}
          <LoadingButton loading={isPending} type='submit' className='w-full'>
            Log in
          </LoadingButton>
        </form>
      </Form>
    </div>
  )
}
