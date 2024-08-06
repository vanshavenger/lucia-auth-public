import { logout } from '@/actions/auth-actions'
import { validateRequest } from '@/auth'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const { user } = await validateRequest()
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      {JSON.stringify(user)}
      <form action={logout}>
        <Button type='submit'>Log out</Button>
      </form>
    </main>
  )
}
