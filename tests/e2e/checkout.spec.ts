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

test('checkout rejects missing wallet with a recovery action', async ({ page }, testInfo) => {
  await page.locator('#catalog article a[href^="/nft/"]').first().click()
  await page.getByRole('button', { name: /adicionar ao carrinho/i }).click()
  await page.goto('/checkout')
  const walletSection = testInfo.project.name.includes('mobile')
    ? page.getByRole('region', { name: 'Seleção de carteira no celular' })
    : page.getByRole('region', { name: 'Dados do colecionador' })
  await expect(walletSection.getByText(/nenhuma carteira cadastrada/i)).toBeVisible()
  await expect(walletSection.getByRole('link', { name: 'Cadastrar carteira', exact: true })).toBeVisible()
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
  if (testInfo.project.name.includes('desktop')) {
    await expect(page.getByRole('navigation', { name: 'Caminho do pagamento' })).toContainText('Mercado')
  } else {
    await expect(page.getByRole('heading', { name: 'Pagamento com carteira' }).first()).toBeVisible()
  }
  await expect(page.getByRole('region', { name: 'Dados do colecionador' })).toBeVisible()
  if (testInfo.project.name.includes('desktop')) await expect(page.getByRole('complementary', { name: 'Resumo do pagamento' })).toBeVisible()
  else await expect(page.getByRole('region', { name: 'Seleção de carteira no celular' })).toBeVisible()
  if (testInfo.project.name.includes('desktop')) await expect(page.getByText('Tem um código promocional?')).toBeVisible()
  if (testInfo.project.name.includes('desktop')) {
    await expect(page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Mercado' })).toHaveAttribute('aria-current', 'page')
  }
})

test('desktop checkout has Figma wallet metadata fields', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Desktop form only')
  await page.goto('/checkout')
  const collector = page.getByRole('region', { name: 'Dados do colecionador' })
  await expect(collector.getByLabel(/nome de usuário/i)).toBeVisible()
  await expect(collector.getByLabel(/nome do perfil/i)).toBeVisible()
  await expect(collector.getByLabel(/endereço da carteira/i)).toBeVisible()
  await expect(collector.getByLabel(/tipo de carteira/i)).toBeVisible()
  await expect(collector.getByLabel(/código de indicação/i)).toBeVisible()
  await expect(collector.getByLabel(/ENS ou carteira secundária/i)).toBeVisible()
  await expect(collector.getByLabel(/nome de exibição/i)).toHaveAttribute('required', '')
  await expect(collector.getByLabel(/e-mail/i)).toHaveAttribute('required', '')
})

test('mobile checkout has a fixed buy button and wallet provider choices', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile only')
  await page.goto('/checkout')
  await expect(page.getByRole('heading', { name: 'Pagamento com carteira' }).first()).toBeVisible()
  await expect(page.getByRole('region', { name: 'Seleção de carteira no celular' })).toBeVisible()
  const button = page.getByRole('button', { name: 'Confirmar compra' })
  await expect(button).toBeVisible()
  const panel = button.locator('..')
  const before = await panel.evaluate(element => ({ position: getComputedStyle(element).position, bottom: element.getBoundingClientRect().bottom, viewport: window.innerHeight }))
  expect(before.position).toBe('fixed')
  expect(Math.abs(before.viewport - before.bottom)).toBeLessThanOrEqual(1)
})

test('network choices are interactive and require a matching registered wallet', async ({ page }) => {
  await page.goto('/checkout')
  const network = page.getByLabel('Rede', { exact: false }).first()
  await expect(network).toBeEnabled()
  await network.selectOption('polygon')
  await expect(page.getByText(/você não possui carteira cadastrada para essa rede/i)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Cadastrar carteira' }).first()).toBeVisible()
})

test('ENS extension is selectable and its combined value is retained in the input', async ({ page }) => {
  await page.goto('/checkout')
  const ens = page.getByLabel('Nome ENS (opcional)')
  const suffix = page.getByLabel('Extensão ENS ou domínio')
  await ens.fill('kurio')
  await suffix.selectOption('.xyz')
  await expect(suffix).toHaveValue('.xyz')
  await expect(ens).toHaveValue('kurio')
})

test('checkout text inputs and dropdowns share dimensions and a dark option palette', async ({ page }) => {
  await page.goto('/checkout')
  const nameField = page.getByLabel(/nome de exibição/i)
  const network = page.locator('#checkout-network')
  const walletType = page.getByLabel(/tipo de carteira/i)
  const suffix = page.getByLabel('Extensão ENS ou domínio')
  await expect(nameField).toBeVisible()
  await expect(network).toBeVisible()
  await expect(walletType).toBeVisible()
  const heights = await Promise.all([nameField, network, walletType].map(el => el.evaluate(node => node.getBoundingClientRect().height)))
  for (const height of heights) expect(height).toBe(44)
  await expect(network).toHaveCSS('color-scheme', 'dark')
  await expect(walletType).toHaveCSS('color-scheme', 'dark')
  await expect(suffix).toHaveCSS('color-scheme', 'dark')
  const optionBackground = await walletType.locator('option').first().evaluate(node => getComputedStyle(node).backgroundColor)
  expect(optionBackground).toBe('rgb(37, 23, 17)')
})
