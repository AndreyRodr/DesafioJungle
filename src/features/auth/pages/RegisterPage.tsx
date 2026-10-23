import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { AuthLayout, actionClass, fieldClass } from '../components/AuthLayout'
import { apiErrorMessage } from '../lib/errors'
import { safeReturnPath } from '../lib/session'
import { useAuthActions } from '../hooks/useAuth'

export function RegisterPage() {
  const { redirect } = useSearch({ from: '/register' })
  const navigate = useNavigate()
  const { register } = useAuthActions()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setError('Use ao menos 8 caracteres, uma letra maiúscula e um número.')
      return
    }
    setError('')
    setBusy(true)
    try {
      await register(name, email, password)
      const destination = safeReturnPath(redirect)
      if (destination === '/') await navigate({ to: '/' })
      else window.location.assign(destination)
    } catch (cause) {
      setError(apiErrorMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  return <AuthLayout title="Criar conta" description="Junte-se aos colecionadores da Kurio.">
    <form onSubmit={(event) => void submit(event)} className="space-y-5">
      <div><label htmlFor="register-name" className="text-sm">Nome</label><input id="register-name" className={fieldClass} minLength={2} maxLength={80} required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div><label htmlFor="register-email" className="text-sm">E-mail</label><input id="register-email" className={fieldClass} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div><label htmlFor="register-password" className="text-sm">Senha</label><input id="register-password" className={fieldClass} type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <div><label htmlFor="register-confirm" className="text-sm">Confirme a senha</label><input id="register-confirm" className={fieldClass} type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button disabled={busy} type="submit" className={actionClass}>{busy ? 'Criando conta...' : 'Cadastrar'}</button>
    </form>
    <p className="mt-6 text-sm text-[#b99872]">Já possui conta? <Link to="/login" search={{ redirect }} className="text-[#d38d50] underline">Entrar</Link></p>
  </AuthLayout>
}
