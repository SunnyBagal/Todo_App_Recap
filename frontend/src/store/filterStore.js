import { create } from 'zustand'

// A second, deliberately tiny Zustand store — a good example of what belongs
// in one: "which tab is selected" is state the BROWSER owns. It isn't saved on
// the server, so TanStack Query has no business holding it.
//
// It lives in its own store (not in authStore) because the two are unrelated;
// small focused stores are easier to read and to test.

export const useFilterStore = create((set) => ({
  // 'all' | 'active' | 'done'
  filter: 'all',
  setFilter: (filter) => set({ filter }),
}))

/**
 * Plain helper, deliberately OUTSIDE the store and outside React, so it can be
 * unit-tested with no store and no rendering:
 *
 *   filterTodos([{ done: true }], 'active')  ->  []
 */
export function filterTodos(todos = [], filter) {
  if (filter === 'active') return todos.filter((t) => !t.done)
  if (filter === 'done') return todos.filter((t) => t.done)
  return todos
}
