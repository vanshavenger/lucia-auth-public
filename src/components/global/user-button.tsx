import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOutIcon, User } from 'lucide-react'
import { validateRequest } from '@/auth'
import Image from 'next/image'
import { LogoutButton } from '@/components/global/logout-button'

export const UserButton = async () => {
  const user = await validateRequest()
  if (!user.user) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label='user profile trigger'>
        {user.user.imageUrl ? (
          <Image
            src={user.user.imageUrl}
            alt='user-button'
            className='rounded-full object-contain'
            width={40}
            height={40}
          />
        ) : (
          <User size={35} className='border border-gray-500 rounded-full p-1' />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-40' align='end'>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <LogoutButton>
          <DropdownMenuItem>
            <LogOutIcon className='h-4 w-4 mr-2' />
            Logout
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
