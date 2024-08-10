import ModeToggler from '@/components/global/mode-toggle'
import { UserButton } from '@/components/global/user-button'

export const NavbarEnd = async () => {
  return (
    <aside className='flex gap-2 items-center'>
      <UserButton />
      <ModeToggler />
    </aside>
  )
}
