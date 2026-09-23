import { useState } from 'react'
import { useCreateTodo } from '../hooks/useTodos'
import { Button, Card, ErrorText, GradientText, Input } from './ui'

export default function AddTodoForm() {
  const [form, setForm] = useState({ title: '', description: '' })
  const createTodo = useCreateTodo()

  const onSubmit = (e) => {
    e.preventDefault()
    createTodo.mutate(form, {
      // Clear the inputs only after the server accepted the todo.
      onSuccess: () => setForm({ title: '', description: '' }),
    })
  }

  return (
    <Card className="mb-6">
      <form onSubmit={onSubmit} className="space-y-3">
        <GradientText as="h2" className="text-lg font-bold">
          New todo
        </GradientText>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="What needs doing?"
          required
          maxLength={200}
        />
        <Input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Notes (optional)"
          maxLength={2000}
        />

        <ErrorText>{createTodo.error?.message}</ErrorText>

        <Button type="submit" disabled={createTodo.isPending || !form.title.trim()}>
          {createTodo.isPending ? 'Adding…' : 'Add todo'}
        </Button>
      </form>
    </Card>
  )
}
