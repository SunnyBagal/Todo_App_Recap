import { useState } from 'react'
import { useDeleteTodo, useUpdateTodo } from '../hooks/useTodos'
import { Button, Input } from './ui'

/** One row in the list. Switches between "reading" and "editing" mode. */
export default function TodoItem({ todo }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState({ title: todo.title, description: todo.description })

  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()

  const save = (e) => {
    e.preventDefault()
    // mutate() accepts anything; our hook expects { id, ...fields }.
    updateTodo.mutate(
      { id: todo._id, ...draft },
      // onSuccess here (instead of in the hook) because closing the editor is
      // specific to THIS row.
      { onSuccess: () => setIsEditing(false) },
    )
  }

  if (isEditing) {
    return (
      <li className="rounded-xl border border-indigo-200 bg-white p-4 dark:border-indigo-900 dark:bg-slate-900">
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
    <li className="group flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="min-w-0">
        <h3 className="truncate font-medium text-slate-900 dark:text-white">{todo.title}</h3>
        {todo.description && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{todo.description}</p>
        )}
        <p className="mt-2 text-xs text-slate-400">
          {new Date(todo.created_At).toLocaleDateString()}
        </p>
      </div>

      {/* Buttons fade in on hover, but stay visible on keyboard focus. */}
      <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
        <Button variant="ghost" onClick={() => setIsEditing(true)} aria-label="Edit todo">
          Edit
        </Button>
        <Button
          variant="danger"
          onClick={() => deleteTodo.mutate(todo._id)}
          disabled={deleteTodo.isPending}
          aria-label="Delete todo"
        >
          {deleteTodo.isPending ? '…' : 'Delete'}
        </Button>
      </div>
    </li>
  )
}
