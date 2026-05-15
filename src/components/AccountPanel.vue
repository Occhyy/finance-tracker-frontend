<script setup lang="ts">
import { authUser, signOut } from '../auth'
import type { AuthConfig } from '../types'

defineProps<{
  config: AuthConfig | null
}>()

const emit = defineEmits<{
  signedOut: []
}>()

async function handleSignOut(): Promise<void> {
  await signOut()
  emit('signedOut')
}
</script>

<template>
  <section class="ghost-border rounded-card bg-surface-low p-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="font-mono text-xs uppercase tracking-[0.12em] text-muted">Account</p>
        <h2 class="mt-2 text-2xl font-semibold">{{ authUser?.email ?? 'Signed in' }}</h2>
      </div>
      <span class="rounded-pill bg-primary px-3 py-1 font-mono text-xs text-primary-dark">
        {{ config?.auth_required ? 'Neon Auth' : 'Local mode' }}
      </span>
    </div>

    <div class="mt-5 rounded-control bg-background p-4">
      <p class="font-mono text-xs text-muted">Auth base URL</p>
      <p class="mt-1 break-all text-sm text-text">{{ config?.base_url ?? 'Not configured' }}</p>
    </div>

    <button
      class="mt-5 inline-flex items-center gap-2 rounded-control border border-border px-4 py-2.5 font-semibold text-muted transition hover:border-danger hover:text-danger"
      type="button"
      @click="handleSignOut"
    >
      <span class="material-symbols-outlined">logout</span>
      Sign out
    </button>
  </section>
</template>
