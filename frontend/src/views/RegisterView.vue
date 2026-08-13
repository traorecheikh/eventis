<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { UserPlus, CalendarCog, User } from 'lucide-vue-next'
import { useAuthStore } from '../stores'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import AppButton from '../components/common/AppButton.vue'

/**
 * Page d'inscription (creation de compte).
 *
 * Le role determine les droits du compte : "organisateur" peut
 * creer des evenements, "participant" peut s'inscrire aux
 * evenements (apres creation de son profil participant, voir
 * ParticipantProfileView).
 */
const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  passwordConfirm: '',
  role: 'participant'
})

async function handleSubmit() {
  if (form.value.password !== form.value.passwordConfirm) {
    authStore.error = 'Les mots de passe ne correspondent pas.'
    return
  }
  if (!form.value.password || form.value.password.length < 8) {
    authStore.error = 'Le mot de passe doit contenir au moins 8 caracteres.'
    return
  }

  try {
    await authStore.register({
      email: form.value.email.trim(),
      password: form.value.password,
      role: form.value.role
    })
    toast.success('Compte cree avec succes', { description: 'Bienvenue sur EventHub.' })
    router.push({ name: 'dashboard' })
  } catch {
    // L'erreur est deja exposee par authStore.error.
  }
}
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0 }" class="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 class="text-2xl font-semibold text-slate-900">Creer un compte</h1>
      <p class="mt-1 text-slate-500">Rejoignez EventHub pour gerer ou suivre des evenements.</p>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="handleSubmit">
        <fieldset class="flex flex-col gap-2">
          <legend class="text-sm font-semibold text-slate-700">Vous etes</legend>
          <div class="grid grid-cols-2 gap-3">
            <label
              class="flex cursor-pointer flex-col items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors"
              :class="form.role === 'participant' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'"
            >
              <input v-model="form.role" type="radio" value="participant" class="sr-only">
              <User class="h-5 w-5" aria-hidden="true" />
              Participant
            </label>
            <label
              class="flex cursor-pointer flex-col items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors"
              :class="form.role === 'organisateur' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'"
            >
              <input v-model="form.role" type="radio" value="organisateur" class="sr-only">
              <CalendarCog class="h-5 w-5" aria-hidden="true" />
              Organisateur
            </label>
          </div>
        </fieldset>

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

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="password" class="text-sm font-semibold text-slate-700">Mot de passe</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="8 caracteres minimum"
              required
              class="rounded-md border border-slate-300 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="passwordConfirm" class="text-sm font-semibold text-slate-700">Confirmer</label>
            <input
              id="passwordConfirm"
              v-model="form.passwordConfirm"
              type="password"
              placeholder="********"
              required
              class="rounded-md border border-slate-300 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
          </div>
        </div>

        <ErrorMessage v-if="authStore.error" :message="authStore.error" />

        <AppButton type="submit" size="lg" :loading="authStore.loading">
          <UserPlus class="h-4 w-4" aria-hidden="true" />
          Creer mon compte
        </AppButton>
      </form>

      <p class="mt-6 text-center text-sm text-slate-600">
        Deja un compte ?
        <RouterLink to="/login" class="font-medium text-brand-600 hover:text-brand-700">Se connecter</RouterLink>
      </p>
    </div>
  </div>
</template>
