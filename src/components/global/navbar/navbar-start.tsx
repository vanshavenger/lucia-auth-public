'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { useSession } from '@/components/providers/session-provider'

export const NavbarStart = () => {
  const session = useSession()
  const pathname = usePathname()
  return (
    <aside className='flex items-center gap-2'>
      <Link
        href={'/'}
        className={
          (cn(
            buttonVariants({
              variant: 'ghost',
            })
          ),
          'hidden lg:flex lg:items-center')
        }
      >
        <Image
          src='https://img.freepik.com/free-photo/smiley-businesswoman-posing-outdoors-with-arms-crossed-copy-space_23-2148767055.jpg'
          alt='logo'
          width={40}
          height={40}
        />
        <p
          className={cn('ml-2 font-bold flex', {
            'text-primary': pathname === '/',
          })}
        >
          DSA & DEV
        </p>
      </Link>
    </aside>
  )
}
