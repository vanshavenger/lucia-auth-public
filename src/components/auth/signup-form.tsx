'use client'

import { signUp } from '@/actions/auth-actions'
import { resendVerificationEmail } from '@/actions/email'
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
import { signUpSchema, signUpValues } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useCountdown } from 'usehooks-ts'
import { Button } from '@/components/ui/button'
import {
  onDiscordSignInClicked,
  onGithubSignInClicked,
  onGoogleSignInClicked,
} from '@/queries'
import { GithubIcon } from '@/components/icons/github'

import { GoogleIcon } from '@/components/icons/google'
import { DiscordIcon } from '@/components/icons/discord'
import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function SignUpForm() {
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

  const [isPending, startTransition] = useTransition()

  const [showSendEmail, setShowSendEmail] = useState<boolean>(false)

  const form = useForm<signUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: signUpValues) {
    startTransition(() => {
      signUp(values).then((response) => {
        if (response && response?.error) {
          toast.error(response.error)
          return
        }
        toast.success('Account created successfully, Email verification sent!')
        form.reset()
        setShowSendEmail(true)
      })
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
    <div className='space-y-4 w-full max-w-md mx-auto'>
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
        Sign up with GitHub
      </Button>
      <Button
        onClick={onGoogleSignInClicked}
        variant='secondary'
        className='w-full flex items-center justify-center gap-2'
      >
        <GoogleIcon className='w-5 h-5' />
        Sign up with Google
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
            name='displayName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder='Vansh Chopra' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder='Username' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  <PasswordInput placeholder='********' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder='********' {...field} />
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
              variant={'linkHover2'}
            >
              Send verification email{' '}
              {count > 0 && count < 60 && `in ${count}s`}
            </Button>
          )}
          <LoadingButton loading={isPending} type='submit' className='w-full'>
            Create account
          </LoadingButton>
        </form>
      </Form>
    </div>
  )
}
