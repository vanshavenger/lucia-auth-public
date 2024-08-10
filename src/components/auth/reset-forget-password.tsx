'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { useState, useTransition, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ResetSchema } from '@/schemas'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import LoadingButton from '@/components/global/loading-button'
import { reset } from '@/actions/reset-forget'

export const ResetForm = () => {
  const [isPending, startTransition] = useTransition()
  const [countdown, setCountdown] = useState(0)

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: '',
    },
  })

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    if (countdown > 0) {
      toast.error(
        `Please wait ${countdown} seconds before requesting another reset.`
      )
      return
    }

    startTransition(() => {
      reset(values).then((data) => {
        if (data?.error) {
          toast.error(data.error)
        }
        if (data?.success) {
          toast.success(data.success)
          setCountdown(60) // Start 60-second countdown
        }
      })
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending || countdown > 0}
                    placeholder='john.doe@example.com'
                    type='email'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <LoadingButton
          loading={isPending}
          disabled={isPending || countdown > 0}
          type='submit'
          className='w-full'
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Send reset email'}
        </LoadingButton>
      </form>
    </Form>
  )
}
