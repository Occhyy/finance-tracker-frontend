<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import {
  createSpending,
  deleteSpending,
  fetchAuthConfig,
  fetchSpendings,
  fetchSummary,
} from './api'
import { authReady, authUser, initAuth, initLocalAuth, isAuthenticated } from './auth'
import AccountPanel from './components/AccountPanel.vue'
import AuthView from './components/AuthView.vue'
import CategoryBars from './components/CategoryBars.vue'
import MetricCard from './components/MetricCard.vue'
import SpendingForm from './components/SpendingForm.vue'
import TransactionList from './components/TransactionList.vue'
import { categoryIcon, compactCurrency, formatCurrency } from './format'
import type { AuthConfig, NavItem, ScreenId, Spending, SpendingInput, SpendingSummary } from './types'

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
  { id: 'transactions', label: 'Transactions', icon: 'receipt_long' },
  { id: 'budget', label: 'Budget', icon: 'account_balance_wallet' },
  { id: 'insights', label: 'Insights', icon: 'query_stats' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

const activeScreen = ref<ScreenId>('dashboard')
const spendings = shallowRef<Spending[]>([])
const summary = shallowRef<SpendingSummary>({ total: 0, by_category: {}, count: 0 })
const authConfig = shallowRef<AuthConfig | null>(null)
const loading = ref(false)
const booting = ref(true)
const setupError = ref('')
const error = ref('')
const success = ref('')

const topCategory = computed(() => {
  const [name, value] =
    Object.entries(summary.value.by_category).sort(([, a], [, b]) => b - a)[0] ?? []

  return {
    name: name ?? 'None yet',
    value: value ?? 0,
    icon: name ? categoryIcon(name) : 'category',
  }
})

const averageSpend = computed(() => {
  if (summary.value.count === 0) {
    return 0
  }

  return summary.value.total / summary.value.count
})

const budgetLimit = computed(() => Math.max(1800, summary.value.total + 350))
const budgetUsedPercent = computed(() => Math.min(100, Math.round((summary.value.total / budgetLimit.value) * 100)))
const largestTransactions = computed(() => [...spendings.value].sort((a, b) => b.amount - a.amount).slice(0, 5))
const canUseApi = computed(() => authConfig.value?.auth_required === false || isAuthenticated.value)
const shouldShowAuth = computed(() => authConfig.value?.auth_required === true && authReady.value && !isAuthenticated.value)

function setMessage(kind: 'error' | 'success', message: string): void {
  if (kind === 'error') {
    error.value = message
    success.value = ''
    return
  }

  success.value = message
  error.value = ''
}

async function loadData(): Promise<void> {
  if (!canUseApi.value) {
    spendings.value = []
    summary.value = { total: 0, by_category: {}, count: 0 }
    return
  }

  loading.value = true
  try {
    const [nextSpendings, nextSummary] = await Promise.all([fetchSpendings(), fetchSummary()])
    spendings.value = nextSpendings
    summary.value = nextSummary
    error.value = ''
  } catch (err) {
    setMessage('error', err instanceof Error ? err.message : 'Could not load finance data')
  } finally {
    loading.value = false
  }
}

async function loadAuthConfig(): Promise<void> {
  try {
    authConfig.value = await fetchAuthConfig()
    if (authConfig.value.auth_required && !authConfig.value.base_url) {
      throw new Error('Authentication is required but no Neon Auth URL is configured.')
    }

    if (authConfig.value.auth_required && authConfig.value.base_url) {
      await initAuth(authConfig.value.base_url)
      return
    }

    initLocalAuth()
  } catch (err) {
    setupError.value = err instanceof Error ? err.message : 'Could not load auth config'
  }
}

async function addSpending(input: SpendingInput): Promise<void> {
  try {
    await createSpending(input)
    setMessage('success', 'Transaction saved')
    await loadData()
  } catch (err) {
    setMessage('error', err instanceof Error ? err.message : 'Could not save transaction')
  }
}

async function removeSpending(id: number): Promise<void> {
  try {
    await deleteSpending(id)
    setMessage('success', 'Transaction deleted')
    await loadData()
  } catch (err) {
    setMessage('error', err instanceof Error ? err.message : 'Could not delete transaction')
  }
}

function screenTitle(screen: ScreenId): string {
  const titles: Record<ScreenId, string> = {
    dashboard: 'Smart Dashboard',
    transactions: 'Transaction Ledger',
    budget: 'Budget Control',
    insights: 'Spending Insights',
    settings: 'Account Settings',
  }

  return titles[screen]
}

onMounted(async () => {
  booting.value = true
  try {
    await loadAuthConfig()
    await loadData()
  } finally {
    booting.value = false
  }
})
</script>

<template>
  <div v-if="booting" class="grid min-h-screen place-items-center bg-background text-text">
    <div class="ghost-border rounded-card bg-surface-low p-6 text-center shadow-panel">
      <span class="material-symbols-outlined text-primary">sync</span>
      <p class="mt-3 font-semibold">Preparing your workspace...</p>
    </div>
  </div>

  <div v-else-if="setupError" class="grid min-h-screen place-items-center bg-background px-5 text-text">
    <section class="ghost-border max-w-lg rounded-card bg-surface-low p-6 shadow-panel">
      <p class="font-mono text-xs uppercase tracking-[0.12em] text-danger">Setup error</p>
      <h1 class="mt-2 text-2xl font-bold">Authentication is not configured</h1>
      <p class="mt-3 text-muted">{{ setupError }}</p>
    </section>
  </div>

  <AuthView
    v-else-if="shouldShowAuth"
    :config="authConfig"
    @authenticated="loadData"
  />

  <div v-else class="min-h-screen bg-background text-text">
    <aside
      class="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-border bg-surface py-8 lg:flex"
    >
      <div class="px-6">
        <h1 class="text-2xl font-bold text-primary">FinanceTracker</h1>
        <p class="font-mono text-xs text-muted">Neon-backed workspace</p>
      </div>

      <button
        class="mx-4 mt-8 flex items-center justify-center gap-2 rounded-control bg-primary px-4 py-3 font-bold text-primary-dark shadow-neon transition hover:scale-[0.99]"
        type="button"
        @click="activeScreen = 'dashboard'"
      >
        <span class="material-symbols-outlined">add</span>
        New Transaction
      </button>

      <nav class="mt-8 flex-1 space-y-1">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="flex w-full items-center gap-4 border-r-4 px-6 py-3 text-left transition"
          :class="
            activeScreen === item.id
              ? 'border-primary bg-surface-high font-bold text-primary'
              : 'border-transparent text-muted hover:bg-surface-low hover:text-text'
          "
          type="button"
          @click="activeScreen = item.id"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-fill': activeScreen === item.id }">
            {{ item.icon }}
          </span>
          {{ item.label }}
        </button>
      </nav>

      <div class="mx-6 rounded-card bg-surface-low p-4">
        <p class="font-mono text-xs text-muted">Auth</p>
        <p class="mt-1 truncate text-sm font-semibold">
          {{ authConfig?.auth_required === false ? 'Local mode' : authUser?.email ?? 'Signed in' }}
        </p>
      </div>
    </aside>

    <header
      class="sticky top-0 z-30 border-b border-border bg-surface/95 px-5 py-4 backdrop-blur lg:fixed lg:left-72 lg:right-0 lg:h-16 lg:px-10"
    >
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="font-mono text-xs uppercase tracking-[0.12em] text-muted">Modern Minimalist Finance Tracker</p>
          <h2 class="text-2xl font-semibold">{{ screenTitle(activeScreen) }}</h2>
        </div>
        <div class="flex items-center gap-3">
          <button
            v-for="item in navItems"
            :key="item.id"
            class="grid h-10 w-10 place-items-center rounded-control border border-border text-muted transition hover:border-primary hover:text-primary lg:hidden"
            :class="{ 'border-primary bg-surface-high text-primary': activeScreen === item.id }"
            type="button"
            :aria-label="item.label"
            @click="activeScreen = item.id"
          >
            <span class="material-symbols-outlined">{{ item.icon }}</span>
          </button>
          <button
            class="hidden items-center gap-2 rounded-control border border-border px-4 py-2 text-muted transition hover:border-primary hover:text-primary sm:flex"
            type="button"
            @click="loadData"
          >
            <span class="material-symbols-outlined">sync</span>
            Refresh
          </button>
        </div>
      </div>
    </header>

    <main class="px-5 py-6 lg:ml-72 lg:px-10 lg:pb-10 lg:pt-24">
      <div class="mx-auto max-w-7xl space-y-6">
        <div
          v-if="error || success"
          class="rounded-card border px-4 py-3"
          :class="error ? 'border-danger bg-danger-deep/25 text-danger' : 'border-primary bg-primary/10 text-primary'"
        >
          {{ error || success }}
        </div>

        <div v-if="loading" class="rounded-card border border-border bg-surface-low p-4 text-muted">
          Loading finance data...
        </div>

        <section class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <MetricCard label="Total Spent" :value="formatCurrency(summary.total)" icon="payments" tone="danger" />
          <MetricCard
            label="Transactions"
            :value="String(summary.count)"
            icon="receipt_long"
            tone="primary"
            subtext="current user"
          />
          <MetricCard
            label="Top Category"
            :value="topCategory.name"
            :icon="topCategory.icon"
            tone="accent"
            :subtext="topCategory.value ? compactCurrency(topCategory.value) : undefined"
          />
        </section>

        <template v-if="activeScreen === 'dashboard'">
          <section class="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div class="xl:col-span-4">
              <SpendingForm @submit="addSpending" />
            </div>
            <div class="space-y-6 xl:col-span-8">
              <TransactionList :spendings="spendings.slice(0, 8)" @delete="removeSpending" />
              <CategoryBars :values="summary.by_category" />
            </div>
          </section>
        </template>

        <template v-else-if="activeScreen === 'transactions'">
          <TransactionList :spendings="spendings" @delete="removeSpending" />
        </template>

        <template v-else-if="activeScreen === 'budget'">
          <section class="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_25rem]">
            <div class="ghost-border rounded-card bg-surface-low p-6">
              <p class="font-mono text-xs uppercase tracking-[0.12em] text-muted">Monthly Budget</p>
              <div class="mt-4 flex flex-wrap items-end justify-between gap-4">
                <h2 class="text-5xl font-bold text-primary">{{ budgetUsedPercent }}%</h2>
                <p class="text-muted">
                  {{ formatCurrency(summary.total) }} of {{ formatCurrency(budgetLimit) }}
                </p>
              </div>
              <div class="mt-6 h-3 rounded-full bg-background">
                <div class="h-full rounded-full bg-primary shadow-neon" :style="{ width: `${budgetUsedPercent}%` }" />
              </div>
              <p class="mt-4 text-sm text-muted">
                The budget target is adaptive until you define fixed budgets in the next Vue iteration.
              </p>
            </div>
            <CategoryBars :values="summary.by_category" />
          </section>
        </template>

        <template v-else-if="activeScreen === 'insights'">
          <section class="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div class="ghost-border rounded-card bg-surface-low p-6">
              <h2 class="text-2xl font-semibold">Signals</h2>
              <div class="mt-5 grid gap-4 sm:grid-cols-2">
                <MetricCard label="Average" :value="formatCurrency(averageSpend)" icon="monitoring" tone="primary" />
                <MetricCard label="Largest" :value="formatCurrency(largestTransactions[0]?.amount ?? 0)" icon="trending_up" tone="danger" />
              </div>
              <div class="mt-6 space-y-3">
                <article
                  v-for="transaction in largestTransactions"
                  :key="transaction.id"
                  class="flex items-center justify-between rounded-control bg-background p-4"
                >
                  <div class="min-w-0">
                    <p class="truncate font-semibold">{{ transaction.description }}</p>
                    <p class="font-mono text-xs text-muted">{{ transaction.category }}</p>
                  </div>
                  <strong class="font-mono text-danger">{{ formatCurrency(transaction.amount) }}</strong>
                </article>
              </div>
            </div>
            <CategoryBars :values="summary.by_category" />
          </section>
        </template>

        <template v-else>
          <section class="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_24rem]">
            <AccountPanel
              :config="authConfig"
              @signed-out="loadData"
            />
            <div class="ghost-border rounded-card bg-surface-low p-6">
              <p class="font-mono text-xs uppercase tracking-[0.12em] text-muted">Stitch reference</p>
              <h2 class="mt-2 text-2xl font-semibold">Design Assets</h2>
              <p class="mt-4 text-muted">
                Downloaded Stitch HTML and screenshots live in <span class="font-mono text-primary">frontend/stitch</span>.
              </p>
              <div class="mt-5 grid grid-cols-2 gap-3">
                <img
                  v-for="item in navItems"
                  :key="item.id"
                  class="aspect-[4/3] rounded-control border border-border object-cover"
                  :src="`/stitch/images/${item.id}.png`"
                  :alt="`${item.label} Stitch reference`"
                />
              </div>
            </div>
          </section>
        </template>
      </div>
    </main>
  </div>
</template>
