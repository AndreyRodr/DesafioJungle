import { ethToWei } from '@/features/nft/lib/price'

const WEI = 10n ** 18n

/** Decimais financeiros só trafegam como string; cálculos sempre em bigint. */
export function weiToEth(value: bigint): string {
  const negative = value < 0n
  const positive = negative ? -value : value
  const whole = positive / WEI
  const decimals = (positive % WEI).toString().padStart(18, '0').replace(/0+$/, '')
  return `${negative ? '-' : ''}${whole}${decimals ? `.${decimals}` : ''}`
}

export function multiplyEth(value: string, quantity: number): bigint {
  if (!Number.isSafeInteger(quantity) || quantity < 0) throw new Error('Quantidade inválida')
  return ethToWei(value) * BigInt(quantity)
}
