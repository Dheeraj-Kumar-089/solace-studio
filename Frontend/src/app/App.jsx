import './App.css'
import { RouterProvider } from 'react-router'
import { routes } from './app.routes'
import { useSelector } from 'react-redux'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useCart } from '../features/cart/hook/useCart'
import { useEffect } from 'react'


function App() {


  const { handleGetMe } = useAuth()
  const { handleGetCart } = useCart()

  const user = useSelector(state => state.auth.user)

  useEffect(() => {
    // Resolve the session first, then eagerly hydrate the cart so the nav
    // badge is correct immediately on page load/reload — not only after the
    // user manually opens the cart page.
    (async () => {
      const resolvedUser = await handleGetMe()
      if (!resolvedUser || resolvedUser.role === 'seller') return
      try {
        await handleGetCart()
      } catch (err) {
        console.error('Failed to hydrate cart on load', err)
      }
    })()
  }, [])

  return (
    <>
      <RouterProvider router={routes} />
    </>
  )
}

export default App
