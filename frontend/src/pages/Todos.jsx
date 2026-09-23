import AddTodoForm from '../components/AddTodoForm'
import TodoItem from '../components/TodoItem'
import { Card, ErrorText, Skeleton } from '../components/ui'
import { useLogout } from '../hooks/useAuth'
import { useTodos } from '../hooks/useTodos'
import { useAuthStore } from '../store/authStore'

export default function Todos() {
  // useTodos() gives back the three states every request has:
  // loading -> error -> data. The UI renders one branch per state.
  const { data: todos, isPending, isError, error } = useTodos()

  // Reading one field from the store. The selector `(s) => s.user` means this
  // component only re-renders when `user` changes, not on every store update.
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Your todos</h1>
            {user && <p className="text-xs text-slate-500">{user.email}</p>}
          </div>
          <button
            onClick={logout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <AddTodoForm />

        {/* 1. still loading */}
        {isPending && (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        )}

        {/* 2. request failed */}
        {isError && <ErrorText>{error.message}</ErrorText>}

        {/* 3. loaded but empty */}
        {todos?.length === 0 && (
          <Card className="text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Nothing here yet. Add your first todo above.
            </p>
          </Card>
        )}

        {/* 4. loaded with data */}
        {todos?.length > 0 && (
          <ul className="space-y-3">
            {todos.map((todo) => (
              // key lets React tell rows apart when the list changes.
              <TodoItem key={todo._id} todo={todo} />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
