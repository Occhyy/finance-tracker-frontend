<script setup lang="ts">
defineProps<{
  label: string
  value: string
  icon?: string
  tone?: 'primary' | 'danger' | 'accent' | 'neutral'
  subtext?: string
}>()
</script>

<template>
  <section class="ghost-border rounded-card bg-surface-low p-5 shadow-panel">
    <div class="flex items-start justify-between gap-4">
      <p class="font-mono text-xs font-medium uppercase tracking-[0.12em] text-muted">
        {{ label }}
      </p>
      <span
        v-if="icon"
        class="material-symbols-outlined"
        :class="{
          'text-primary': tone === 'primary',
          'text-danger': tone === 'danger',
          'text-accent': tone === 'accent',
          'text-muted': tone === 'neutral' || !tone,
        }"
      >
        {{ icon }}
      </span>
    </div>
    <div class="mt-3 flex items-baseline gap-2">
      <strong
        class="text-4xl font-bold tracking-normal"
        :class="{
          'text-primary': tone === 'primary',
          'text-danger': tone === 'danger',
          'text-accent': tone === 'accent',
          'text-text': tone === 'neutral' || !tone,
        }"
      >
        {{ value }}
      </strong>
      <span v-if="subtext" class="text-sm text-muted">{{ subtext }}</span>
    </div>
  </section>
</template>
