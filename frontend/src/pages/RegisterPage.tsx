import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import { ApiError } from '../api/api-client'
import { useAuth } from '../auth/auth-context'
import { Field } from '../components/forms/FormControls'
import { errorMessage } from '../utils/errors'
import { emailRules, optional, REQUIRED, strictlyPastDateRules, textRules } from '../utils/validation'
import AuthLayout from './AuthLayout'
import GoogleButton from './GoogleButton'
import { inputClass, primaryButton } from '../constants/styles'

interface RegisterFormValues {
  fullName: string
  email: string
  password: string
  confirm: string
  birthDate: string
}

/** Mensaje de error del registro: email repetido en un 409, genérico en lo demás. */
function registerErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) return 'Ya existe una cuenta con ese email.'
  return errorMessage(error)
}

/** Página de registro; al crear la cuenta el usuario entra directamente. */
export default function RegisterPage() {
  const { register: registerAccount } = useAuth()
  const { state } = useLocation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    defaultValues: { fullName: '', email: '', password: '', confirm: '', birthDate: '' },
  })

  /** Al registrarse, el backend devuelve un token y PublicOnly redirige al inicio */
  const submit = handleSubmit(async (values) => {
    try {
      await registerAccount({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        birthDate: optional(values.birthDate),
      })
    } catch (error) {
      setError('root.server', { message: registerErrorMessage(error) })
    }
  })

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Lleva el control de paseos, citas y gastos de tus mascotas."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" state={state} className="font-semibold text-brown underline underline-offset-2">
            Inicia sesión
          </Link>
        </>
      }
    >
      {/* Reglas alineadas con RegisterRequest en openapi.yaml */}
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Nombre completo" error={errors.fullName?.message}>
          <input
            autoComplete="name"
            autoFocus
            className={inputClass}
            {...register('fullName', textRules({ required: true, maxLength: 150 }))}
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input type="email" autoComplete="email" className={inputClass} {...register('email', emailRules)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contraseña" hint="Mínimo 8 caracteres." error={errors.password?.message}>
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              {...register('password', {
                required: REQUIRED,
                minLength: { value: 8, message: 'Mínimo 8 caracteres.' },
                maxLength: { value: 72, message: 'Máximo 72 caracteres.' },
              })}
            />
          </Field>
          <Field label="Repite la contraseña" error={errors.confirm?.message}>
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              {...register('confirm', {
                required: REQUIRED,
                validate: (value, values) => value === values.password || 'Las contraseñas no coinciden.',
              })}
            />
          </Field>
        </div>
        <Field label="Fecha de nacimiento (opcional)" error={errors.birthDate?.message}>
          <input type="date" className={inputClass} {...register('birthDate', strictlyPastDateRules)} />
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
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
      <GoogleButton />
    </AuthLayout>
  )
}
