import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, Card, ErrorText, Input } from '../components/ui'
import { useSignin } from '../hooks/useAuth'

export default function SignIn() {
  const [form, setForm] = useState({ email: '', password: '' })
  const signin = useSignin()

  // After signup we redirect here with ?registered=1 so we can show a
  // "account created" banner.
  const [params] = useSearchParams()
  const justRegistered = params.get('registered') === '1'

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = (e) => {
    e.preventDefault()
    signin.mutate(form)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Sign in to see your todos.
        </p>
      </div>

      <Card>
        {justRegistered && (
          <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            Account created — sign in to continue.
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={onChange}
            placeholder="Your password"
            autoComplete="current-password"
          />

          <ErrorText>{signin.error?.message}</ErrorText>

          <Button type="submit" className="w-full" disabled={signin.isPending}>
            {signin.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        New here?{' '}
        <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
