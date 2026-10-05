import { useForm } from 'react-hook-form'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/api-client'
import { useAuth } from '../auth/auth-context'
import { Field } from '../components/forms/FormControls'
import { errorMessage } from '../utils/errors'
import { emailRules, REQUIRED } from '../utils/validation'
import AuthLayout from './AuthLayout'
import GoogleButton from './GoogleButton'
import { inputClass, primaryButton } from '../constants/styles'

interface LoginFormValues {
  email: string
  password: string
}

/** Mensaje de error del login: credenciales incorrectas en un 401, genérico en lo demás. */
function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) return 'Email o contraseña incorrectos.'
  return errorMessage(error)
}

/** Página de inicio de sesión con email y contraseña o con Google. */
export default function LoginPage() {
  const { login } = useAuth()
  // Conserva la página de origen al saltar a registro y volver
  const { state } = useLocation()
  /** El backend vuelve a /login?error=google si el usuario cancela o Google rechaza el acceso */
  const googleFailed = useSearchParams()[0].get('error') === 'google'
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ defaultValues: { email: '', password: '' } })

  /** Al iniciar sesión, PublicOnly redirige automáticamente */
  const submit = handleSubmit(async ({ email, password }) => {
    try {
      await login({ email: email.trim(), password })
    } catch (error) {
      setError('root.server', { message: loginErrorMessage(error) })
    }
  })

  return (
    <AuthLayout
      title="¡Hola de nuevo!"
      subtitle="Inicia sesión para ver a tus mascotas."
      footer={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link to="/register" state={state} className="font-semibold text-brown underline underline-offset-2">
            Regístrate
          </Link>
        </>
      }
    >
      {googleFailed && (
        <p role="alert" className="mb-4 rounded-xl bg-white/70 px-3 py-2 text-sm text-brown">
          No se pudo iniciar sesión con Google. Inténtalo de nuevo o usa tu email.
        </p>
      )}
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Email" error={errors.email?.message}>
          <input type="email" autoComplete="email" autoFocus className={inputClass} {...register('email', emailRules)} />
        </Field>
        <Field label="Contraseña" error={errors.password?.message}>
          <input
            type="password"
            autoComplete="current-password"
            className={inputClass}
            {...register('password', { required: REQUIRED })}
          />
        </Field>

        {errors.root?.server && (
          <p role="alert" className="rounded-xl bg-white/70 px-3 py-2 text-sm text-brown">
            {errors.root.server.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full ${primaryButton}`}
        >
          {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>
      <GoogleButton />
    </AuthLayout>
  )
}
