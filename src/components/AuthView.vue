<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from '../auth'
import type { AuthConfig } from '../types'

defineProps<{
  config: AuthConfig | null
}>()

const emit = defineEmits<{
  authenticated: []
}>()

const mode = ref<'sign-in' | 'sign-up'>('sign-in')
const loading = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: '',
})

const title = computed(() => (mode.value === 'sign-in' ? 'Welcome back' : 'Create your account'))
const actionLabel = computed(() => (mode.value === 'sign-in' ? 'Sign in' : 'Create account'))

async function submit(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    if (mode.value === 'sign-in') {
      await signInWithEmail(form.email, form.password)
    } else {
      await signUpWithEmail(form.email, form.password)
    }

    emit('authenticated')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Authentication failed'
  } finally {
    loading.value = false
  }
}

async function googleSignIn(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    await signInWithGoogle()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Google sign-in failed'
    loading.value = false
  }
}
</script>

<template>
  <main class="grid min-h-screen bg-background px-5 py-8 text-text lg:grid-cols-[1fr_32rem] lg:p-8">
    <section class="hidden min-h-[calc(100vh-4rem)] flex-col justify-between rounded-card border border-border bg-surface-low p-8 shadow-panel lg:flex">
      <div>
        <p class="font-mono text-xs uppercase tracking-[0.12em] text-muted">FinanceTracker</p>
        <h1 class="mt-4 max-w-2xl text-6xl font-bold leading-tight text-primary">
          Minimal finance control with Neon-backed identity.
        </h1>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="rounded-card bg-background p-4">
          <span class="material-symbols-outlined text-primary">lock</span>
          <p class="mt-3 font-semibold">Secure sessions</p>
        </div>
        <div class="rounded-card bg-background p-4">
          <span class="material-symbols-outlined text-accent">database</span>
          <p class="mt-3 font-semibold">Neon Postgres</p>
        </div>
        <div class="rounded-card bg-background p-4">
          <span class="material-symbols-outlined text-danger">monitoring</span>
          <p class="mt-3 font-semibold">Live insights</p>
        </div>
      </div>
    </section>

    <section class="mx-auto flex w-full max-w-md flex-col justify-center">
      <div class="ghost-border rounded-card bg-surface-low p-6 shadow-panel">
        <p class="font-mono text-xs uppercase tracking-[0.12em] text-muted">
          {{ config?.auth_required ? 'Neon Auth' : 'Local auth disabled' }}
        </p>
        <h2 class="mt-2 text-3xl font-bold">{{ title }}</h2>
        <p class="mt-2 text-muted">
          {{ mode === 'sign-in' ? 'Sign in to sync your transactions.' : 'Create an account to start tracking.' }}
        </p>

        <button
          class="mt-6 flex w-full items-center justify-center gap-2 rounded-control border border-border bg-background px-4 py-3 font-semibold text-text transition hover:border-primary hover:text-primary"
          type="button"
          :disabled="loading"
          @click="googleSignIn"
        >
          <span class="material-symbols-outlined">account_circle</span>
          Continue with Google
        </button>

        <div class="my-6 flex items-center gap-3">
          <div class="h-px flex-1 bg-border" />
          <span class="font-mono text-xs text-muted">or</span>
          <div class="h-px flex-1 bg-border" />
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <label class="block">
            <span class="font-mono text-xs uppercase tracking-[0.12em] text-muted">Email</span>
            <input
              v-model="form.email"
              class="mt-2 w-full rounded-control border border-border bg-background px-4 py-3 text-text outline-none transition focus:border-primary"
              autocomplete="email"
              required
              type="email"
            />
          </label>

          <label class="block">
            <span class="font-mono text-xs uppercase tracking-[0.12em] text-muted">Password</span>
            <input
              v-model="form.password"
              class="mt-2 w-full rounded-control border border-border bg-background px-4 py-3 text-text outline-none transition focus:border-primary"
              :autocomplete="mode === 'sign-in' ? 'current-password' : 'new-password'"
              minlength="8"
              required
              type="password"
            />
          </label>

          <p v-if="error" class="rounded-control border border-danger bg-danger-deep/25 px-3 py-2 text-sm text-danger">
            {{ error }}
          </p>

          <button
            class="flex w-full items-center justify-center gap-2 rounded-control bg-primary px-4 py-3 font-bold text-primary-dark shadow-neon transition hover:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
            type="submit"
            :disabled="loading"
          >
            <span class="material-symbols-outlined">{{ mode === 'sign-in' ? 'login' : 'person_add' }}</span>
            {{ loading ? 'Working...' : actionLabel }}
          </button>
        </form>

        <button
          class="mt-5 w-full text-center text-sm text-muted transition hover:text-primary"
          type="button"
          @click="mode = mode === 'sign-in' ? 'sign-up' : 'sign-in'"
        >
          {{
            mode === 'sign-in'
              ? "Don't have an account? Create one"
              : 'Already have an account? Sign in'
          }}
        </button>
      </div>
    </section>
  </main>
</template>
