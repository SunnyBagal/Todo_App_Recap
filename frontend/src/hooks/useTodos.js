import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../lib/api'
import { useAuthStore } from '../store/authStore'

// TANSTACK QUERY = handles data that lives on the server.
//
// Rule of thumb:
//   Zustand  -> state the browser owns (the token, a theme, a modal being open)
//   Query    -> data the server owns (todos). It caches it, refetches it,
//               and gives you isLoading / isError for free.
//
// useQuery    = reading data  (GET)
// useMutation = changing data (POST/PUT/DELETE)

// A "query key" is the name of a cache entry. Same key = same cached data.
// Keeping it in one constant avoids typos like ['todo'] vs ['todos'].
export const todosKey = ['todos']

/** Read all todos of the logged-in user. */
export function useTodos() {
  const token = useAuthStore((s) => s.token)

  return useQuery({
    queryKey: todosKey,
    // queryFn must RETURN a promise; Query awaits it for you.
    queryFn: () => api.getTodos(token),
    // Don't even try to fetch when there is no token (user logged out).
    enabled: Boolean(token),
  })
  // What you get back:
  //   { data, isPending, isError, error, refetch, ... }
  //   data      -> the array of todos once loaded (undefined before that)
  //   isPending -> true while the first load is running
}

/**
 * All three write operations share the same "after success" step:
 * invalidate the todos cache so the list refetches and shows the change.
 */
function useTodoMutation(mutationFn) {
  const token = useAuthStore((s) => s.token)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables) => mutationFn(token, variables),
    onSuccess: () => {
      // "This cached data is stale -> fetch it again."
      queryClient.invalidateQueries({ queryKey: todosKey })
    },
  })
  // What you get back:
  //   mutate(variables)  -> starts the request (fire and forget)
  //   isPending          -> true while it runs (use it to disable a button)
  //   error              -> the thrown Error if it failed
}

/** Add a todo: createMutation.mutate({ title, description }) */
export function useCreateTodo() {
  return useTodoMutation((token, body) => api.createTodo(token, body))
}

/** Edit a todo: updateMutation.mutate({ id, title, description }) */
export function useUpdateTodo() {
  return useTodoMutation((token, { id, ...body }) => api.updateTodo(token, id, body))
}

/** Remove a todo: deleteMutation.mutate(id) */
export function useDeleteTodo() {
  return useTodoMutation((token, id) => api.deleteTodo(token, id))
}
