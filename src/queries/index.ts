import { createGithubAuthorizationURL } from '@/actions/github'
import { createGoogleAuthorizationURL } from '@/actions/google'
import { toast } from 'sonner'

export const onGithubSignInClicked = async () => {
  console.debug('github sign in clicked')
  const res = await createGithubAuthorizationURL()
  if (res.error) {
    toast.error(res.error)
  } else if (res.success) {
    window.location.href = res.data.toString()
  }
}

export const onGoogleSignInClicked = async () => {
  console.debug('Google sign in clicked')
  const res = await createGoogleAuthorizationURL()
  if (res.error) {
    toast.error(res.error)
  } else if (res.success) {
    window.location.href = res.data.toString()
  }
}
