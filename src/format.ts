export const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
})

export function formatCurrency(value: number): string {
  return currency.format(value)
}

export function compactCurrency(value: number): string {
  if (value >= 1000) {
    return `${currency.format(value / 1000)}k`
  }

  return currency.format(value)
}

export function categoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Food & Drink': 'restaurant',
    Transport: 'directions_car',
    Shopping: 'shopping_bag',
    Entertainment: 'theater_comedy',
    Health: 'health_and_safety',
    Bills: 'receipt_long',
    Other: 'category',
    Uncategorised: 'more_horiz',
  }

  return icons[category] ?? 'category'
}
