import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOutIcon, User, User2 } from 'lucide-react'
import { validateRequest } from '@/auth'
import { LogoutButton } from '@/components/global/logout-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const UserButton = async () => {
  const user = await validateRequest()
  if (!user.user) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label='user profile trigger'>
        <Avatar aria-label='user avatar'>
          <AvatarImage alt='user-button' src={user.user.imageUrl ?? ''} />
          <AvatarFallback className='bg-primary'>
            <User2 className='text-white dark:text-black' />
          </AvatarFallback>
        </Avatar>
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
