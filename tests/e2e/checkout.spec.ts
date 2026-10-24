import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('collector@kurio.test')
  await page.getByLabel('Senha').fill('Kurio@123')
  await page.getByRole('button', { name: /^entrar$/i }).click()
  await expect(page).toHaveURL(/\/$/)
})

test('checkout rejects missing wallet with a recovery action', async ({ page }) => {
  await page.locator('#catalog article a[href^="/nft/"]').first().click()
  await page.getByRole('button', { name: /adicionar ao carrinho/i }).click()
  await page.goto('/checkout')
  await expect(page.getByText(/nenhuma carteira cadastrada/i)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Cadastrar carteira', exact: true })).toBeVisible()
})

test('wallet can be registered; order is confirmed and receipt survives refresh', async ({ page }) => {
  await page.goto('/wallets')
  const primary = page.locator('form').first()
  await primary.locator('input[name="label"]').fill('Minha carteira')
  await primary.locator('input[name="address"]').fill('0x1234567890123456789012345678901234567890')
  await primary.locator('select[name="network"]').selectOption('ethereum')
  await primary.getByRole('button', { name: /salvar carteira/i }).click()
  await expect(page.getByRole('status').filter({ hasText: /carteira salva com sucesso/i })).toBeVisible()

  await page.goto('/')
  await page.locator('#catalog article a[href^="/nft/"]').first().click()
  await page.getByRole('button', { name: /adicionar ao carrinho/i }).click()
  await page.goto('/checkout')
  await page.getByLabel(/nome de exibição/i).fill('Colecionador Teste')
  await page.getByLabel(/e-mail/i).fill('collector@kurio.test')
  await page.getByRole('button', { name: /revisar valores atualizados/i }).click()
  await page.getByRole('button', { name: /confirmar compra/i }).click()
  await expect(page).toHaveURL(/\/orders\//)
  await expect(page.getByRole('heading', { name: /pedido confirmado/i })).toBeVisible({ timeout: 15000 })
  await page.reload()
  await expect(page.getByRole('heading', { name: /pedido confirmado/i })).toBeVisible()
})

test('checkout keeps Mercado active and shows the Figma payment sections', async ({ page }, testInfo) => {
  await page.locator('#catalog article a[href^="/nft/"]').first().click()
  await page.getByRole('button', { name: /adicionar ao carrinho/i }).click()
  await page.goto('/checkout')
  await expect(page.getByRole('navigation', { name: 'Caminho do pagamento' })).toContainText('Mercado')
  await expect(page.getByRole('region', { name: 'Dados do colecionador' })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Resumo do pagamento' })).toBeVisible()
  await expect(page.getByText('Tem um código promocional?')).toBeVisible()
  if (testInfo.project.name.includes('desktop')) {
    await expect(page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Mercado' })).toHaveAttribute('aria-current', 'page')
  }
})
