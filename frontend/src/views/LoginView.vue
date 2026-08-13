<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { LogIn } from 'lucide-vue-next'
import { useAuthStore } from '../stores'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import AppButton from '../components/common/AppButton.vue'

/**
 * Page de connexion.
 *
 * Apres une connexion reussie, l'utilisateur est redirige vers la
 * page demandee avant la connexion (query ?redirect=...) ou, par
 * defaut, vers le tableau de bord.
 */
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({ email: '', password: '' })

async function handleSubmit() {
  try {
    await authStore.login(form.value.email, form.value.password)
    toast.success('Connexion reussie', { description: `Bienvenue, ${form.value.email}.` })
    router.push(route.query.redirect || { name: 'dashboard' })
  } catch {
    // L'erreur est deja exposee par authStore.error.
  }
}
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0 }" class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 class="text-2xl font-semibold text-slate-900">Se connecter</h1>
      <p class="mt-1 text-slate-500">Accedez a votre espace de gestion.</p>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-sm font-semibold text-slate-700">Adresse e-mail</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="vous@exemple.com"
            required
            class="rounded-md border border-slate-300 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="password" class="text-sm font-semibold text-slate-700">Mot de passe</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="********"
            required
            class="rounded-md border border-slate-300 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
        </div>

        <ErrorMessage v-if="authStore.error" :message="authStore.error" />

        <AppButton type="submit" size="lg" :loading="authStore.loading">
          <LogIn class="h-4 w-4" aria-hidden="true" />
          Se connecter
        </AppButton>
      </form>

      <p class="mt-6 text-center text-sm text-slate-600">
        Pas encore de compte ?
        <RouterLink to="/register" class="font-medium text-brand-600 hover:text-brand-700">Creer un compte</RouterLink>
      </p>
    </div>
  </div>
</template>
