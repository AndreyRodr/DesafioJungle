/** Converte uma string decimal de ETH para wei sem usar números de ponto flutuante. */
export function ethToWei(value: string): bigint {
  if (!/^(0|[1-9]\d*)(\.\d{1,18})?$/.test(value)) {
    throw new Error('Valor ETH inválido')
  }
  const [whole, decimal = ''] = value.split('.')
  return BigInt(whole) * 10n ** 18n + BigInt(decimal.padEnd(18, '0'))
}
