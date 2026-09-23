// Tests for the Zustand playground store. Run: npm test
//
// A store is a plain JavaScript object, so testing it needs no browser and no
// React — you call getState() and check the values.

import { beforeEach, describe, expect, it } from 'vitest'
import { useCounterStore } from './counterStore'

// A store is created ONCE per file, so state leaks between tests unless you
// reset it. This runs before each test.
beforeEach(() => {
  useCounterStore.setState({ count: 0, history: [] })
})

describe('counter store', () => {
  it('starts at zero', () => {
    expect(useCounterStore.getState().count).toBe(0)
  })

  it('increments and decrements', () => {
    const { increment, decrement } = useCounterStore.getState()

    increment()
    increment()
    expect(useCounterStore.getState().count).toBe(2)

    decrement()
    expect(useCounterStore.getState().count).toBe(1)
  })

  it('resets back to zero', () => {
    useCounterStore.getState().setCount(42)
    expect(useCounterStore.getState().count).toBe(42)

    useCounterStore.getState().reset()
    expect(useCounterStore.getState().count).toBe(0)
  })

  it('keeps other fields when one field changes', () => {
    useCounterStore.getState().remember() // history: [0]
    useCounterStore.getState().increment() // count: 1, history untouched

    const state = useCounterStore.getState()
    expect(state.count).toBe(1)
    expect(state.history).toEqual([0])
  })

  it('notifies subscribers when state changes', () => {
    const seen = []
    // subscribe() runs your callback after every change. Components do this
    // internally; here we watch it by hand. It returns an unsubscribe function.
    const unsubscribe = useCounterStore.subscribe((state) => seen.push(state.count))

    useCounterStore.getState().increment()
    useCounterStore.getState().increment()
    unsubscribe()
    useCounterStore.getState().increment() // not recorded: we unsubscribed

    expect(seen).toEqual([1, 2])
  })
})
