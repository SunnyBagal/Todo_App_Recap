import { useState } from 'react'
import { useDeleteTodo, useToggleDone, useUpdateTodo } from '../hooks/useTodos'
import { gradientFor, gradientTextStyle } from '../lib/gradient'
import { Button, Input } from './ui'

/** The round tick button on the left of every card. */
function DoneButton({ done, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={done}
      aria-label={done ? 'Mark as not done' : 'Mark as done'}
      className={
        'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition-all duration-300 ' +
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ' +
        (done
          ? 'border-emerald-500 bg-emerald-500 scale-100'
          : 'border-slate-300 hover:border-emerald-500 hover:scale-110 dark:border-slate-600')
      }
    >
      {/* The checkmark draws itself in when the todo becomes done:
          scale-0 -> scale-100 is what makes it "pop". */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="3.5"
        stroke="currentColor"
        className={
          'size-4 text-white transition-transform duration-300 ' + (done ? 'scale-100' : 'scale-0')
        }
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    </button>
  )
}

export default function TodoItem({ todo }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState({ title: todo.title, description: todo.description })

  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()
  const toggleDone = useToggleDone()

  // Older todos were saved before the `done` field existed, so it can be
  // null/undefined. Boolean() turns any of those into false.
  const done = Boolean(todo.done)

  const save = (e) => {
    e.preventDefault()
    updateTodo.mutate({ id: todo._id, ...draft }, { onSuccess: () => setIsEditing(false) })
  }

  if (isEditing) {
    return (
      <li className="rounded-2xl border border-indigo-300 bg-white p-4 shadow-sm dark:border-indigo-800 dark:bg-slate-900">
        <form onSubmit={save} className="space-y-3">
          <Input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            required
            autoFocus
          />
          <Input
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Description"
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={updateTodo.isPending}>
              {updateTodo.isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li
      className={
        'group relative overflow-hidden rounded-2xl border bg-white p-4 pl-5 transition-all duration-300 ' +
        (done
          ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/20'
          : 'border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700')
      }
    >
      {/* Coloured stripe down the left edge: the todo's own gradient while
          it's open, solid green once it's done. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1.5 transition-all duration-300"
        style={{ backgroundImage: done ? 'none' : gradientFor(todo._id) }}
      >
        {done && <span className="block size-full bg-emerald-500" />}
      </span>

      <div className="flex items-start gap-3">
        <DoneButton done={done} onClick={() => toggleDone.mutate({ id: todo._id, done: !done })} />

        <div className="min-w-0 flex-1">
          <h3
            className={
              'truncate text-lg font-bold transition-all duration-300 ' +
              (done ? 'text-slate-400 line-through decoration-2 dark:text-slate-500' : '')
            }
            // The gradient fill is dropped once done, so the strikethrough
            // grey reads as "finished" instead of competing with the colours.
            style={done ? undefined : gradientTextStyle(todo._id)}
          >
            {todo.title}
          </h3>

          {todo.description && (
            <p
              className={
                'mt-1 text-sm transition-colors duration-300 ' +
                (done
                  ? 'text-slate-400 line-through dark:text-slate-600'
                  : 'text-slate-600 dark:text-slate-400')
              }
            >
              {todo.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {new Date(todo.created_At).toLocaleDateString()}
            </span>
            {done && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                Done
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <Button variant="ghost" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteTodo.mutate(todo._id)}
            disabled={deleteTodo.isPending}
          >
            {deleteTodo.isPending ? '…' : 'Delete'}
          </Button>
        </div>
      </div>
    </li>
  )
}
