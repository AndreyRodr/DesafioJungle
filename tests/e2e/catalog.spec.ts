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
  const cardLink = page.locator('#catalog article a[href^="/nft/"]').first()
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

test('catalog has nine items per page and right-aligned numbered navigation', async ({ page }) => {
  await page.goto('/')
  const cards = page.locator('#catalog article')
  await expect(cards).toHaveCount(9)
  const pagination = page.getByRole('navigation', { name: 'Paginação de NFTs' })
  await expect(pagination.getByRole('link', { name: 'Ir para a página 4' })).toBeVisible()
  await expect(pagination.getByRole('link', { name: 'Próxima página' })).toBeVisible()
  await pagination.getByRole('link', { name: 'Ir para a página 2' }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect(cards).toHaveCount(9)
  await pagination.getByRole('link', { name: 'Ir para a página 4' }).click()
  await expect(page).toHaveURL(/page=4/)
  await expect(cards).toHaveCount(5)
  await expect(pagination.getByRole('link', { name: 'Próxima página' })).toHaveCount(0)
})

test('NFT detail keeps edition, quantity and cart interactions on desktop and mobile', async ({ page }) => {
  await page.goto('/nft/emerald-ape-042')
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
  await expect(page.getByText('Coleção: Kurio Apes').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Aumentar quantidade' })).toBeVisible()
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(page.getByRole('spinbutton', { name: 'Quantidade' })).toHaveValue('2')
  await page.getByRole('button', { name: 'Diminuir quantidade' }).click()
  await expect(page.getByRole('spinbutton', { name: 'Quantidade' })).toHaveValue('1')
  await expect(page.getByRole('button', { name: 'Comprar agora' })).toBeVisible()
  if (page.viewportSize()?.width && page.viewportSize()!.width >= 1024) {
    await expect(page.getByRole('heading', { name: 'Mais desta coleção' })).toBeVisible()
    await page.getByRole('button', { name: 'Ver imagem 2' }).click()
    await expect(page.getByRole('button', { name: 'Ver imagem 2' })).toHaveAttribute('aria-pressed', 'true')
  }
})

test('desktop Home and Mercado use the same 1280px content alignment', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Shared desktop shell is measured only at desktop viewport')
  await page.goto('/')
  const homeMain = await page.locator('main').first().boundingBox()
  const homeHeader = await page.locator('header > div').first().boundingBox()
  expect(homeMain).not.toBeNull()
  expect(homeHeader).not.toBeNull()
  expect(Math.abs(homeMain!.x - homeHeader!.x)).toBeLessThanOrEqual(1)
  expect(Math.abs(homeMain!.width - homeHeader!.width)).toBeLessThanOrEqual(1)

  await page.goto('/nft/emerald-ape-042')
  const marketMain = await page.locator('main').first().boundingBox()
  const marketHeader = await page.locator('header > div').first().boundingBox()
  expect(marketMain).not.toBeNull()
  expect(marketHeader).not.toBeNull()
  expect(Math.abs(marketMain!.x - homeMain!.x)).toBeLessThanOrEqual(1)
  expect(Math.abs(marketMain!.width - homeMain!.width)).toBeLessThanOrEqual(1)
  expect(Math.abs(marketMain!.x - marketHeader!.x)).toBeLessThanOrEqual(1)
})

test('desktop header logo, Entrar and content have the exact same x coordinates across routes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Desktop geometry only')
  async function geometry() {
    return page.evaluate(() => {
      const header = document.querySelector('header > div')
      const main = document.querySelector('main')
      const logo = document.querySelector('header a[href="/"]')
      const login = [...document.querySelectorAll('header a')].find(a => a.textContent?.trim() === 'Entrar')
      if (!header || !main || !logo || !login) throw new Error('Required navigation and page shell missing')
      const h = header.getBoundingClientRect()
      const m = main.getBoundingClientRect()
      const l = logo.getBoundingClientRect()
      const b = login.getBoundingClientRect()
      return {
        headerLeft: h.left,
        headerRight: h.right,
        mainLeft: m.left,
        mainRight: m.right,
        logoLeft: l.left,
        loginRight: b.right,
        maxWidth: getComputedStyle(header).maxWidth,
        viewportWidth: window.innerWidth,
      }
    })
  }
  await page.goto('/')
  const home = await geometry()
  await page.goto('/nft/emerald-ape-042')
  const market = await geometry()
  for (const key of ['headerLeft', 'headerRight', 'mainLeft', 'mainRight', 'logoLeft', 'loginRight'] as const) {
    expect(Math.abs(home[key] - market[key]), key).toBeLessThanOrEqual(1)
  }
  expect(home.maxWidth).toBe('1280px')
  expect(market.maxWidth).toBe('1280px')
  expect(home.viewportWidth).toBe(market.viewportWidth)
})

test('mobile NFT purchase toolbar stays fixed and gallery header has brown background', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile-only layout')
  await page.goto('/nft/emerald-ape-042')
  const toolbar = page.getByRole('complementary', { name: 'Barra de compra do NFT' })
  await expect(toolbar).toBeVisible()
  await expect(toolbar.getByRole('button', { name: 'Comprar agora' })).toBeVisible()
  await expect(toolbar.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeVisible()
  await expect(toolbar.getByRole('spinbutton', { name: 'Quantidade' })).toBeVisible()

  const before = await toolbar.evaluate(element => ({
    position: getComputedStyle(element).position,
    bottomGap: Math.abs(window.innerHeight - element.getBoundingClientRect().bottom),
  }))
  expect(before.position).toBe('fixed')
  expect(before.bottomGap).toBeLessThanOrEqual(1)

  const gallery = page.locator('main > div.grid > div').first()
  await expect(gallery.getByRole('link', { name: 'Voltar ao catálogo' })).toBeVisible()
  await expect(gallery.getByRole('button', { name: 'Adicionar aos favoritos' })).toBeVisible()
  const bg = await gallery.evaluate(element => getComputedStyle(element).backgroundImage)
  expect(bg).toContain('gradient')

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(toolbar).toBeInViewport()
  const after = await toolbar.evaluate(element => Math.abs(window.innerHeight - element.getBoundingClientRect().bottom))
  expect(after).toBeLessThanOrEqual(1)
})
