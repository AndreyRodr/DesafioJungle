import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { AuthLayout, actionClass, fieldClass } from '../components/AuthLayout'
import { apiErrorMessage } from '../lib/errors'
import { safeReturnPath } from '../lib/session'
import { useAuthActions } from '../hooks/useAuth'

export function LoginPage() {
  const { redirect } = useSearch({ from: '/login' })
  const navigate = useNavigate()
  const { login } = useAuthActions()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      const destination = safeReturnPath(redirect)
      if (destination === '/') await navigate({ to: '/' })
      else window.location.assign(destination)
    } catch (cause) {
      setError(apiErrorMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  return <AuthLayout title="Entrar na Kurio" description="Continue sua coleção digital.">
    <form onSubmit={(event) => void submit(event)} className="space-y-5">
      <div><label htmlFor="login-email" className="text-sm">E-mail</label><input id="login-email" className={fieldClass} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div><label htmlFor="login-password" className="text-sm">Senha</label><input id="login-password" className={fieldClass} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button disabled={busy} type="submit" className={actionClass}>{busy ? 'Entrando...' : 'Entrar'}</button>
    </form>
    <p className="mt-6 text-sm text-[#b99872]">Ainda não possui conta? <Link to="/register" search={{ redirect }} className="text-[#d38d50] underline">Cadastre-se</Link></p>
    <p className="mt-5 text-xs text-[#b99872]">Conta de teste: collector@kurio.test / Kurio@123</p>
  </AuthLayout>
}
