import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ZUSTAND = a small box outside React that holds state any component can read.
//
// Why not useState? useState lives inside one component. The token is needed by
// the todo page, the navbar and the route guard, so it would have to be passed
// down through every component in between ("prop drilling"). A store avoids that.
//
// create((set, get) => ({ ...state, ...actions }))
//   set(...)  updates the state and re-renders every component using it
//   get()     reads the current state inside an action
//
// persist(...) is middleware: it saves the state to localStorage and loads it
// again on page refresh, so a logged-in user stays logged in.

export const useAuthStore = create(
  persist(
    (set) => ({
      // ---- state ----
      token: null,
      user: null, // { email } — just enough to show who is logged in

      // ---- actions ----
      // Called after a successful signin.
      login: (token, user) => set({ token, user }),

      // Called by the logout button (and when the API says the token expired).
      logout: () => set({ token: null, user: null }),
    }),
    {
      // The localStorage key the state is saved under.
      name: 'todo-auth',
    },
  ),
)

// Helper for code outside React (no hooks allowed there), e.g. an API error
// handler that needs to log the user out.
export const getToken = () => useAuthStore.getState().token
