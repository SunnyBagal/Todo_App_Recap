import { Navigate, Route, Routes } from 'react-router-dom'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Todos from './pages/Todos'
import { useAuthStore } from './store/authStore'

/**
 * Route guard: if there is no token in the store, send the visitor to /signin.
 * `replace` swaps the history entry so the back button doesn't bounce them
 * between the two pages.
 */
function RequireAuth({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/signin" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Todos />
          </RequireAuth>
        }
      />
      {/* Anything else goes home. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
