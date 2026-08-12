<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores'
import ErrorMessage from '../components/common/ErrorMessage.vue'

/**
 * Page de connexion.
 *
 * La logique d'authentification est déléguée au authStore
 * (architecture View → Component → Store → Service API Axios).
 *
 * Après une connexion réussie, l'utilisateur est redirigé vers la
 * page demandée avant la connexion (query ?redirect=…) ou, par
 * défaut, vers le tableau de bord.
 */
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

async function handleSubmit() {
  await authStore.login(form.value.email, form.value.password)

  if (authStore.isAuthenticated) {
    const redirect = route.query.redirect || { name: 'dashboard' }
    router.push(redirect)
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Se connecter</h1>
      <p class="note">
        Accédez à votre espace de gestion.
      </p>

      <form
        class="auth-form"
        @submit.prevent="handleSubmit"
      >
        <div class="form-group">
          <label for="email">Adresse e-mail</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="vous@exemple.com"
            required
          >
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
          >
        </div>

        <ErrorMessage
          v-if="authStore.error"
          :message="authStore.error"
        />

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Connexion en cours…' : 'Se connecter' }}
        </button>
      </form>

      <p class="auth-switch">
        Pas encore de compte ?
        <RouterLink to="/register">
          Créer un compte
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.auth-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

h1 {
  font-size: 1.75rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.note {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

input {
  padding: 0.625rem 0.875rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #2563eb;
}

.form-error {
  color: #dc2626;
  font-size: 0.875rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 0.625rem;
  border-radius: 0.375rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.auth-switch {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #475569;
}
</style>
