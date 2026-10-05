import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthProvider from './auth/AuthProvider'
import { PublicOnly, RequireAuth } from './auth/RouteGuards'
import HomeRedirect from './components/HomeRedirect'
import Layout from './components/Layout'
import PetDashboard from './components/PetDashboard'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import RegisterPage from './pages/RegisterPage'

/** Rutas de la aplicación: login y registro públicos, callback de Google y el resto protegido por sesión. */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnly />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Vuelta del login con Google: fuera de los guards porque aún no hay sesión */}
          <Route path="auth/callback" element={<AuthCallbackPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route index element={<HomeRedirect />} />
              <Route path="pets/:petId" element={<PetDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
