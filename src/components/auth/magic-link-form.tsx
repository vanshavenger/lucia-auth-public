'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCountdown } from 'usehooks-ts'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { signIn } from '@/actions/magic-link'
import { magicLinkSchema } from '@/schemas'
import LoadingButton from '../global/loading-button'
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Mail, ArrowRight } from 'lucide-react'

export function MagicLinkForm() {
  const [isPending, startTransition] = useTransition()
  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({
      countStart: 60,
      intervalMs: 1000,
    })
  const [showResendLink, setShowResendLink] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof magicLinkSchema>>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: '',
    },
  })

  useEffect(() => {
    if (count === 0) {
      stopCountdown()
      resetCountdown()
      setShowResendLink(true)
    }
  }, [count, resetCountdown, stopCountdown])

  async function onSubmit(values: z.infer<typeof magicLinkSchema>) {
    startTransition(async () => {
      const res = await signIn(values)

      if (!res.success) {
        toast.error(res.message)
      } else {
        toast.success(res.message)
        startCountdown()
        setShowResendLink(false)
        // Optionally, you can keep the user on this page instead of redirecting
        // router.push('/')
      }
    })
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <div className='flex items-center space-x-2'>
          <Mail className='w-6 h-6 text-primary' />
          <CardTitle>Magic Link Sign In</CardTitle>
        </div>
        <CardDescription>
          Enter your email to receive a magic link for instant access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='your@email.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton
              loading={isPending}
              type='submit'
              className='w-full'
              disabled={
                isPending || (!showResendLink && count > 0 && count < 60)
              }
            >
              {isPending
                ? 'Sending...'
                : count > 0 && count < 60 && !showResendLink
                  ? `Resend in ${count}s`
                  : 'Send Magic Link'}
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
      <CardFooter className='flex justify-center'>
        <Button
          variant='link'
          onClick={() => router.push('/login')}
          className='text-sm'
        >
          Back to traditional login <ArrowRight className='ml-2 w-4 h-4' />
        </Button>
      </CardFooter>
    </Card>
  )
}
