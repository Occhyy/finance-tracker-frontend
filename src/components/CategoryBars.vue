<script setup lang="ts">
import { computed } from 'vue'
import { categoryIcon, formatCurrency } from '../format'

const props = defineProps<{
  values: Record<string, number>
}>()

const categories = computed(() => {
  const total = Object.values(props.values).reduce((sum, value) => sum + value, 0)
  return Object.entries(props.values)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({
      name,
      value,
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
    }))
})
</script>

<template>
  <section class="ghost-border rounded-card bg-surface-low p-6">
    <h2 class="text-2xl font-semibold">Category Pulse</h2>
    <div class="mt-5 space-y-4">
      <div v-if="categories.length === 0" class="rounded-card border border-dashed border-border p-8 text-center text-muted">
        Categories appear after your first transaction.
      </div>

      <article v-for="category in categories" v-else :key="category.name">
        <div class="mb-2 flex items-center justify-between gap-4">
          <div class="flex min-w-0 items-center gap-3">
            <span class="material-symbols-outlined text-accent">{{ categoryIcon(category.name) }}</span>
            <span class="truncate font-semibold">{{ category.name }}</span>
          </div>
          <span class="font-mono text-sm text-muted">{{ formatCurrency(category.value) }}</span>
        </div>
        <div class="h-2 rounded-full bg-background">
          <div
            class="h-full rounded-full bg-primary shadow-neon"
            :style="{ width: `${Math.max(category.percent, 6)}%` }"
          />
        </div>
      </article>
    </div>
  </section>
</template>
