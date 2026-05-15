<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { Category, SpendingInput } from '../types'

const emit = defineEmits<{
  submit: [value: SpendingInput]
}>()

const categories: Category[] = [
  'Uncategorised',
  'Food & Drink',
  'Transport',
  'Shopping',
  'Entertainment',
  'Health',
  'Bills',
  'Other',
]

const form = reactive<SpendingInput>({
  description: '',
  amount: 0,
  category: 'Uncategorised',
})
const amountText = ref('')

function submitForm(): void {
  const amount = Number(amountText.value)
  if (!form.description.trim() || !Number.isFinite(amount) || amount <= 0) {
    return
  }

  emit('submit', {
    description: form.description.trim(),
    amount,
    category: form.category,
  })

  form.description = ''
  amountText.value = ''
  form.category = 'Uncategorised'
}
</script>

<template>
  <section class="ghost-border rounded-card bg-surface-low p-6">
    <h2 class="flex items-center gap-2 text-2xl font-semibold">
      <span class="material-symbols-outlined text-primary">add_circle</span>
      Add Spending
    </h2>

    <form class="mt-6 space-y-4" @submit.prevent="submitForm">
      <label class="block">
        <span class="font-mono text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Description
        </span>
        <input
          v-model="form.description"
          class="mt-2 w-full rounded-control border border-border bg-background px-4 py-3 text-text outline-none transition focus:border-primary"
          maxlength="120"
          placeholder="e.g. Coffee"
          type="text"
        />
      </label>

      <label class="block">
        <span class="font-mono text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Amount
        </span>
        <input
          v-model="amountText"
          class="mt-2 w-full rounded-control border border-border bg-background px-4 py-3 text-text outline-none transition focus:border-primary"
          min="0.01"
          placeholder="0.00"
          step="0.01"
          type="number"
        />
      </label>

      <label class="block">
        <span class="font-mono text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Category
        </span>
        <select
          v-model="form.category"
          class="mt-2 w-full rounded-control border border-border bg-background px-4 py-3 text-text outline-none transition focus:border-primary"
        >
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </label>

      <button
        class="flex w-full items-center justify-center gap-2 rounded-control bg-primary px-4 py-3 font-bold text-primary-dark shadow-neon transition hover:scale-[0.99] hover:opacity-90"
        type="submit"
      >
        <span class="material-symbols-outlined">add</span>
        New Transaction
      </button>
    </form>
  </section>
</template>
