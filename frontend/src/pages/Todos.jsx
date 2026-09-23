import AddTodoForm from '../components/AddTodoForm'
import TodoItem from '../components/TodoItem'
import { Card, ErrorText, Skeleton } from '../components/ui'
import { useLogout } from '../hooks/useAuth'
import { useTodos } from '../hooks/useTodos'
import { useAuthStore } from '../store/authStore'
import { filterTodos, useFilterStore } from '../store/filterStore'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'done', label: 'Done' },
]

/** Thin bar under the heading showing how much is finished. */
function ProgressBar({ done, total }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="mt-4">
      <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>
          {done} of {total} done
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        {/* The width is the only thing that changes; the transition makes it
            slide instead of jumping when you tick something. */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default function Todos() {
  const { data: todos, isPending, isError, error } = useTodos()

  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  const filter = useFilterStore((s) => s.filter)
  const setFilter = useFilterStore((s) => s.setFilter)

  const all = todos ?? []
  const doneCount = all.filter((t) => t.done).length

  // Unfinished todos float to the top; finished ones sink. sort() changes the
  // array in place, so copy it first with [...] — never sort the cache itself.
  const visible = [...filterTodos(all, filter)].sort(
    (a, b) => Number(Boolean(a.done)) - Number(Boolean(b.done)),
  )

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Your todos</h1>
              {user && <p className="text-xs text-slate-500">{user.email}</p>}
            </div>
            <button
              onClick={logout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Log out
            </button>
          </div>

          {all.length > 0 && <ProgressBar done={doneCount} total={all.length} />}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <AddTodoForm />

        {all.length > 0 && (
          <div className="mb-4 inline-flex rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800/70">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={
                  'rounded-lg px-4 py-1.5 text-sm font-medium transition ' +
                  (filter === tab.id
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white')
                }
              >
                {tab.label}
                {tab.id === 'done' && doneCount > 0 && (
                  <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    {doneCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {isPending && (
          <div className="space-y-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        )}

        {isError && <ErrorText>{error.message}</ErrorText>}

        {/* Nothing at all yet */}
        {!isPending && all.length === 0 && (
          <Card className="text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Nothing here yet. Add your first todo above.
            </p>
          </Card>
        )}

        {/* Todos exist, but none match the chosen tab */}
        {all.length > 0 && visible.length === 0 && (
          <Card className="text-center">
            <p className="text-slate-600 dark:text-slate-400">
              {filter === 'done' ? 'Nothing finished yet.' : 'All done — enjoy the quiet.'}
            </p>
          </Card>
        )}

        {visible.length > 0 && (
          <ul className="space-y-3">
            {visible.map((todo) => (
              <TodoItem key={todo._id} todo={todo} />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
