import { useState, type FormEvent, type ChangeEvent } from 'react'
import { pageShellClass } from '@/components/layout/pageShell'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { changePassword, getProfile, updateAvatar, updateProfile, listWallets } from '@/features/auth/api/auth'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ProfileSidebar } from '../components/ProfileSidebar'
import { actionClass, fieldClass } from '@/features/auth/components/AuthLayout'
import { apiErrorMessage } from '@/features/auth/lib/errors'
import { Eye, EyeOff, ImageIcon } from 'lucide-react'

export function ProfilePage() {
  const { user } = useAuth()
  const client = useQueryClient()
  const { data: profile, isPending, isError, refetch } = useQuery({ queryKey: ['profile', user?.id], queryFn: getProfile, enabled: Boolean(user) })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const walletsQuery = useQuery({ queryKey: ['wallets', user?.id], queryFn: listWallets, enabled: Boolean(user) })
  const primaryWallet = walletsQuery.data?.find(wallet => wallet.slot === 'primary')
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
    if (String(data.get('newPassword')) !== String(data.get('confirmPassword'))) { setError('A confirmação não corresponde à nova senha.'); return }
    try {
      await passwordMutation.mutateAsync({ currentPassword: String(data.get('currentPassword') ?? ''), newPassword: String(data.get('newPassword') ?? '') })
      form.reset(); setMessage('Senha alterada com sucesso.')
    } catch (cause) { setError(apiErrorMessage(cause)) }
  }
  return <div className={`${pageShellClass} pb-32 pt-8 font-mono text-[#f4ede5] lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8 lg:pb-16`}>
    <ProfileSidebar active="profile" />
    <main className="min-w-0">
    <h1 className="text-lg font-bold">Perfil do colecionador</h1>
    {isPending ? <p role="status" className="mt-6">Carregando dados...</p> : isError || !profile ? <p role="alert" className="mt-6 text-red-300">Falha ao carregar perfil. <button type="button" onClick={() => void refetch()} className="text-[#d38d50] underline">Tentar novamente</button></p> : <>
      <div className="mt-8 space-y-9">
        <section aria-label="Dados pessoais">
          <form key={`${profile.name}|${profile.email}`} onSubmit={(event) => void savePersonal(event)} className="grid gap-x-7 gap-y-6 sm:grid-cols-2">
            <div><label htmlFor="profile-name" className="text-sm">Nome de exibição <span className="text-[#d38d50]">*</span></label><input id="profile-name" name="name" className={fieldClass} required minLength={2} maxLength={80} defaultValue={profile.name} /></div>
            <div><label htmlFor="profile-username" className="text-sm">Nome de usuário</label><input id="profile-username" className={fieldClass} value={profile.name} readOnly title="O nome de usuário utiliza o nome cadastrado na simulação" /></div>
            <div><label htmlFor="profile-email" className="text-sm">E-mail <span className="text-[#d38d50]">*</span></label><input id="profile-email" name="email" className={fieldClass} required type="email" defaultValue={profile.email} /></div>
            <div><label htmlFor="profile-ens" className="text-sm">Nome ENS</label><div className="mt-2 flex items-center gap-3"><span className="rounded border border-[#503328] px-4 py-3 text-sm text-[#b99872]">.eth</span><input id="profile-ens" className={fieldClass + ' !mt-0'} readOnly placeholder="Sem ENS conectado" aria-describedby="ens-help" /></div><p id="ens-help" className="mt-1 text-xs text-[#b99872]">A simulação não registra nomes ENS.</p></div>
            <div><label htmlFor="profile-wallet-name" className="text-sm">Apelido da carteira</label><input id="profile-wallet-name" className={fieldClass} readOnly value={primaryWallet?.label ?? ''} placeholder="Cadastre sua carteira" /><p className="mt-1 text-xs text-[#b99872]">Altere em Carteiras.</p></div>
            <div><span className="block text-sm">Avatar</span><div className="mt-2 flex items-center gap-4">{profile.avatarUrl ? <img src={profile.avatarUrl} alt="Avatar do perfil" className="h-12 w-12 rounded-full object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#302018] text-[#d38d50]"><ImageIcon size={22}/></span>}<label htmlFor="avatar-input" className="cursor-pointer rounded bg-[#d38d50] px-5 py-3 text-sm font-bold text-[#160e0b]">Alterar</label><input id="avatar-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadAvatar(event)} className="sr-only" /></div><p className="mt-1 text-xs text-[#b99872]">PNG, JPG ou WebP, até 250 KB.</p></div>
            <button className={actionClass + ' sm:w-fit'} disabled={personalMutation.isPending || avatarMutation.isPending} type="submit">Salvar alterações</button>
          </form>
        </section>
        <section>
          <h2 className="text-base font-bold">Alterar senha</h2>
          <form onSubmit={(event) => void updatePassword(event)} className="mt-4 max-w-md space-y-5">
            <label className="block text-sm">Senha atual<div className="relative"><input name="currentPassword" className={fieldClass + ' pr-12'} type={showPasswords ? 'text' : 'password'} autoComplete="current-password" required /><button type="button" onClick={() => setShowPasswords(value => !value)} aria-label={showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b99872]">{showPasswords ? <Eye size={18}/> : <EyeOff size={18}/>}</button></div></label>
            <label className="block text-sm">Nova senha<input name="newPassword" className={fieldClass} type={showPasswords ? 'text' : 'password'} autoComplete="new-password" minLength={8} required /></label>
            <label className="block text-sm">Confirmar nova senha<input name="confirmPassword" className={fieldClass} type={showPasswords ? 'text' : 'password'} autoComplete="new-password" minLength={8} required /></label>
            <p className="text-xs text-[#b99872]">Mínimo de 8 caracteres, uma maiúscula e um número.</p>
            <button className={actionClass + ' sm:w-fit'} disabled={passwordMutation.isPending} type="submit">Salvar</button>
          </form>
        </section>
      </div>
      {message && <p role="status" className="mt-5 text-sm text-[#d38d50]">{message}</p>}
      {error && <p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}
    </>}
    </main>
  </div>
}
