// Tiny building blocks so the pages don't repeat long Tailwind class strings.
// Each one is a normal React component that forwards its props to the element.

export function Button({ variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ' +
    'disabled:cursor-not-allowed disabled:opacity-60'

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
    danger: 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40',
  }

  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
      )}
      <input
        className={
          'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 ' +
          'placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ' +
          'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ' +
          className
        }
        {...props}
      />
      {error && <span className="mt-1.5 block text-sm text-rose-600">{error}</span>}
    </label>
  )
}

export function Card({ className = '', ...props }) {
  return (
    <div
      className={
        'rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur ' +
        'dark:border-slate-800 dark:bg-slate-900/70 ' +
        className
      }
      {...props}
    />
  )
}

/** Red box used to show an error message from the API. */
export function ErrorText({ children }) {
  if (!children) return null
  return (
    <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
      {children}
    </p>
  )
}

/** Grey pulsing placeholder shown while todos are loading. */
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`} />
}
