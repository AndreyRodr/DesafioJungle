import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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
      <div><label htmlFor="register-name" className="sr-only">Nome de usuário</label><input id="register-name" placeholder="Nome de usuário" className={fieldClass} minLength={2} maxLength={80} required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div><label htmlFor="register-email" className="sr-only">E-mail</label><input id="register-email" placeholder="Digite seu e-mail" className={fieldClass} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="relative"><label htmlFor="register-password" className="sr-only">Senha</label><input id="register-password" placeholder="Senha" className={fieldClass + " pr-12"} type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b99872]">{showPassword ? <Eye size={20}/> : <EyeOff size={20}/>}</button></div>
      <div className="relative"><label htmlFor="register-confirm" className="sr-only">Confirme a senha</label><input id="register-confirm" placeholder="Confirmar senha" className={fieldClass + " pr-12"} type={showConfirm ? "text" : "password"} required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /><button type="button" aria-label={showConfirm ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"} onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b99872]">{showConfirm ? <Eye size={20}/> : <EyeOff size={20}/>}</button></div>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button disabled={busy} type="submit" className={actionClass}>{busy ? 'Criando conta...' : 'Criar perfil'}</button>
    </form>
    <p className="mt-10 text-center text-base text-[#b99872]">Já possui conta? <Link to="/login" search={{ redirect }} className="text-[#d38d50] underline">Entrar</Link></p>
  </AuthLayout>
}
