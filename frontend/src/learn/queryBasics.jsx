// ============================================================
// TANSTACK QUERY BASICS — playground file.
// Nothing in the app imports this. Run the tests with:  npm test
// ============================================================

import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query'

// ------------------------------------------------------------
// 1. A fake "API". In a real app this would be fetch().
//    The tests replace it, which is exactly why it's a parameter below
//    instead of being hard-coded inside the hook.
// ------------------------------------------------------------
export const fakeApi = {
  getFruits: async () => {
    await new Promise((r) => setTimeout(r, 10)) // pretend network delay
    return ['apple', 'banana']
  },
  addFruit: async (name) => {
    await new Promise((r) => setTimeout(r, 10))
    if (!name) throw new Error('Name is required')
    return { name }
  },
}

// ------------------------------------------------------------
// 2. useQuery — for READING data.
// ------------------------------------------------------------
export function useFruits(api = fakeApi) {
  return useQuery({
    // queryKey: the cache entry's name. Two components using ['fruits'] share
    // one request and one cached result.
    queryKey: ['fruits'],
    // queryFn: must return a promise. Query awaits it and caches the result.
    queryFn: () => api.getFruits(),
  })
}
//
// In a component:
//   const { data, isPending, isError, error } = useFruits()
//
// What happens over time:
//   render 1 -> isPending: true,  data: undefined     (request in flight)
//   render 2 -> isPending: false, data: ['apple','banana']
//   if it throws -> isError: true, error.message holds the message
//
// Note: the request starts on its own. You never call it in useEffect.

// ------------------------------------------------------------
// 3. useMutation — for CHANGING data.
// ------------------------------------------------------------
export function useAddFruit(api = fakeApi) {
  return useMutation({
    // mutationFn receives whatever you pass to mutate().
    mutationFn: (name) => api.addFruit(name),
  })
}
//
// In a component:
//   const addFruit = useAddFruit()
//   addFruit.mutate('cherry')        // starts the request
//   addFruit.isPending               // true while it runs
//   addFruit.error?.message          // 'Name is required' when it fails
//
// Difference from useQuery: a query runs by itself when the component mounts;
// a mutation runs only when YOU call mutate().

// ------------------------------------------------------------
// 4. Test helper: every useQuery needs a QueryClientProvider above it.
//    This builds a fresh client + wrapper for one test.
// ------------------------------------------------------------
export function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      // retry: false — otherwise a failing request is retried 3 times and the
      // test waits for all of them.
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}
