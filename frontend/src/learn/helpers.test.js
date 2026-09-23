// Tests for the two small helpers behind the new UI.
//
// Both are plain functions that take input and return output — no React, no
// store, no network. That is exactly why they were written as separate
// functions instead of being buried inside a component: this file needs three
// lines per case.

import { describe, expect, it } from 'vitest'
import { gradientFor } from '../lib/gradient'
import { filterTodos } from '../store/filterStore'

describe('gradientFor', () => {
  it('gives the same id the same gradient every time', () => {
    // This is the whole point: a re-render must not change the colours.
    expect(gradientFor('abc123')).toBe(gradientFor('abc123'))
  })

  it('returns a usable CSS gradient', () => {
    expect(gradientFor('abc123')).toMatch(/^linear-gradient\(/)
  })

  it('survives a missing id', () => {
    // A todo being created optimistically may not have an _id yet.
    expect(gradientFor()).toMatch(/^linear-gradient\(/)
  })

  it('spreads different ids across different gradients', () => {
    const ids = ['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8']
    const unique = new Set(ids.map(gradientFor))
    // Not all 8 need to differ (that's chance), but they must not all collapse
    // into one colour.
    expect(unique.size).toBeGreaterThan(1)
  })
})

describe('filterTodos', () => {
  const todos = [
    { _id: '1', title: 'open', done: false },
    { _id: '2', title: 'finished', done: true },
    { _id: '3', title: 'old todo saved before the done field existed' }, // done is undefined
  ]

  it('returns everything for "all"', () => {
    expect(filterTodos(todos, 'all')).toHaveLength(3)
  })

  it('"active" keeps unfinished todos, including old ones with no done field', () => {
    expect(filterTodos(todos, 'active').map((t) => t._id)).toEqual(['1', '3'])
  })

  it('"done" keeps only finished todos', () => {
    expect(filterTodos(todos, 'done').map((t) => t._id)).toEqual(['2'])
  })

  it('handles an empty list', () => {
    expect(filterTodos([], 'done')).toEqual([])
    expect(filterTodos(undefined, 'all')).toEqual([])
  })
})
