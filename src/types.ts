export type Category =
  | 'Uncategorised'
  | 'Food & Drink'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Bills'
  | 'Other'

export type ScreenId = 'dashboard' | 'transactions' | 'budget' | 'insights' | 'settings'

export interface Spending {
  id: number
  user_id: string
  description: string
  amount: number
  category: Category
  date: string
}

export interface SpendingInput {
  description: string
  amount: number
  category: Category
}

export interface SpendingSummary {
  total: number
  by_category: Record<string, number>
  count: number
}

export interface AuthConfig {
  base_url: string | null
  auth_required: boolean
}

export interface NavItem {
  id: ScreenId
  label: string
  icon: string
}
