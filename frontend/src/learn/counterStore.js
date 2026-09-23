// ============================================================
// ZUSTAND BASICS — playground file.
// Nothing in the app imports this. Change it, break it, experiment.
// Run the tests with:  npm test
// ============================================================

import { create } from 'zustand'

// create() takes a function and gives you back a HOOK.
// The function receives `set` (change state) and `get` (read state).
export const useCounterStore = create((set, get) => ({
  // ---------- state ----------
  count: 0,
  history: [],

  // ---------- actions (just functions that call set) ----------

  // Form 1: pass an updater function. Use this when the new value depends
  // on the old one — it always sees the latest state.
  increment: () => set((state) => ({ count: state.count + 1 })),

  decrement: () => set((state) => ({ count: state.count - 1 })),

  // Form 2: pass an object. Use this when the new value is independent.
  reset: () => set({ count: 0 }),

  // set() MERGES the object into the state (like React's old setState).
  // Here only `count` changes; `history` keeps its value.
  setCount: (value) => set({ count: value }),

  // get() reads the current state inside an action.
  // Arrays/objects must be REPLACED, not mutated: create a new array with
  // [...old, new] so React sees a new reference and re-renders.
  remember: () => set((state) => ({ history: [...state.history, get().count] })),
}))

// ------------------------------------------------------------
// HOW YOU USE IT IN A COMPONENT
// ------------------------------------------------------------
//
//   function Counter() {
//     // A "selector" picks ONE piece of state. This component re-renders
//     // only when `count` changes — not when `history` changes.
//     const count = useCounterStore((s) => s.count)
//     const increment = useCounterStore((s) => s.increment)
//
//     return <button onClick={increment}>Count: {count}</button>
//   }
//
// Output: a button reading "Count: 0"; each click renders "Count: 1", "2", …
//
// Common beginner mistake:
//   const { count, increment } = useCounterStore()   // no selector
// This subscribes to the WHOLE store, so the component re-renders on every
// change anywhere in it. Fine for a tiny store, wasteful for a big one.
//
// ------------------------------------------------------------
// OUTSIDE REACT (no hooks needed) — this is what the tests use:
//
//   useCounterStore.getState().count        // 0        read
//   useCounterStore.getState().increment()  //          call an action
//   useCounterStore.getState().count        // 1        read again
//   useCounterStore.setState({ count: 10 }) //          set directly
// ------------------------------------------------------------
