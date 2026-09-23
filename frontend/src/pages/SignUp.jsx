import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, ErrorText, GradientText, Input } from '../components/ui'
import { useSignup } from '../hooks/useAuth'

export default function SignUp() {
  // Plain useState for the form fields: this data belongs to THIS component
  // only, so it does not need Zustand.
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const signup = useSignup()

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = (e) => {
    e.preventDefault() // stop the browser's full-page reload
    signup.mutate(form) // fires the POST /signup request
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <GradientText as="h1" className="text-3xl font-bold tracking-tight">
          Create your account
        </GradientText>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Start keeping track of what matters today.
        </p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Ada Lovelace"
            autoComplete="name"
          />
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
            minLength={8}
            value={form.password}
            onChange={onChange}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />

          {/* signup.error holds the Error thrown by the API client,
              e.g. "Email already exists". */}
          <ErrorText>{signup.error?.message}</ErrorText>

          {/* isPending is true while the request is in flight. */}
          <Button type="submit" className="w-full" disabled={signup.isPending}>
            {signup.isPending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/signin" className="font-medium text-indigo-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
