import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { changePassword, getProfile, updateAvatar, updateProfile } from '@/features/auth/api/auth'
import { useAuth, useAuthActions } from '@/features/auth/hooks/useAuth'
import { actionClass, fieldClass } from '@/features/auth/components/AuthLayout'
import { apiErrorMessage } from '@/features/auth/lib/errors'

export function ProfilePage() {
  const { user } = useAuth()
  const { logout } = useAuthActions()
  const client = useQueryClient()
  const { data: profile, isPending, isError, refetch } = useQuery({ queryKey: ['profile', user?.id], queryFn: getProfile, enabled: Boolean(user) })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const refresh = () => Promise.all([client.invalidateQueries({ queryKey: ['profile', user?.id] }), client.invalidateQueries({ queryKey: ['session'] })])
  const personalMutation = useMutation({ mutationFn: updateProfile, onSuccess: refresh })
  const avatarMutation = useMutation({ mutationFn: updateAvatar, onSuccess: refresh })
  const passwordMutation = useMutation({ mutationFn: changePassword })
  async function savePersonal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('')
    const data = new FormData(event.currentTarget)
    try { await personalMutation.mutateAsync({ name: String(data.get('name') ?? ''), email: String(data.get('email') ?? '') }); setMessage('Dados atualizados com sucesso.') }
    catch (cause) { setError(apiErrorMessage(cause)) }
  }
  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setError(''); setMessage('')
    if (file.size > 250_000 || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { setError('Envie PNG, JPG ou WebP com até 250 KB.'); return }
    try {
      const result = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Falha ao ler a imagem'))
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      await avatarMutation.mutateAsync(result); setMessage('Avatar atualizado.')
    } catch (cause) { setError(apiErrorMessage(cause)) }
  }
  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('')
    const form = event.currentTarget
    const data = new FormData(form)
    try {
      await passwordMutation.mutateAsync({ currentPassword: String(data.get('currentPassword') ?? ''), newPassword: String(data.get('newPassword') ?? '') })
      form.reset(); setMessage('Senha alterada com sucesso.')
    } catch (cause) { setError(apiErrorMessage(cause)) }
  }
  async function signOut() { try { await logout() } finally { window.location.assign('/') } }
  return <main className="mx-auto max-w-4xl px-5 pb-32 pt-10 font-mono text-[#f4ede5] lg:pb-16">
    <h1 className="text-3xl font-bold">Perfil do colecionador</h1>
    <div className="mt-4 flex flex-wrap gap-5 text-sm"><Link to="/wallets" className="text-[#d38d50] underline">Minhas carteiras</Link><Link to="/favorites" className="text-[#d38d50] underline">Favoritos</Link><button type="button" onClick={() => void signOut()} className="text-[#d38d50] underline">Sair da conta</button></div>
    {isPending ? <p role="status" className="mt-6">Carregando dados...</p> : isError || !profile ? <p role="alert" className="mt-6 text-red-300">Falha ao carregar perfil. <button type="button" onClick={() => void refetch()} className="text-[#d38d50] underline">Tentar novamente</button></p> : <>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[#503328] bg-[#251711] p-6">
          <h2 className="text-xl font-bold">Informações pessoais</h2>
          <div className="mt-5 flex items-center gap-4">
            {profile.avatarUrl ? <img src={profile.avatarUrl} alt="Avatar do perfil" className="h-20 w-20 rounded-full object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#503328] text-3xl">{profile.name.charAt(0)}</div>}
            <div><label htmlFor="avatar-input" className="block text-sm">Alterar avatar</label><input id="avatar-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadAvatar(event)} className="mt-2 w-full max-w-52 text-xs" /><p className="mt-1 text-xs text-[#b99872]">PNG, JPG ou WebP, até 250 KB</p></div>
          </div>
          <form key={`${profile.name}|${profile.email}`} onSubmit={(event) => void savePersonal(event)} className="mt-6 space-y-4">
            <div><label htmlFor="profile-name" className="text-sm">Nome</label><input id="profile-name" name="name" className={fieldClass} required minLength={2} maxLength={80} defaultValue={profile.name} /></div>
            <div><label htmlFor="profile-email" className="text-sm">E-mail</label><input id="profile-email" name="email" className={fieldClass} required type="email" defaultValue={profile.email} /></div>
            <button className={actionClass} disabled={personalMutation.isPending || avatarMutation.isPending} type="submit">Salvar alterações</button>
          </form>
        </section>
        <section className="rounded-xl border border-[#503328] bg-[#251711] p-6">
          <h2 className="text-xl font-bold">Alterar senha</h2>
          <form onSubmit={(event) => void updatePassword(event)} className="mt-6 space-y-4">
            <div><label htmlFor="password-current" className="text-sm">Senha atual</label><input id="password-current" name="currentPassword" className={fieldClass} type="password" autoComplete="current-password" required /></div>
            <div><label htmlFor="password-new" className="text-sm">Nova senha</label><input id="password-new" name="newPassword" className={fieldClass} type="password" autoComplete="new-password" minLength={8} required /></div>
            <p className="text-xs text-[#b99872]">Mínimo de 8 caracteres, uma maiúscula e um número.</p>
            <button className={actionClass} disabled={passwordMutation.isPending} type="submit">Atualizar senha</button>
          </form>
        </section>
      </div>
      {message && <p role="status" className="mt-5 text-sm text-[#d38d50]">{message}</p>}
      {error && <p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}
    </>}
  </main>
}
