# Learn Zustand + TanStack Query

Everything in this folder is a **playground**. The app never imports it, so you
can change anything here without breaking the real pages. Run the examples with:

```bash
cd frontend
npm test          # run once
npm run test:watch  # re-run on every save
```

---

## Which tool for which job?

| Question | Tool | Example |
|---|---|---|
| Does the **server** own this data? | TanStack Query | todos, user profile, search results |
| Does the **browser** own this data? | Zustand | login token, dark mode, "is the sidebar open" |
| Does only **one component** care? | `useState` | the text in a form field |

The common beginner mistake is putting server data in a store: you then have to
write the loading flags, the error flags and the refetching yourself. That's
exactly what TanStack Query already does.

---

## Zustand in three steps

**Step 1 — create the store** (`counterStore.js`):

```js
import { create } from 'zustand'

export const useCounterStore = create((set) => ({
  count: 0,                                            // state
  increment: () => set((s) => ({ count: s.count + 1 })), // action
}))
```

**Step 2 — read it in a component:**

```jsx
function Counter() {
  const count = useCounterStore((s) => s.count)          // selector
  const increment = useCounterStore((s) => s.increment)
  return <button onClick={increment}>Count: {count}</button>
}
```

Output: a button showing `Count: 0`. Click it → `Count: 1`, `Count: 2`, …

**Step 3 — read it outside React** (what the tests do):

```js
useCounterStore.getState().count       // 0
useCounterStore.getState().increment()
useCounterStore.getState().count       // 1
```

### Things worth knowing

- **`set` merges, it doesn't replace.** `set({ count: 5 })` on
  `{ count: 0, history: [] }` gives `{ count: 5, history: [] }` — `history` survives.
- **Use a selector.** `useCounterStore((s) => s.count)` re-renders the component
  only when `count` changes. `useCounterStore()` with no selector re-renders on
  *every* change in the store.
- **Never mutate.** `state.history.push(x)` won't re-render anything. Build a new
  array instead: `set((s) => ({ history: [...s.history, x] }))`.
- **Reset between tests.** A store is created once per file, so state leaks from
  one test to the next unless you call `setState` in `beforeEach`.

In this app: `src/store/authStore.js` holds the token, and `persist` middleware
saves it in localStorage so a refresh keeps you logged in.

---

## TanStack Query in three steps

**Step 1 — one provider at the top** (`src/main.jsx`):

```jsx
const queryClient = new QueryClient()   // the cache

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

**Step 2 — read data with `useQuery`:**

```js
const { data, isPending, isError, error } = useQuery({
  queryKey: ['todos'],           // the name of this cache entry
  queryFn: () => getTodos(token) // must return a promise
})
```

What you actually see, in order:

```
render 1:  isPending: true    data: undefined
render 2:  isPending: false   data: [ {…}, {…} ]     ← success
  or:      isError:   true    error.message: 'Missing token'
```

The request fires by itself when the component mounts — no `useEffect` needed.

**Step 3 — change data with `useMutation`:**

```js
const createTodo = useMutation({
  mutationFn: (body) => api.createTodo(token, body),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
})

createTodo.mutate({ title: 'Buy milk' })  // you trigger it
createTodo.isPending                      // true while it runs
```

### The one idea that makes it click: `invalidateQueries`

After adding a todo, the cached list is out of date. `invalidateQueries` marks it
stale and TanStack Query refetches it, so the new todo appears without you
touching the list state anywhere. That's the whole trick in
`src/hooks/useTodos.js`.

### Things worth knowing

- **`queryKey` is an identity.** Same key = same cached data shared by every
  component. Include anything the request depends on: `['todos', userId]`.
- **`queryFn` must throw on failure.** Our API client throws on non-2xx, which is
  what turns `isError` on. A `fetch` that returns a 500 without throwing looks
  like success.
- **`enabled: false` pauses a query** — used in `useTodos` so it doesn't fire
  before the user logs in.
- **`staleTime`** is how long data counts as fresh (30s in this app). Within that
  window, revisiting a page uses the cache instead of refetching.

---

## How to test them (see the two test files here)

**A store** needs no React at all — call `getState()` and assert:

```js
useCounterStore.getState().increment()
expect(useCounterStore.getState().count).toBe(1)
```

**A hook** needs a component, so use `renderHook` plus a wrapper that supplies
the QueryClientProvider:

```jsx
const { result } = renderHook(() => useFruits(), { wrapper: createTestWrapper() })
expect(result.current.isPending).toBe(true)
await waitFor(() => expect(result.current.isSuccess).toBe(true))
expect(result.current.data).toEqual(['apple', 'banana'])
```

Two habits that keep hook tests from being flaky:

1. **Pass the API in as an argument** (`useFruits(api)`), so a test can hand it a
   fake that fails on demand. Hard-coded `fetch` calls are painful to fake.
2. **Set `retry: false` in the test client**, otherwise a failing request is
   retried three times and your test waits for all of them.

---

## Try it yourself

1. Add a `double: () => set((s) => ({ count: s.count * 2 }))` action and a test.
2. Make `fakeApi.getFruits` throw and watch the error test pass.
3. In the real app, open DevTools → Network, add a todo, and watch the
   `GET /api/todos` request that `invalidateQueries` triggers right after
   the `POST`.
