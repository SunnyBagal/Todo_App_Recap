import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import * as api from '../lib/api'
import { useAuthStore } from '../store/authStore'

// Signing in is a *mutation*: it sends data and changes something.
// This is the spot where TanStack Query (server call) hands the result to
// Zustand (browser state): the token from the response goes into the store.

/** Sign in, save the token, then go to the todo list. */
export function useSignin() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (credentials) => api.signin(credentials),
    onSuccess: (data, variables) => {
      // data = { token } from the server; variables = what we sent.
      login(data.token, { email: variables.email })
      navigate('/')
    },
  })
}

/** Create an account, then send the user to the signin page. */
export function useSignup() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (values) => api.signup(values),
    // The signup route does not return a token, so the user signs in after.
    onSuccess: () => navigate('/signin?registered=1'),
  })
}

/** Log out: clear the store and go back to the signin page. */
export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return () => {
    logout()
    navigate('/signin')
  }
}
