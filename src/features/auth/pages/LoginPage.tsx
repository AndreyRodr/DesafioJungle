import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)
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
    <form onSubmit={(event) => void submit(event)} className="space-y-6">
      <div><label htmlFor="login-email" className="sr-only">E-mail</label><input id="login-email" placeholder="contato@email.com" className={fieldClass} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="relative"><label htmlFor="login-password" className="sr-only">Senha</label><input id="login-password" placeholder="Senha" className={fieldClass + ' pr-12'} type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b99872]">{showPassword ? <Eye size={20}/> : <EyeOff size={20}/>}</button></div><p className="text-right text-sm text-[#d38d50]">Esqueceu a senha? <span className="sr-only">Recuperação não implementada na simulação.</span></p>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button disabled={busy} type="submit" className={actionClass}>{busy ? 'Entrando...' : 'Entrar'}</button>
    </form>
    <p className="mt-10 text-center text-base text-[#b99872]">Novo na Kurio? <Link to="/register" search={{ redirect }} className="text-[#d38d50]">Crie uma conta</Link></p>
    <p className="mt-5 text-xs text-[#b99872]">Conta de teste: collector@kurio.test / Kurio@123</p>
  </AuthLayout>
}
