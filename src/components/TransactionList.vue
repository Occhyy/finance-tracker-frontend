<script setup lang="ts">
import { computed, ref } from 'vue'
import { categoryIcon, formatCurrency } from '../format'
import type { Spending } from '../types'

const props = defineProps<{
  spendings: Spending[]
}>()

const emit = defineEmits<{
  delete: [id: number]
}>()

const query = ref('')

const filteredSpendings = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) {
    return props.spendings
  }

  return props.spendings.filter((spending) => {
    return (
      spending.description.toLowerCase().includes(needle) ||
      spending.category.toLowerCase().includes(needle)
    )
  })
})
</script>

<template>
  <section class="ghost-border rounded-card bg-surface-low p-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-2xl font-semibold">Transactions</h2>
      <div class="relative w-full sm:w-72">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          search
        </span>
        <input
          v-model="query"
          class="w-full rounded-control border border-border bg-background py-2.5 pl-10 pr-4 text-text outline-none transition focus:border-primary"
          placeholder="Search..."
          type="search"
        />
      </div>
    </div>

    <div class="scrollbar-thin mt-5 max-h-[31rem] overflow-auto">
      <div v-if="filteredSpendings.length === 0" class="rounded-card border border-dashed border-border p-8 text-center text-muted">
        No transactions found.
      </div>

      <div v-else class="space-y-2">
        <article
          v-for="spending in filteredSpendings"
          :key="spending.id"
          class="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 rounded-control border border-transparent bg-background/60 px-4 py-3 transition hover:border-border hover:bg-surface"
        >
          <div class="grid h-10 w-10 place-items-center rounded-full bg-surface-high text-primary">
            <span class="material-symbols-outlined">{{ categoryIcon(spending.category) }}</span>
          </div>
          <div class="min-w-0">
            <h3 class="truncate font-semibold text-text">{{ spending.description }}</h3>
            <p class="truncate font-mono text-xs text-muted">{{ spending.category }} · {{ spending.date }}</p>
          </div>
          <strong class="font-mono text-danger">{{ formatCurrency(spending.amount) }}</strong>
          <button
            class="grid h-9 w-9 place-items-center rounded-control border border-border text-muted transition hover:border-danger hover:text-danger"
            type="button"
            aria-label="Delete transaction"
            @click="emit('delete', spending.id)"
          >
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </article>
      </div>
    </div>
  </section>
</template>
