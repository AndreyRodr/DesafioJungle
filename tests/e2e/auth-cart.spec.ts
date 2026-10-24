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
  await page.getByLabel('Senha', { exact: true }).fill('Kurio@123')
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

test('cart uses rectangular line items and offers collector recommendations', async ({ page }) => {
  await page.goto('/')
  await page.locator('#catalog article a[href^="/nft/"]').first().click()
  await page.getByRole('button', { name: /adicionar ao carrinho/i }).click()
  await page.goto('/cart')

  const items = page.getByRole('region', { name: 'Itens do carrinho' })
  await expect(items.locator('article')).toHaveCount(1)
  await expect(items.getByRole('button', { name: /aumentar quantidade/i })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Resumo do carrinho' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Colecionadores também viram' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Carrinho de NFTs' })).toBeAttached()

  await items.getByRole('button', { name: /aumentar quantidade/i }).click()
  await expect(items.locator('article')).toContainText('2')
  await page.reload()
  await expect(items.locator('article')).toHaveCount(1)
})

test('mobile checkout summary stays fixed and recommendations remain below cart items', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile-only layout')
  await page.goto('/')
  await page.locator('#catalog article a[href^="/nft/"]').first().click()
  await page.getByRole('button', { name: /adicionar ao carrinho/i }).click()
  await page.goto('/cart')
  const summary = page.getByRole('complementary', { name: 'Resumo do carrinho' })
  await expect(summary).toBeVisible()
  await expect(summary.getByPlaceholder('Código do cupom')).toBeVisible()
  await expect(summary.getByRole('link', { name: 'Conectar e finalizar' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Colecionadores também viram' })).toBeAttached()
  const before = await summary.evaluate(node => ({
    position: getComputedStyle(node).position,
    bottom: node.getBoundingClientRect().bottom,
    viewport: window.innerHeight,
  }))
  expect(before.position).toBe('fixed')
  expect(Math.abs(before.viewport - before.bottom)).toBeLessThanOrEqual(1)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  const after = await summary.evaluate(node => Math.abs(window.innerHeight - node.getBoundingClientRect().bottom))
  expect(after).toBeLessThanOrEqual(1)
})
