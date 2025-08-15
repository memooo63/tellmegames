// Currency conversion rates (approximate, for fallback use)
const CURRENCY_RATES = {
  USD: 0.92,
  GBP: 1.17,
  CAD: 0.68,
  AUD: 0.61,
  JPY: 0.0062,
} as const

export function convertToEUR(price: number, currency: string): number {
  const rate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES]
  return rate ? price * rate : price // Fallback to original if unknown currency
}

export function formatPrice(price: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency,
  }).format(price)
}

export function isPriceInRange(price: number, maxPrice: number, currency = "EUR"): boolean {
  const priceInEUR = currency === "EUR" ? price : convertToEUR(price, currency)
  return priceInEUR <= maxPrice
}
