import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()
})

test('catalog renders and NFT cards navigate to detail', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /catálogo/i })).toHaveCount(0)
  const cardLink = page.locator('#catalog a[href^="/nft/"]').first()
  await expect(cardLink).toBeVisible()
  await cardLink.click()
  await expect(page).toHaveURL(/\/nft\/[^/]+/)
  await expect(page.getByRole('button', { name: /comprar agora/i })).toBeVisible()
})

test('an unknown NFT shows an error instead of a successful purchase', async ({ page }) => {
  await page.goto('/nft/not-a-real-nft')
  await expect(page.getByRole('heading', { name: /nft não encontrado/i })).toBeVisible()
})

test('page preserves its catalog search parameters after refresh', async ({ page }) => {
  await page.goto('/?q=nomad&sort=price_desc&page=2')
  await page.reload()
  await expect(page).toHaveURL(/q=nomad/)
  await expect(page).toHaveURL(/sort=price_desc/)
})
