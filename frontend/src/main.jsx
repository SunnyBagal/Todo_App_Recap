import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// The QueryClient is the cache. One instance for the whole app, created
// OUTSIDE the component so a re-render never throws the cache away.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data counts as fresh for 30s; within that window, revisiting a page
      // reads the cache instead of refetching.
      staleTime: 30_000,
      // Don't retry a failed request 3 times (the default) — for a small app
      // it's nicer to show the error right away.
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* QueryClientProvider makes the cache available to every useQuery below it. */}
    <QueryClientProvider client={queryClient}>
      {/* BrowserRouter enables <Route>, <Link> and useNavigate. */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
