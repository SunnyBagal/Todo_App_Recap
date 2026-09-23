// Tests for the TanStack Query playground. Run: npm test
//
// Hooks can't be called outside a component, so renderHook() renders a tiny
// throwaway component for us and hands back whatever the hook returns.

import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createTestWrapper, useAddFruit, useFruits } from './queryBasics'

describe('useQuery (reading data)', () => {
  it('is pending first, then returns the data', async () => {
    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useFruits(), { wrapper })

    // First render: the request has been sent but hasn't finished.
    expect(result.current.isPending).toBe(true)
    expect(result.current.data).toBeUndefined()

    // waitFor retries until the assertion passes (or times out).
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(['apple', 'banana'])
    expect(result.current.isPending).toBe(false)
  })

  it('reports an error when the request fails', async () => {
    // vi.fn() is a fake function; here it rejects, like a 500 from the server.
    const api = { getFruits: vi.fn().mockRejectedValue(new Error('Server is down')) }
    const wrapper = createTestWrapper()

    const { result } = renderHook(() => useFruits(api), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error.message).toBe('Server is down')
  })
})

describe('useMutation (changing data)', () => {
  it('does nothing until mutate() is called', async () => {
    const api = { addFruit: vi.fn().mockResolvedValue({ name: 'cherry' }) }
    const wrapper = createTestWrapper()

    const { result } = renderHook(() => useAddFruit(api), { wrapper })

    // Unlike a query, a mutation waits for you.
    expect(api.addFruit).not.toHaveBeenCalled()
    expect(result.current.isPending).toBe(false)

    result.current.mutate('cherry')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.addFruit).toHaveBeenCalledWith('cherry')
    expect(result.current.data).toEqual({ name: 'cherry' })
  })

  it('exposes the error when the mutation fails', async () => {
    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useAddFruit(), { wrapper })

    result.current.mutate('') // the fake API rejects an empty name

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error.message).toBe('Name is required')
  })
})
