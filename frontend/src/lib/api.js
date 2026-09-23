// One place that knows how to call the backend.
// Every component/hook uses these functions instead of calling fetch directly,
// so the token handling and error handling live in a single file.

/**
 * Small wrapper around fetch().
 * - adds the JSON content-type header
 * - adds the Authorization header when a token is passed
 * - turns a failed response into a thrown Error (TanStack Query needs a
 *   thrown error to know a request failed)
 */
async function request(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      // The server's auth middleware expects: Authorization: Bearer <token>
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  // 204 = success with no content (our DELETE route returns this).
  if (response.status === 204) return null

  // Read the body once; if it is not JSON, fall back to an empty object.
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    // data.message is what the server sends, e.g. "Email already exists".
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}

// ---- auth ----
export const signup = (body) => request('/signup', { method: 'POST', body })
export const signin = (body) => request('/signin', { method: 'POST', body })

// ---- todos (all need a token) ----
export const getTodos = (token) => request('/api/todos', { token })

export const createTodo = (token, body) =>
  request('/api/todos', { method: 'POST', body, token })

export const updateTodo = (token, id, body) =>
  request(`/api/todos/${id}`, { method: 'PUT', body, token })

export const deleteTodo = (token, id) =>
  request(`/api/todos/${id}`, { method: 'DELETE', token })
