'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCountdown } from 'usehooks-ts'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { magicLinkSchema } from '@/schemas'
import { toast } from 'sonner'
import { signIn } from '@/actions/magic-link'
import LoadingButton from '../global/loading-button'

export function MagicLinkForm() {
  const [isPending, startTransition] = useTransition()
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

  const [showResendVerificationEmail, setShowResendVerificationEmail] =
    useState(false)

  const router = useRouter()

  const form = useForm<z.infer<typeof magicLinkSchema>>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: z.infer<typeof magicLinkSchema>) {
    startTransition(async () => {
      const res = await signIn(values)

      if (!res.success) {
        toast.error(res.message)
      } else if (res.success) {
        toast.success(res.message)

        router.push('/')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='shadcn' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />{' '}
        <LoadingButton loading={isPending} type='submit' className='w-full'>
          Send Magic Email
        </LoadingButton>
      </form>
    </Form>
  )
}
