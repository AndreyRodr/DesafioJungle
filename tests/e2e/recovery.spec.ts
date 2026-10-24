import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.reload()
})

test('catalog shows an error for a deterministic HTTP 503 and recovers', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('kurio:mock-network-scenario:v1', JSON.stringify({
    match: '/api/nfts', mode: 'http-error', status: 503,
  })))
  await page.reload()
  await expect(page.getByRole('alert').filter({ hasText: /não foi possível carregar os NFTs/i })).toBeVisible()
  await page.evaluate(() => localStorage.removeItem('kurio:mock-network-scenario:v1'))
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.locator('#catalog article')).toHaveCount(9)
})

test('catalog recovers from simulated offline network', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('kurio:mock-network-scenario:v1', JSON.stringify({
    match: '/api/nfts', mode: 'offline',
  })))
  await page.reload()
  await expect(page.getByRole('alert').filter({ hasText: /não foi possível carregar os NFTs/i })).toBeVisible()
  await page.evaluate(() => localStorage.removeItem('kurio:mock-network-scenario:v1'))
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.locator('#catalog article')).toHaveCount(9)
})

test('search and sort parameters persist after back, forward, refresh', async ({ page }) => {
  await page.goto('/?q=ape&sort=name_asc')
  await expect(page).toHaveURL(/q=ape/)
  await page.goto('/?q=nomad&sort=price_desc')
  await page.goBack()
  await expect(page).toHaveURL(/q=ape/)
  await page.goForward()
  await expect(page).toHaveURL(/q=nomad/)
  await page.reload()
  await expect(page).toHaveURL(/sort=price_desc/)
})

test('invalid registration reports duplicate account, existing login still works', async ({ page }) => {
  await page.goto('/register')
  await page.locator('#register-name').fill('Outro Colecionador')
  await page.locator('#register-email').fill('collector@kurio.test')
  await page.locator('#register-password').fill('Kurio@123')
  await page.locator('#register-confirm').fill('Kurio@123')
  await page.getByRole('button', { name: 'Criar perfil' }).click()
  await expect(page.getByRole('alert')).toContainText(/cadastrado/i)
  await page.goto('/login')
  await page.locator('#login-email').fill('collector@kurio.test')
  await page.locator('#login-password').fill('Kurio@123')
  await page.getByRole('button', { name: /^entrar$/i }).click()
  await expect(page).toHaveURL(/\/$/)
})

test('keyboard users can reach and toggle login password visibility', async ({ page }) => {
  await page.goto('/login')
  const password = page.locator('#login-password')
  await password.fill('Kurio@123')
  const toggle = page.getByRole('button', { name: 'Mostrar senha' })
  await toggle.focus()
  await expect(toggle).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(password).toHaveAttribute('type', 'text')
  await expect(page.getByRole('button', { name: 'Ocultar senha' })).toBeVisible()
})
