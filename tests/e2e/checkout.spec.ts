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
  // isVisible() consulta imediatamente: durante a hidratação ele retorna false
  // mesmo quando o layout mobile aparecerá logo em seguida.
  const mobileProject = test.info().project.name === 'chromium-mobile'
  const scope = mobileProject
    ? page.getByRole('region', { name: 'Carteiras no mobile' })
    : page.getByRole('region', { name: 'Dados do colecionador' })
  await expect(scope).toBeVisible()
  await expect(scope.getByText(/nenhuma carteira cadastrada/i)).toBeVisible()
  await expect(scope.getByRole('link', { name: 'Cadastrar carteira', exact: true })).toBeVisible()
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
  if (test.info().project.name === 'chromium-mobile') {
    const mobileBuyer = page.getByRole('button', { name: 'Editar dados do colecionador' })
    await expect(mobileBuyer).toBeVisible()
    await mobileBuyer.click()
  }
  await expect(page.getByLabel(/nome de exibição/i)).toBeVisible()
  await page.getByLabel(/nome de exibição/i).fill('Colecionador Teste')
  await page.getByLabel(/e-mail/i).fill('collector@kurio.test')
  await page.getByRole('button', { name: /revisar valores atualizados/i }).filter({ visible: true }).click()
  await page.getByRole('button', { name: /confirmar compra/i }).filter({ visible: true }).click()
  await expect(page).toHaveURL(/\/orders\//)
  await expect(page.getByRole('heading', { name: /pedido confirmado/i })).toBeVisible({ timeout: 15000 })
  await page.reload()
  await expect(page.getByRole('heading', { name: /pedido confirmado/i })).toBeVisible()
})
