import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()
})

test('login persists after refresh and protected profile opens', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('collector@kurio.test')
  await page.getByLabel('Senha').fill('Kurio@123')
  await page.getByRole('button', { name: /^entrar$/i }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.reload()
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: /perfil do colecionador/i })).toBeVisible()
})

test('a visitor is redirected to login for protected checkout', async ({ page }) => {
  await page.goto('/checkout')
  await expect(page).toHaveURL(/\/login/)
})

test('cart survives refresh and discount API accepts KURIO10', async ({ page }) => {
  await page.goto('/')
  await page.locator('#catalog article a[href^="/nft/"]').first().click()
  await page.getByRole('button', { name: /adicionar ao carrinho/i }).click()
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: /carrinho de nfts/i })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: /remover/i }).first()).toBeVisible()
  await page.getByPlaceholder('Código do cupom').fill('KURIO10')
  await page.getByRole('button', { name: /^aplicar$/i }).click()
  await expect(page.getByText('KURIO10 aplicado')).toBeVisible()
})
